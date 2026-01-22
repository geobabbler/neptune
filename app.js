const express = require('express');
const https = require('https');
const axios = require('axios');
const xml2js = require('xml2js');
const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const { Builder } = require('xml2js');
const schedule = require('node-schedule');
const ejs = require('ejs');
const RSS = require('rss');
const { decode } = require('html-entities');

// MCP Server imports
const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StreamableHTTPServerTransport } = require('@modelcontextprotocol/sdk/server/streamableHttp.js');
const {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} = require('@modelcontextprotocol/sdk/types.js');
const mcpHelpers = require('./mcp-helpers.js');

const app = express();
const port = 8080;

// Add EJS configuration
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware for parsing JSON (needed for MCP messages)
app.use(express.json());

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Directory for cache and output
const cacheDir = path.join(__dirname, 'cache');
const outputDir = path.join(__dirname, 'output');

// Ensure directories exist
if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

// Utility function to fetch and cache feeds
//'Neptune Feed Aggregator/1.0'
const fetchAndCacheFeed = async (url, cachePath) => {
  try {
    const response = await axios.get(url, {
      timeout: 10000, // 10 second timeout
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0',
        'Accept': 'application/rss+xml, application/xml, application/atom+xml, text/xml, */*'
      },
      maxRedirects: 5
    });
    fs.writeFileSync(cachePath, response.data.replace('xmlns:media=&quot;http://search.yahoo.com/mrss/&quot;', 'xmlns:media="http://search.yahoo.com/mrss/"'), 'utf8');
    return response.data.replace('xmlns:media=&quot;http://search.yahoo.com/mrss/&quot;', 'xmlns:media="http://search.yahoo.com/mrss/"');
  } catch (error) {
    console.error(`Error fetching feed from ${url}:`, error.message);
    // If cache exists, return cached data as fallback
    if (fs.existsSync(cachePath)) {
      console.log(`Using cached data for ${url}`);
      return fs.readFileSync(cachePath, 'utf8');
    }
    return null;
  }
};

// Parse OPML to extract feed metadata (URL + optional defaults)
const parseOPML = (opmlContent) => {
  const feeds = [];
  xml2js.parseString(opmlContent, (err, result) => {
    if (err) throw err;
    const outlines = result.opml.body[0].outline;
    outlines.forEach((outline) => {
      if (outline['$'] && outline['$'].xmlUrl) {
        feeds.push({
          url: outline['$'].xmlUrl,
          title: outline['$'].title || outline['$'].text || 'Untitled',
          description: outline['$'].description || '',
          // Optional per-feed default image, from OPML
          defaultImageUrl: outline['$'].defaultImageUrl || null,
        });
      }
    });
  });
  return feeds;
};

// Minimal content filtering (strip HTML tags from titles)
const filterFeedContent = (feedXml) => {
  const $ = cheerio.load(feedXml, { xmlMode: true });
  $('title').each((_, elem) => {
    const text = $(elem).text();
    $(elem).text(text.replace(/<[^>]+>/g, ''));
  });
  return $.xml();
};

// Aggregate and render feeds
const renderFeeds = (rssFeed) => {
  return new Promise((resolve, reject) => {
    xml2js.parseString(rssFeed, (err, result) => {
      if (err) reject(err);

      const items = result.rss.channel[0].item || [];
      const feedItems = items.map((item) => {
        // Extract enclosure image URL if present
        let imageUrl = null;
        if (item.enclosure && Array.isArray(item.enclosure)) {
          const enclosure = item.enclosure[0]; // Take first enclosure
          const type = enclosure.$.type || enclosure.type || '';
          if (type.startsWith('image/')) {
            imageUrl = enclosure.$.url || enclosure.url || '';
          }
        }
        
        return {
          title: item.title ? item.title[0] : 'No title',
          description: item.description ? item.description[0] : 'No description',
          link: item.link ? item.link[0] : '#',
          pubDate: item.pubDate ? item.pubDate[0] : 'Unknown date',
          source: item.source ? item.source[0]._ : 'Unknown source',
          author: item.author ? item.author[0] :
            item['dc:creator'] ? item['dc:creator'][0] : null,
          imageUrl: imageUrl || null
        };
      });

      // Sort items by publication date (newest first)
      feedItems.sort((a, b) => {
        const dateA = new Date(a.pubDate);
        const dateB = new Date(b.pubDate);
        return dateB - dateA;
      });

      resolve(feedItems);
    });
  });
};

