#!/usr/bin/env node

/**
 * MCP Server for Neptune Feed Aggregator Cache
 * 
 * This server exposes the cached RSS/Atom feeds through the Model Context Protocol,
 * allowing AI assistants to query and search the aggregated feed cache.
 */

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} = require('@modelcontextprotocol/sdk/types.js');

const fs = require('fs');
const path = require('path');
const xml2js = require('xml2js');
const { decode } = require('html-entities');

// Configuration
const cacheDir = path.join(__dirname, 'cache');
const outputDir = path.join(__dirname, 'output');
const opmlFile = path.join(__dirname, 'feeds.opml');

// Helper function to decode HTML entities and summarize text
const summarizeText = (text, maxLength) => {
  if (!text) return '';
  text = text.replace(/<[^>]*>/g, '');
  text = decode(text);
  if (text.length <= maxLength) return text;
  let truncatedText = text.substring(0, maxLength);
  let lastSpaceIndex = truncatedText.lastIndexOf(" ");
  if (lastSpaceIndex > 0) {
    truncatedText = truncatedText.substring(0, lastSpaceIndex);
  }
  return truncatedText + "...";
};

// Parse OPML to get feed metadata
const getFeedMetadata = () => {
  try {
    const opmlContent = fs.readFileSync(opmlFile, 'utf8');
    const feedUrls = [];
    xml2js.parseString(opmlContent, (err, result) => {
      if (err) throw err;
      const outlines = result.opml.body[0].outline;
      outlines.forEach((outline) => {
        if (outline['$'] && outline['$'].xmlUrl) {
          feedUrls.push({
            url: outline['$'].xmlUrl,
            title: outline['$'].title || outline['$'].text || 'Untitled',
            description: outline['$'].description || ''
          });
        }
      });
    });
    return feedUrls;
  } catch (error) {
    console.error('Error reading OPML:', error);
    return [];
  }
};

// Get cache file path for a feed URL
const getCachePath = (url) => {
  return path.join(cacheDir, `${Buffer.from(url).toString('hex')}.xml`);
};

// Parse a cached feed file
const parseCachedFeed = async (cachePath) => {
  try {
    if (!fs.existsSync(cachePath)) {
      return null;
    }
    const feedData = fs.readFileSync(cachePath, 'utf8');
    const parsedFeed = await xml2js.parseStringPromise(feedData);
    return parsedFeed;
  } catch (error) {
    console.error('Error parsing cached feed:', error);
    return null;
  }
};

// Extract items from parsed feed (similar to parseFeedItems in app.js)
const extractFeedItems = (parsedFeed) => {
  try {
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    // Handle Atom feed
    if (parsedFeed.feed) {
      const feed = parsedFeed.feed;
      const feedTitle = feed.title ? feed.title[0]._ || feed.title[0] : 'Untitled Feed';
      const feedLink = feed.link && feed.link[0] && feed.link[0].href ? feed.link[0].href : '';

      const items = feed.entry ? feed.entry
        .filter(entry => {
          const pubDate = new Date(entry.updated ? entry.updated[0] : entry.published ? entry.published[0] : 0);
          return pubDate > twelveMonthsAgo;
        })
        .map(entry => ({
          title: entry.title ? entry.title[0]._ || entry.title[0] : 'Untitled',
          description: summarizeText(entry.content ? entry.content[0]._ || entry.content[0] :
            entry.summary ? entry.summary[0]._ || entry.summary[0] : '', 500),
          link: entry.link ? entry.link.find(l => l.$.rel === 'alternate')?.$.href || entry.link[0].$.href : '',
          pubDate: entry.updated ? entry.updated[0] : entry.published ? entry.published[0] : new Date().toISOString(),
          source: feedTitle,
          sourceLink: feedLink
        })) : [];

      return { title: feedTitle, items, link: feedLink };
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
        .map(item => ({
          title: item.title ? item.title[0] : 'Untitled',
          description: summarizeText(item.description ? item.description[0] : '', 500),
          link: item.link ? item.link[0] : '',
          pubDate: item.pubDate ? item.pubDate[0] : item.date ? item.date[0] : new Date().toUTCString(),
          source: feedTitle,
          sourceLink: feedLink.toString()
        })) : [];

      return { title: feedTitle, items, link: feedLink.toString() };
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
        .map(item => ({
          title: item.title ? item.title[0] : 'Untitled',
          description: summarizeText(item.description ? item.description[0] : '', 500),
          link: item.link ? item.link[0] : '',
          pubDate: item['dc:date'] ? item['dc:date'][0] : new Date().toUTCString(),
          source: feedTitle,
          sourceLink: feedLink.toString()
        })) : [];

      return { title: feedTitle, items, link: feedLink.toString() };
    }

    return null;
  } catch (error) {
    console.error('Error extracting feed items:', error);
    return null;
  }
};

// Get all cached feeds
const getAllCachedFeeds = async () => {
  const feedMetadata = getFeedMetadata();
  const cachedFeeds = [];

  for (const feed of feedMetadata) {
    const cachePath = getCachePath(feed.url);
    if (fs.existsSync(cachePath)) {
      const parsedFeed = await parseCachedFeed(cachePath);
      if (parsedFeed) {
        const feedInfo = extractFeedItems(parsedFeed);
        if (feedInfo && feedInfo.items.length > 0) {
          cachedFeeds.push({
            ...feed,
            itemCount: feedInfo.items.length,
            lastUpdated: fs.statSync(cachePath).mtime.toISOString()
          });
        }
      }
    }
  }

  return cachedFeeds;
};

// Search across all cached feeds
const searchCachedFeeds = async (query, limit = 20) => {
  const feedMetadata = getFeedMetadata();
  const results = [];
  const queryLower = query.toLowerCase();

  for (const feed of feedMetadata) {
    const cachePath = getCachePath(feed.url);
    if (fs.existsSync(cachePath)) {
      const parsedFeed = await parseCachedFeed(cachePath);
      if (parsedFeed) {
        const feedInfo = extractFeedItems(parsedFeed);
        if (feedInfo && feedInfo.items) {
          const matchingItems = feedInfo.items.filter(item => {
            const title = (item.title || '').toLowerCase();
            const description = (item.description || '').toLowerCase();
            const source = (item.source || '').toLowerCase();
            return title.includes(queryLower) || 
                   description.includes(queryLower) || 
                   source.includes(queryLower);
          });

          results.push(...matchingItems.map(item => ({
            ...item,
            feedUrl: feed.url
          })));
        }
      }
    }
  }

  // Sort by date (newest first) and limit
  results.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
  return results.slice(0, limit);
};

// Initialize MCP Server
const server = new Server(
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
server.setRequestHandler(ListToolsRequestSchema, async () => {
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
        description: 'Search across all cached feeds for items matching a query string. Searches in titles, descriptions, and source names.',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Search query string',
            },
            limit: {
              type: 'number',
              description: 'Maximum number of results to return (default: 20)',
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
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'list_cached_feeds': {
        const feeds = await getAllCachedFeeds();
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
        const cachePath = getCachePath(feedUrl);
        const parsedFeed = await parseCachedFeed(cachePath);
        
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

        const feedInfo = extractFeedItems(parsedFeed);
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
        const { query, limit = 20 } = args;
        const results = await searchCachedFeeds(query, limit);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                query: query,
                results: results,
                count: results.length,
              }, null, 2),
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
        const feedInfo = extractFeedItems(parsedFeed);
        
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

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Neptune Feed Cache MCP server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error in main():', error);
  process.exit(1);
});

