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
const CONFIG = require('./config');
const { getFeedMetadata } = require('./lib/opml');
const { summarizeText, extractFeedItems, extractImageUrl, extractImageFromHtml, isValidImageUrl, resolveImageUrl } = require('./lib/feeds');

// MCP Server imports
const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StreamableHTTPServerTransport } = require('@modelcontextprotocol/sdk/server/streamableHttp.js');
const {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} = require('@modelcontextprotocol/sdk/types.js');
const mcpHelpers = require('./mcp-helpers.js');
const mcpCache = require('./lib/mcp-cache');

// MCP Response Helpers
const createMcpErrorResponse = (message) => ({
  content: [
    {
      type: 'text',
      text: message,
    },
  ],
  isError: true,
});

const createMcpTextResponse = (data) => ({
  content: [
    {
      type: 'text',
      text: JSON.stringify(data, null, 2),
    },
  ],
});

const app = express();
const port = CONFIG.PORT;

// CLI options
const cliArgs = process.argv.slice(2);
const randomFeedsArg = cliArgs.find(arg => arg.startsWith('--random-feeds='));
const RANDOM_FEED_COUNT = randomFeedsArg
  ? parseInt(randomFeedsArg.split('=')[1], 10) || null
  : null;

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
      timeout: CONFIG.FEED_HTTP_TIMEOUT_MS,
      headers: {
        'User-Agent': CONFIG.USER_AGENT,
        'Accept': 'application/rss+xml, application/xml, application/atom+xml, text/xml, */*',
      },
      maxRedirects: 5,
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

// Minimal content filtering (strip HTML tags from titles)
const filterFeedContent = (feedXml) => {
  const $ = cheerio.load(feedXml, { xmlMode: true });
  $('title').each((_, elem) => {
    const text = $(elem).text();
    $(elem).text(text.replace(/<[^>]+>/g, ''));
  });
  return $.xml();
};

// Cached OPML host → title map for renderFeeds
let opmlSourceByHostCache = null;
let opmlSourceByHostMtimeMs = 0;

const getOpmlSourceByHost = async () => {
  const opmlFile = path.join(__dirname, 'feeds.opml');

  try {
    if (!fs.existsSync(opmlFile)) {
      return {};
    }

    const stats = fs.statSync(opmlFile);
    const mtimeMs = stats.mtimeMs;

    // Return cached map if file hasn't changed
    if (opmlSourceByHostCache && opmlSourceByHostMtimeMs === mtimeMs) {
      return opmlSourceByHostCache;
    }

    const opmlContent = fs.readFileSync(opmlFile, 'utf8');
    const opmlResult = await xml2js.parseStringPromise(opmlContent);
    const outlines = opmlResult.opml?.body?.[0]?.outline || [];

    const map = {};
    outlines.forEach((outline) => {
      if (outline.$ && outline.$.xmlUrl) {
        const xmlUrl = outline.$.xmlUrl;
        const title = outline.$.title || outline.$.text || 'Untitled';
        try {
          const urlObj = new URL(xmlUrl);
          const host = urlObj.hostname;
          if (host && !map[host]) {
            map[host] = title;
          }
        } catch (e) {
          // Ignore malformed URLs in OPML
        }
      }
    });

    opmlSourceByHostCache = map;
    opmlSourceByHostMtimeMs = mtimeMs;
    return map;
  } catch (e) {
    console.warn('Warning: could not build OPML source map for renderFeeds:', e.message);
    return {};
  }
};