// Main aggregation function
const aggregateFeeds = async (useCache = true, lastRefreshTime = null) => {
  try {
    const opmlFile = path.join(__dirname, 'feeds.opml');
    const opmlContent = fs.readFileSync(opmlFile, 'utf8');
    const feeds = parseOPML(opmlContent);

    const aggregatedFeeds = [];

    for (const feed of feeds) {
      const url = feed.url;
      const defaultImageUrl = feed.defaultImageUrl || null;

      const cachePath = path.join(cacheDir, `${Buffer.from(url).toString('hex')}.xml`);
      let feedData;

      if (useCache && fs.existsSync(cachePath)) {
        feedData = fs.readFileSync(cachePath, 'utf8');
      } else {
        feedData = await fetchAndCacheFeed(url, cachePath);
      }

      if (feedData) {
        const filteredData = filterFeedContent(feedData);
        const parsedFeed = await xml2js.parseStringPromise(filteredData);

        // Determine feed type and extract items
        const feedInfo = parseFeedItems(parsedFeed);

        if (feedInfo && feedInfo.items.length > 0) {
          // Apply OPML-level default image URL as the last fallback per item
          if (defaultImageUrl && isValidImageUrl(defaultImageUrl)) {
            feedInfo.items = feedInfo.items.map((item) => ({
              ...item,
              imageUrl: item.imageUrl || defaultImageUrl,
            }));
          }

          aggregatedFeeds.push(feedInfo);
        }
      }
    }

    // Generate RSS output
    const rssFeed = await generateRSSFeed(aggregatedFeeds);
    const rssFile = path.join(outputDir, 'aggregated.xml');
    fs.writeFileSync(rssFile, rssFeed);

    // Generate HTML output based on the generated RSS feed
    const feedItems = await renderFeeds(rssFeed);
    const html = await ejs.renderFile(
      path.join(__dirname, 'views', 'feeds.ejs'),
      { items: feedItems }
    );
    const outputFile = path.join(outputDir, 'aggregated.html');
    fs.writeFileSync(outputFile, html);

    console.log('Aggregation completed successfully.');
  } catch (error) {
    console.error('Error during aggregation:', error);
  }
};

const summarizeText = (text, maxLength) => {
  // Remove HTML tags
  text = text.replace(/<[^>]*>/g, '');

  // Decode HTML entities using html-entities
  text = decode(text);

  if (text.length <= maxLength) {
    return text;
  }

  let truncatedText = text.substring(0, maxLength);
  let lastSpaceIndex = truncatedText.lastIndexOf(" ");

  if (lastSpaceIndex > 0) {
    truncatedText = truncatedText.substring(0, lastSpaceIndex);
  }

  return truncatedText + "...";
};

// Helper function to validate image URL format and extension
const isValidImageUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  
  try {
    // Validate URL format
    const urlObj = new URL(url);
    
    // Check for image file extensions
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.ico'];
    const pathname = urlObj.pathname.toLowerCase();
    const hasImageExtension = imageExtensions.some(ext => pathname.endsWith(ext));
    
    // Also check if URL contains common image path patterns
    const hasImagePattern = /\.(jpg|jpeg|png|gif|webp|svg|bmp|ico)(\?|$)/i.test(url);
    
    return hasImageExtension || hasImagePattern;
  } catch (e) {
    // Invalid URL format
    return false;
  }
};

// Helper function to convert relative URL to absolute
const resolveImageUrl = (imageUrl, baseUrl) => {
  if (!imageUrl) return null;
  
  try {
    // If already absolute, return as-is
    new URL(imageUrl);
    return imageUrl;
  } catch (e) {
    // Relative URL - try to resolve using baseUrl
    if (baseUrl) {
      try {
        const base = new URL(baseUrl);
        return new URL(imageUrl, base).toString();
      } catch (e2) {
        // Can't resolve, return null
        return null;
      }
    }
    return null;
  }
};

// Helper function to extract image URL from HTML content
const extractImageFromHtml = (htmlContent, baseUrl) => {
  if (!htmlContent || typeof htmlContent !== 'string') return null;
  
  try {
    const $ = cheerio.load(htmlContent);
    
    // Priority 1: Look for og:image meta tag
    const ogImage = $('meta[property="og:image"]').attr('content') || 
                    $('meta[name="og:image"]').attr('content');
    if (ogImage) {
      const resolved = resolveImageUrl(ogImage, baseUrl);
      if (resolved && isValidImageUrl(resolved)) {
        return resolved;
      }
    }
    
    // Priority 2: Look for first img tag
    const firstImg = $('img').first();
    if (firstImg.length > 0) {
      const imgSrc = firstImg.attr('src') || firstImg.attr('data-src');
      if (imgSrc) {
        const resolved = resolveImageUrl(imgSrc, baseUrl);
        if (resolved && isValidImageUrl(resolved)) {
          return resolved;
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error extracting image from HTML:', error);
    return null;
  }
};

// Helper function to extract featured image URL from feed item
// Priority order:
// 1. RSS enclosure (if type is image)
// 2. og:image as direct RSS element
// 3. RSS/Atom media:thumbnail or media:content
// 4. First img tag from HTML description
// 5. og:image from HTML description
const extractImageUrl = (item, itemLink, description) => {
  try {
    // Priority 1: RSS enclosure (if type is image)
    if (item.enclosure && Array.isArray(item.enclosure)) {
      for (const enclosure of item.enclosure) {
        const type = enclosure.$.type || enclosure.type || '';
        if (type.startsWith('image/')) {
          const url = enclosure.$.url || enclosure.url || '';
          if (url && isValidImageUrl(url)) {
            return url;
          }
        }
      }
    }
    
    // Priority 2: og:image as direct RSS element
    if (item['og:image']) {
      let ogImageUrl = null;
      if (Array.isArray(item['og:image'])) {
        // Could be text content or an object with attributes
        const ogImage = item['og:image'][0];
        ogImageUrl = typeof ogImage === 'string' ? ogImage : 
                     ogImage._ || ogImage.$?.url || ogImage.url || ogImage.content;
      } else if (typeof item['og:image'] === 'string') {
        ogImageUrl = item['og:image'];
      } else {
        ogImageUrl = item['og:image']._ || item['og:image'].$?.url || item['og:image'].url || item['og:image'].content;
      }
      
      if (ogImageUrl) {
        const resolved = resolveImageUrl(ogImageUrl, itemLink);
        if (resolved && isValidImageUrl(resolved)) {
          return resolved;
        }
      }
    }
    
    // Priority 3: RSS/Atom media:thumbnail or media:content
    // Check media:thumbnail first (usually the featured image)
    if (item['media:thumbnail'] && Array.isArray(item['media:thumbnail'])) {
      const thumbnail = item['media:thumbnail'][0];
      const url = thumbnail.$.url || thumbnail.url || '';
      if (url && isValidImageUrl(url)) {
        return url;
      }
    }
    
    // Check media:content for images
    if (item['media:content'] && Array.isArray(item['media:content'])) {
      for (const content of item['media:content']) {
        const medium = content.$.medium || content.medium || '';
        const type = content.$.type || content.type || '';
        if (medium === 'image' || type.startsWith('image/')) {
          const url = content.$.url || content.url || '';
          if (url && isValidImageUrl(url)) {
            return url;
          }
        }
      }
    }
    
    // Priority 4 & 5: Extract from HTML description
    // This handles both img tags and og:image meta tags
    if (description) {
      const imageUrl = extractImageFromHtml(description, itemLink);
      if (imageUrl) {
        return imageUrl;
      }

      // Final fallback: scan for any image-like URL in the text/HTML
      try {
        const urlRegex = /https?:\/\/[^\s"'<>]+/g;
        const matches = description.match(urlRegex) || [];
        for (let raw of matches) {
          // Strip common trailing punctuation that might be attached in text
          const cleaned = raw.replace(/[),.]+$/, '');
          if (cleaned && isValidImageUrl(cleaned)) {
            const resolved = resolveImageUrl(cleaned, itemLink);
            if (resolved && isValidImageUrl(resolved)) {
              return resolved;
            }
          }
        }
      } catch (e) {
        // Ignore fallback parsing errors
      }
    }
    
    return null;
  } catch (error) {
    // Log warning but don't fail the entire item
    console.warn('Error extracting image URL (continuing without image):', error.message);
    return null;
  }
};

// Helper function to parse both RSS and Atom feeds
const parseFeedItems = (parsedFeed) => {
  try {
    // Calculate date 12 months ago
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    // Check if it's an Atom feed
    if (parsedFeed.feed) {
      const feed = parsedFeed.feed;
      const feedTitle = feed.title ? feed.title[0]._ || feed.title[0] : 'Untitled Feed';
      const feedLink = feed.link.href ? feed.link[0].href || feed.link[0].href : '/list';

      const items = feed.entry ? feed.entry
        .filter(entry => {
          const pubDate = new Date(entry.updated ? entry.updated[0] : entry.published ? entry.published[0] : 0);
          return pubDate > twelveMonthsAgo;
        })
        .map(entry => {
          const entryLink = entry.link ? entry.link.find(l => l.$.rel === 'alternate')?.$.href || entry.link[0].$.href : '';
          const entryDescription = entry.content ? entry.content[0]._ || entry.content[0] :
            entry.summary ? entry.summary[0]._ || entry.summary[0] : '';
          
          // Extract featured image
          const imageUrl = extractImageUrl(entry, entryLink, entryDescription);
          
          return {
            title: entry.title ? entry.title[0]._ || entry.title[0] : 'Untitled',
            description: summarizeText(entryDescription, 1000),
            link: entryLink,
            pubDate: entry.updated ? entry.updated[0] : entry.published ? entry.published[0] : new Date().toISOString(),
            source: feedTitle,
            sourceLink: feedLink,
            imageUrl: imageUrl || null,
            original: entry
          };
        }) : [];

      return { title: feedTitle, items };
    }

    // Handle RSS feed
    if (parsedFeed.rss && parsedFeed.rss.channel) {
      const channel = parsedFeed.rss.channel[0];
      const feedTitle = channel.title[0];
      const feedLink = channel.link[0];

      const items = channel.item ? channel.item
        .filter(item => {
          const pubDate = new Date(item.pubDate ? item.pubDate[0] : item.date ? item.date[0] : 0);
          return pubDate > twelveMonthsAgo;
        })
        .map(item => {
          const itemLink = item.link ? item.link[0] : '';

          // Prefer full HTML content when available (e.g., WordPress content:encoded),
          // fall back to description otherwise.
          const rawContent = item['content:encoded']
            ? (item['content:encoded'][0]._ || item['content:encoded'][0] || '')
            : (item.description ? item.description[0] : '');

          // Extract featured image from the best HTML source we have
          const imageUrl = extractImageUrl(item, itemLink, rawContent);

          // Use the same HTML source for summarization
          const summarizedDescription = summarizeText(rawContent, 1000);
          
          return {
            title: item.title ? item.title[0] : 'Untitled',
            description: summarizedDescription,
            link: itemLink,
            pubDate: item.pubDate ? item.pubDate[0] : item.date ? item.date[0] : new Date().toUTCString(),
            source: feedTitle,
            sourceLink: feedLink.toString(),
            imageUrl: imageUrl || null,
            original: item
          };
        }) : [];

      return { title: feedTitle, items };
    }

    // Handle RDF (RSS 1.0) feed
    if (parsedFeed['rdf:RDF']) {
      const rdf = parsedFeed['rdf:RDF'];
      const channel = rdf.channel[0];
      const feedTitle = channel.title[0];
      const feedLink = channel.link[0];
      const items = rdf.item ? rdf.item
        .filter(item => {
          const pubDate = new Date(item['dc:date'] ? item['dc:date'][0] : 0);
          return pubDate > twelveMonthsAgo;
        })
        .map(item => {
          const itemLink = item.link ? item.link[0] : '';
          const itemDescription = item.description ? item.description[0] : '';
          
          // Extract featured image
          const imageUrl = extractImageUrl(item, itemLink, itemDescription);
          
          return {
            title: item.title ? item.title[0] : 'Untitled',
            description: summarizeText(itemDescription, 1000),
            link: itemLink,
            pubDate: item['dc:date'] ? item['dc:date'][0] : new Date().toUTCString(),
            source: feedTitle,
            sourceLink: feedLink.toString(),
            imageUrl: imageUrl || null,
            original: item
          };
        }) : [];

      return { title: feedTitle, items };
    }

    return null;
  } catch (error) {
    console.error('Error parsing feed:', error);
    return null;
  }
};

// Generate aggregated RSS feed
const generateRSSFeed = async (feeds) => {
  // Flatten all items and remove duplicates based on link
  const allItems = feeds.flatMap(feed => feed.items);
  const uniqueItems = allItems.filter((item, index, self) =>
    index === self.findIndex((t) => t.link === item.link)
  );

  // Sort by publication date (newest first)
  uniqueItems.sort((a, b) => {
    const dateA = a.original.pubDate ? new Date(a.original.pubDate[0]) : new Date(0);
    const dateB = b.original.pubDate ? new Date(b.original.pubDate[0]) : new Date(0);
    return dateB - dateA;
  });

  // Generate RSS using EJS template
  return await ejs.renderFile(
    path.join(__dirname, 'views', 'rss.ejs'),
    { items: uniqueItems }
  );
};

// Schedule aggregation at the 5th minute of every hour
schedule.scheduleJob('*/15 * * * *', () => {
  console.log('Scheduled aggregation job started at:', new Date().toLocaleString());
  aggregateFeeds(false);
});

// Rebuild method to forcefully regenerate feeds without using cache
app.post('/rebuild', async (req, res) => {
  try {
    console.log('Rebuild triggered: Regenerating feeds from source.');
    await aggregateFeeds(false);
    res.status(200).send('Rebuild completed successfully.');
  } catch (error) {
    console.error('Error during rebuild:', error.message);
    res.status(500).send('Error during rebuild.');
  }
});

// Endpoint to serve the aggregated HTML
app.get('/view', async (req, res) => {
  try {
    const rssFile = path.join(outputDir, 'aggregated.xml');
    if (!fs.existsSync(rssFile)) {
      return res.status(500).send('Aggregated RSS feed is not available.');
    }

    const rssFeed = fs.readFileSync(rssFile, 'utf8');
    const feedItems = await renderFeeds(rssFeed);
    res.render('feeds', { items: feedItems });
  } catch (error) {
    console.error('Error rendering feeds:', error);
    res.status(500).send('Error rendering feeds.');
  }
});

// Endpoint to serve the aggregated RSS feed
app.get('/feed', async (req, res) => {
  try {

    const rssFile = path.join(outputDir, 'aggregated.xml');
    if (!fs.existsSync(rssFile)) {
      return res.status(404).send('Feed not found.');
    }

    res.set('Content-Type', 'application/xml');
    res.send(fs.readFileSync(rssFile, 'utf8'));
  } catch (error) {
    console.error('Error serving RSS feed:', error);
    res.status(500).send('Error serving RSS feed.');
  }
});

// Initial rebuild to ensure feeds are up to date
(async () => {
  console.log('Initial rebuild on startup...');
  await aggregateFeeds(false);
})();

// Add this function to parse OPML and return feed info
const getFeedList = async () => {
  const opmlFile = path.join(__dirname, 'feeds.opml');
  const opmlContent = fs.readFileSync(opmlFile, 'utf8');
  const parser = new xml2js.Parser();

  try {
    const opmlData = await parser.parseStringPromise(opmlContent);
    const outlines = opmlData.opml.body[0].outline;
    return outlines
      .map(outline => ({
        title: outline.$.title || outline.$.text,
        xmlUrl: outline.$.htmlUrl || outline.$.xmlUrl
      }))
      .sort((a, b) => a.title.localeCompare(b.title)); // Sort alphabetically
  } catch (error) {
    console.error('Error parsing OPML:', error);
    return [];
  }
};

// Update the endpoint to handle async function
app.get('/list', async (req, res) => {
  try {
    const feeds = await getFeedList();
    const html = await ejs.renderFile(
      path.join(__dirname, 'views', 'list.ejs'),
      { feeds }
    );
    res.send(html);
  } catch (error) {
    console.error('Error generating feed list:', error);
    res.status(500).send('Error generating feed list');
  }
});

// Add this route at the top of your route definitions
app.get('/', (req, res) => {
  res.redirect(301, '/view');
});

// Add near other endpoints
app.get('/version', (req, res) => {
    const packageJson = require('./package.json');
    res.json({
        name: packageJson.name,
        version: packageJson.version,
        description: packageJson.description
    });
});

// ============================================================================
// MCP Server Setup (Streamable HTTP Transport)
// ============================================================================

// Initialize MCP Server
const mcpServer = new Server(
  {
    name: 'neptune-feed-cache',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List available tools
mcpServer.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'list_cached_feeds',
        description: 'List all feeds that are currently cached, including their titles, URLs, and item counts.',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'get_feed_items',
        description: 'Get all items from a specific cached feed by its URL.',
        inputSchema: {
          type: 'object',
          properties: {
            feedUrl: {
              type: 'string',
              description: 'The URL of the feed to retrieve items from',
            },
            limit: {
              type: 'number',
              description: 'Maximum number of items to return (default: 50)',
            },
          },
          required: ['feedUrl'],
        },
      },
      {
        name: 'search_feed_items',
        description: 'Search across all cached feeds for items matching a query string. Supports multi-term search (AND/OR), field-specific queries (title:term), quoted phrases, fuzzy matching, date ranges, and feed filtering. Results are relevance-scored and sorted by relevance then date. IMPORTANT: When users provide natural language dates (e.g., "Q3 2025", "last month"), convert them to ISO 8601 format (YYYY-MM-DD) before using dateFrom/dateTo parameters.',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Search query string. Supports: multi-term (AND/OR), field-specific (title:term, description:term, source:term), quoted phrases ("exact phrase"), and boolean operators (AND, OR). Default is AND logic.',
            },
            limit: {
              type: 'number',
              description: 'Maximum number of results to return (default: 20)',
            },
            useWordBoundary: {
              type: 'boolean',
              description: 'Use word boundary matching instead of substring matching (default: true)',
            },
            fuzzyTolerance: {
              type: 'number',
              description: 'Fuzzy matching tolerance (Levenshtein distance, 0-2). 0 = exact only, 1 = allow 1 char difference, 2 = allow 2 char difference (default: 1)',
            },
            dateFrom: {
              type: 'string',
              description: `Filter results from this date. Must be in ISO 8601 format (YYYY-MM-DD).

IMPORTANT: If the user provides natural language dates (e.g., "Q3 2025", "last month", "last 7 days"), you MUST convert them to ISO 8601 format before calling this tool.

Examples of conversions:
- "Q3 2025" → "2025-07-01" (first day of Q3)
- "Q1 2026" → "2026-01-01" (first day of Q1)
- "last 7 days" → Calculate 7 days ago from today (e.g., "2026-01-15")
- "last month" → First day of previous month (e.g., "2025-12-01")
- "this month" → First day of current month (e.g., "2026-01-01")
- "today" → Current date (e.g., "2026-01-22")
- "yesterday" → Previous day (e.g., "2026-01-21")

Always provide dates in YYYY-MM-DD format.`,
            },
            dateTo: {
              type: 'string',
              description: `Filter results until this date. Must be in ISO 8601 format (YYYY-MM-DD).

IMPORTANT: If the user provides natural language dates (e.g., "Q3 2025", "end of month"), you MUST convert them to ISO 8601 format before calling this tool.

Examples of conversions:
- "Q3 2025" → "2025-09-30" (last day of Q3)
- "Q1 2026" → "2026-03-31" (last day of Q1)
- "last 7 days" → Today's date (e.g., "2026-01-22")
- "this month" → Last day of current month (e.g., "2026-01-31")
- "today" → Current date (e.g., "2026-01-22")
- "yesterday" → Previous day (e.g., "2026-01-21")

Always provide dates in YYYY-MM-DD format.`,
            },
            feedUrls: {
              type: 'array',
              items: { type: 'string' },
              description: 'Filter to specific feed URLs only. If not provided, searches all feeds.',
            },
            perFeedLimit: {
              type: 'number',
              description: 'Maximum results per feed before merging (default: 10). Higher values improve recall but may slow search.',
            },
          },
          required: ['query'],
        },
      },
      {
        name: 'get_aggregated_feed',
        description: 'Get the aggregated feed from the output directory (all feeds combined).',
        inputSchema: {
          type: 'object',
          properties: {
            limit: {
              type: 'number',
              description: 'Maximum number of items to return (default: 50)',
            },
          },
        },
      },
    ],
  };
});