// Aggregate and render feeds
// This is used for the `/view` HTML endpoint by reading the aggregated RSS
// and turning it into a simple list of items for the template.
const renderFeeds = async (rssFeed) => {
  // Parse the aggregated RSS
  const result = await xml2js.parseStringPromise(rssFeed);

  // Get cached host → title map from OPML
  const opmlSourceByHost = await getOpmlSourceByHost();

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

    // Determine source:
    // 1. Prefer <source> element from aggregated RSS
    // 2. Fallback to OPML feed title based on link hostname
    // 3. Last resort: "Unknown source"
    let source = 'Unknown source';
    if (item.source && Array.isArray(item.source) && item.source[0]) {
      const srcNode = item.source[0];
      if (typeof srcNode === 'string') {
        source = srcNode;
      } else if (srcNode._) {
        source = srcNode._;
      }
    } else if (item.link && item.link[0]) {
      try {
        const linkUrl = new URL(item.link[0]);
        const host = linkUrl.hostname;
        if (host && opmlSourceByHost[host]) {
          source = opmlSourceByHost[host];
        }
      } catch (e) {
        // If link is not a valid absolute URL, keep existing source value
      }
    }
    
    return {
      title: item.title ? item.title[0] : 'No title',
      description: item.description ? item.description[0] : 'No description',
      link: item.link ? item.link[0] : '#',
      pubDate: item.pubDate ? item.pubDate[0] : 'Unknown date',
      source,
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

  return feedItems;
};

// Main aggregation function
const aggregateFeeds = async (useCache = true, lastRefreshTime = null) => {
  try {
    const opmlFile = path.join(__dirname, 'feeds.opml');
    const feeds = await getFeedMetadata(opmlFile);

    console.log(`Found ${feeds.length} feeds in OPML`);

    // Optional: test mode to aggregate a random subset of feeds
    let selectedFeeds = feeds;
    if (RANDOM_FEED_COUNT && RANDOM_FEED_COUNT > 0 && RANDOM_FEED_COUNT < feeds.length) {
      selectedFeeds = [...feeds].sort(() => Math.random() - 0.5).slice(0, RANDOM_FEED_COUNT);
      console.log(
        `Random feed test mode enabled: aggregating ${selectedFeeds.length} of ${feeds.length} feeds`,
      );
    }

    const openstreetmapFeed = feeds.find(f => f.url && f.url.includes('openstreetmap.us'));
    if (openstreetmapFeed) {
      console.log(`OpenStreetMap US feed found: ${openstreetmapFeed.url}, title: ${openstreetmapFeed.title}`);
    } else {
      console.log('OpenStreetMap US feed NOT found in parsed feeds');
      console.log('Sample feed URLs:', feeds.slice(0, 3).map(f => f.url));
    }

    const aggregatedFeeds = [];
    const feedMetadataForIndex = []; // Track metadata for MCP index

    // Process feeds with a simple concurrency limit for better performance
    const concurrencyLimit = CONFIG.AGGREGATION_CONCURRENCY;
    for (let i = 0; i < selectedFeeds.length; i += concurrencyLimit) {
      const chunk = selectedFeeds.slice(i, i + concurrencyLimit);

      await Promise.all(
        chunk.map(async (feed) => {
          const url = feed.url;
          const defaultImageUrl = feed.defaultImageUrl || null;
          const feedTitle = feed.title || url;

          const cachePath = mcpHelpers.getCachePath(cacheDir, url);
          let feedData;

          if (useCache && fs.existsSync(cachePath)) {
            feedData = fs.readFileSync(cachePath, 'utf8');
          } else {
            feedData = await fetchAndCacheFeed(url, cachePath);
          }

          if (feedData) {
            try {
              const filteredData = filterFeedContent(feedData);
              const parsedFeed = await xml2js.parseStringPromise(filteredData);

              // Determine feed type and extract items (shared helper)
              const feedInfo = extractFeedItems(parsedFeed, {
                baseUrl: url,
                monthsBack: CONFIG.FEED_MONTHS_BACK,
              });

              if (feedInfo && feedInfo.items.length > 0) {
                // Apply OPML-level default image URL as the last fallback per item
                if (defaultImageUrl && isValidImageUrl(defaultImageUrl)) {
                  feedInfo.items = feedInfo.items.map((item) => ({
                    ...item,
                    imageUrl: item.imageUrl || defaultImageUrl,
                  }));
                }

                // Write MCP cache files (metadata index and item cache)
                // This is isolated to MCP - aggregation workflow is unaffected
                try {
                  mcpCache.writeItemCache(cacheDir, url, feedInfo);
                  
                  // Track metadata for index
                  feedMetadataForIndex.push({
                    url,
                    title: feedTitle,
                    itemCount: feedInfo.items.length,
                    lastUpdated: fs.existsSync(cachePath)
                      ? fs.statSync(cachePath).mtime.toISOString()
                      : new Date().toISOString(),
                  });
                } catch (cacheError) {
                  // Non-fatal - log but don't fail aggregation
                  console.warn(`Warning: Failed to write MCP cache for ${feedTitle}:`, cacheError.message);
                }

                aggregatedFeeds.push(feedInfo);
                console.log(`✓ Processed ${feedTitle}: ${feedInfo.items.length} items`);
              } else if (feedInfo && feedInfo.items.length === 0) {
                console.log(
                  `⚠ Feed ${feedTitle} has no items after filtering (likely all items are older than 12 months)`,
                );
              } else if (!feedInfo) {
                console.log(`⚠ Feed ${feedTitle} could not be parsed or has unsupported format`);
              }
            } catch (error) {
              console.error(`✗ Error processing feed ${feedTitle}:`, error.message);
              if (error.stack) {
                console.error(error.stack);
              }
            }
          } else {
            console.log(`✗ Feed ${feedTitle} could not be fetched or cached`);
          }
        }),
      );
    }

    // Write MCP metadata index (for fast feed listing)
    try {
      mcpCache.writeMetadataIndex(cacheDir, feedMetadataForIndex);
    } catch (cacheError) {
      // Non-fatal - log but don't fail aggregation
      console.warn('Warning: Failed to write MCP metadata index:', cacheError.message);
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

// (Summarization and feed extraction helpers are now centralized in lib/feeds)

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

// Schedule aggregation using configurable cron expression
schedule.scheduleJob(CONFIG.AGGREGATION_CRON, () => {
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
  try {
    const feeds = await getFeedMetadata(opmlFile);
    return feeds
      .map(feed => ({
        title: feed.title,
        // For the list page, we want a link users can click; prefer htmlUrl if present,
        // otherwise fall back to xmlUrl. Since lib/opml only exposes xmlUrl, we use that here.
        xmlUrl: feed.url,
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
        return createMcpTextResponse(feeds);
      }

      case 'get_feed_items': {
        const { feedUrl, limit = 50 } = args;
        const cachePath = mcpHelpers.getCachePath(cacheDir, feedUrl);
        
        // Try item cache first (optimized path)
        let feedInfo = await mcpHelpers.getFeedItemsWithCache(cacheDir, feedUrl, null);
        
        // Fallback to parsing XML if cache miss
        if (!feedInfo) {
          const parsedFeed = await mcpHelpers.parseCachedFeed(cachePath);
          
          if (!parsedFeed) {
            return createMcpErrorResponse(`Feed not found in cache: ${feedUrl}`);
          }

          feedInfo = await mcpHelpers.getFeedItemsWithCache(cacheDir, feedUrl, parsedFeed);
          if (!feedInfo) {
            return createMcpErrorResponse(`Could not parse feed: ${feedUrl}`);
          }
        }

        const items = feedInfo.items.slice(0, limit);
        return createMcpTextResponse({
          feed: {
            title: feedInfo.title,
            link: feedInfo.link,
          },
          items: items,
          totalItems: feedInfo.items.length,
          returnedItems: items.length,
        });
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

        return createMcpTextResponse(searchResult);
      }

      case 'get_aggregated_feed': {
        const { limit = 50 } = args;
        const aggregatedFile = path.join(outputDir, 'aggregated.xml');
        
        if (!fs.existsSync(aggregatedFile)) {
          return createMcpErrorResponse('Aggregated feed not found. The feed aggregator may need to run first.');
        }

        const rssFeed = fs.readFileSync(aggregatedFile, 'utf8');
        const parsedFeed = await xml2js.parseStringPromise(rssFeed);
        const feedInfo = mcpHelpers.extractFeedItems(parsedFeed);
        
        if (!feedInfo) {
          return createMcpErrorResponse('Could not parse aggregated feed');
        }

        const items = feedInfo.items.slice(0, limit);
        return createMcpTextResponse({
          feed: {
            title: feedInfo.title || 'Aggregated Feed',
            link: feedInfo.link || '',
          },
          items: items,
          totalItems: feedInfo.items.length,
          returnedItems: items.length,
        });
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return createMcpErrorResponse(`Error executing tool ${name}: ${error.message}`);
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
  const pkg = require('./package.json');
  res.json({
    name: 'neptune-feed-cache',
    version: pkg.version,
    transport: 'streamable-http',
    endpoint: '/mcp',
    current_time: new Date().toISOString(),
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