// Handle tool calls
mcpServer.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const opmlFile = path.join(__dirname, 'feeds.opml');

  try {
    switch (name) {
      case 'list_cached_feeds': {
        const feeds = await mcpHelpers.getAllCachedFeeds(cacheDir, opmlFile);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(feeds, null, 2),
            },
          ],
        };
      }

      case 'get_feed_items': {
        const { feedUrl, limit = 50 } = args;
        const cachePath = mcpHelpers.getCachePath(cacheDir, feedUrl);
        const parsedFeed = await mcpHelpers.parseCachedFeed(cachePath);
        
        if (!parsedFeed) {
          return {
            content: [
              {
                type: 'text',
                text: `Feed not found in cache: ${feedUrl}`,
              },
            ],
            isError: true,
          };
        }

        const feedInfo = mcpHelpers.extractFeedItems(parsedFeed);
        if (!feedInfo) {
          return {
            content: [
              {
                type: 'text',
                text: `Could not parse feed: ${feedUrl}`,
              },
            ],
            isError: true,
          };
        }

        const items = feedInfo.items.slice(0, limit);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                feed: {
                  title: feedInfo.title,
                  link: feedInfo.link,
                },
                items: items,
                totalItems: feedInfo.items.length,
                returnedItems: items.length,
              }, null, 2),
            },
          ],
        };
      }

      case 'search_feed_items': {
        const {
          query,
          limit = 20,
          useWordBoundary = true,
          fuzzyTolerance = 1,
          dateFrom = null,
          dateTo = null,
          feedUrls = null,
          perFeedLimit = 10
        } = args;

        const searchResult = await mcpHelpers.searchCachedFeeds(
          cacheDir,
          opmlFile,
          query,
          limit,
          {
            useWordBoundary,
            fuzzyTolerance: Math.max(0, Math.min(2, fuzzyTolerance)), // Clamp between 0-2
            dateFrom,
            dateTo,
            feedUrls,
            perFeedLimit
          }
        );

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(searchResult, null, 2),
            },
          ],
        };
      }

      case 'get_aggregated_feed': {
        const { limit = 50 } = args;
        const aggregatedFile = path.join(outputDir, 'aggregated.xml');
        
        if (!fs.existsSync(aggregatedFile)) {
          return {
            content: [
              {
                type: 'text',
                text: 'Aggregated feed not found. The feed aggregator may need to run first.',
              },
            ],
            isError: true,
          };
        }

        const rssFeed = fs.readFileSync(aggregatedFile, 'utf8');
        const parsedFeed = await xml2js.parseStringPromise(rssFeed);
        const feedInfo = mcpHelpers.extractFeedItems(parsedFeed);
        
        if (!feedInfo) {
          return {
            content: [
              {
                type: 'text',
                text: 'Could not parse aggregated feed',
              },
            ],
            isError: true,
          };
        }

        const items = feedInfo.items.slice(0, limit);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                feed: {
                  title: feedInfo.title || 'Aggregated Feed',
                  link: feedInfo.link || '',
                },
                items: items,
                totalItems: feedInfo.items.length,
                returnedItems: items.length,
              }, null, 2),
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error executing tool ${name}: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
});

// Initialize Streamable HTTP Transport
// Using stateless mode (no sessionIdGenerator) for serverless compatibility
const mcpTransport = new StreamableHTTPServerTransport({
  sessionIdGenerator: undefined, // Stateless mode - no session management needed
});

// Connect the MCP server to the transport
mcpServer.connect(mcpTransport).then(() => {
  console.log('MCP server connected to Streamable HTTP transport');
}).catch((error) => {
  console.error('Error connecting MCP server to transport:', error);
});

// Unified MCP endpoint - handles both GET and POST requests
// Streamable HTTP uses a single endpoint for all communication
app.all('/mcp', async (req, res) => {
  const startTime = Date.now();
  const timestamp = new Date().toISOString();
  const clientIp = req.ip || req.connection.remoteAddress || 'unknown';
  
  try {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, DELETE');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, MCP-Protocol-Version');
      res.status(200).end();
      return;
    }

    // Extract MCP request info from body (if JSON-RPC)
    let mcpMethod = null;
    let toolName = null;
    let requestId = null;
    
    if (req.body && typeof req.body === 'object') {
      mcpMethod = req.body.method || null;
      requestId = req.body.id || null;
      
      // If it's a tool call, extract the tool name
      if (mcpMethod === 'tools/call' && req.body.params && req.body.params.name) {
        toolName = req.body.params.name;
      }
    }

    // Log response info after request completes
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      const statusCode = res.statusCode;
      const statusText = statusCode >= 400 ? 'ERROR' : 'OK';
      
      const logParts = [
        `[${timestamp}]`,
        `${req.method} /mcp`,
        `IP: ${clientIp}`,
      ];
      
      if (mcpMethod) {
        logParts.push(`Method: ${mcpMethod}`);
      }
      if (toolName) {
        logParts.push(`Tool: ${toolName}`);
      }
      if (requestId) {
        logParts.push(`ID: ${requestId}`);
      }
      
      logParts.push(`Status: ${statusCode} ${statusText}`, `Time: ${duration}ms`);
      console.log(logParts.join(' | '));
    });

    // Use the transport's handleRequest method
    // It automatically handles GET (for SSE stream) and POST (for JSON-RPC messages)
    await mcpTransport.handleRequest(req, res, req.body);
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[${timestamp}] ${req.method} /mcp | IP: ${clientIp} | ERROR: ${error.message} | Time: ${duration}ms`);
    
    if (!res.headersSent) {
      res.status(500).json({ error: error.message });
    }
  }
});

// MCP info endpoint
app.get('/mcp/info', async (req, res) => {
  res.json({
    name: 'neptune-feed-cache',
    version: '1.0.0',
    transport: 'streamable-http',
    endpoint: '/mcp'
  });
});

// Start server
const useHttps = process.env.USE_HTTPS === 'true' || process.argv.includes('--https');

if (useHttps) {
  const certDir = path.join(__dirname, 'certs');
  const keyPath = path.join(certDir, 'key.pem');
  const certPath = path.join(certDir, 'cert.pem');

  // Check if certificates exist
  if (!fs.existsSync(keyPath) || !fs.existsSync(certPath)) {
    console.error('❌ SSL certificates not found!');
    console.error('   Run: node generate-cert.js');
    console.error('   Or set USE_HTTPS=false to use HTTP');
    process.exit(1);
  }

  const options = {
    key: fs.readFileSync(keyPath),
    cert: fs.readFileSync(certPath),
  };

  https.createServer(options, app).listen(port, () => {
    console.log(`✅ Feed aggregator app listening at https://localhost:${port}`);
    console.log(`✅ MCP server (Streamable HTTP) available at https://localhost:${port}/mcp`);
    console.log(`\n⚠️  Using self-signed certificate. Browsers will show a security warning.`);
    console.log(`   Click "Advanced" → "Proceed to localhost" to continue.`);
  });
} else {
  app.listen(port, () => {
    console.log(`Feed aggregator app listening at http://localhost:${port}`);
    console.log(`MCP server (Streamable HTTP) available at http://localhost:${port}/mcp`);
  });
}
