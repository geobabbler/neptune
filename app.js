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
const { SSEServerTransport } = require('@modelcontextprotocol/sdk/server/sse.js');
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
const fetchAndCacheFeed = async (url, cachePath) => {
  try {
    const response = await axios.get(url, {
      timeout: 10000, // 10 second timeout
      headers: {
        'User-Agent': 'Neptune Feed Aggregator/1.0',
        'Accept': 'application/rss+xml, application/xml, application/atom+xml, text/xml, */*'
      },
      maxRedirects: 5
    });
    fs.writeFileSync(cachePath, response.data, 'utf8');
    return response.data;
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

// Parse OPML to extract feed URLs
const parseOPML = (opmlContent) => {
  const feedUrls = [];
  xml2js.parseString(opmlContent, (err, result) => {
    if (err) throw err;
    const outlines = result.opml.body[0].outline;
    outlines.forEach((outline) => {
      if (outline['$'] && outline['$'].xmlUrl) {
        feedUrls.push(outline['$'].xmlUrl);
      }
    });
  });
  return feedUrls;
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
      const feedItems = items.map((item) => ({
        title: item.title ? item.title[0] : 'No title',
        description: item.description ? item.description[0] : 'No description',
        link: item.link ? item.link[0] : '#',
        pubDate: item.pubDate ? item.pubDate[0] : 'Unknown date',
        source: item.source ? item.source[0]._ : 'Unknown source',
        author: item.author ? item.author[0] :
          item['dc:creator'] ? item['dc:creator'][0] : null
      }));

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
    const feedUrls = parseOPML(opmlContent);

    const aggregatedFeeds = [];

    for (const url of feedUrls) {
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
        .map(entry => ({
          title: entry.title ? entry.title[0]._ || entry.title[0] : 'Untitled',
          description: summarizeText(entry.content ? entry.content[0]._ || entry.content[0] :
            entry.summary ? entry.summary[0]._ || entry.summary[0] : '', 1000),
          link: entry.link ? entry.link.find(l => l.$.rel === 'alternate')?.$.href || entry.link[0].$.href : '',
          pubDate: entry.updated ? entry.updated[0] : entry.published ? entry.published[0] : new Date().toISOString(),
          source: feedTitle,
          sourceLink: feedLink,
          original: entry
        })) : [];

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
        .map(item => ({
          title: item.title ? item.title[0] : 'Untitled',
          description: summarizeText(item.description ? item.description[0] : '', 1000),
          link: item.link ? item.link[0] : '',
          pubDate: item.pubDate ? item.pubDate[0] : item.date ? item.date[0] : new Date().toUTCString(),
          source: feedTitle,
          sourceLink: feedLink.toString(),
          original: item
        })) : [];

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
        .map(item => ({
          title: item.title ? item.title[0] : 'Untitled',
          description: summarizeText(item.description ? item.description[0] : '', 1000),
          link: item.link ? item.link[0] : '',
          pubDate: item['dc:date'] ? item['dc:date'][0] : new Date().toUTCString(),
          source: feedTitle,
          sourceLink: feedLink.toString(),
          original: item
        })) : [];

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
// MCP Server Setup (HTTP/SSE Transport)
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
        const { query, limit = 20 } = args;
        const results = await mcpHelpers.searchCachedFeeds(cacheDir, opmlFile, query, limit);
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

// Store active SSE transports (keyed by session ID)
const activeTransports = new Map();

// Helper to establish SSE connection
async function establishSSEConnection(req, res, sessionId) {
  // Set up SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Cache-Control, Content-Type, X-Session-Id');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('X-Accel-Buffering', 'no'); // Disable nginx buffering

  // Create SSE transport
  // The transport constructor takes the message endpoint path where POST requests go
  // We'll use /mcp/messages for POST, but also handle POST on /mcp/sse
  const transport = new SSEServerTransport('/mcp/messages', res);
  activeTransports.set(sessionId, { transport, res, sessionId, createdAt: Date.now() });

  // Connect the MCP server to this transport
  await mcpServer.connect(transport);

  // Send initial connection message with session ID
  res.write(`data: ${JSON.stringify({ type: 'connection', sessionId })}\n\n`);

  // Send periodic heartbeat to keep connection alive
  const heartbeatInterval = setInterval(() => {
    if (!res.destroyed) {
      res.write(': heartbeat\n\n');
    } else {
      clearInterval(heartbeatInterval);
    }
  }, 30000); // Every 30 seconds

  // Clean up on client disconnect
  req.on('close', () => {
    console.log(`MCP SSE connection closed: ${sessionId}`);
    clearInterval(heartbeatInterval);
    activeTransports.delete(sessionId);
    if (transport && typeof transport.close === 'function') {
      transport.close();
    }
  });

  console.log(`MCP SSE connection established: ${sessionId} (active sessions: ${activeTransports.size})`);
}

// MCP SSE Endpoint - handles both GET (SSE stream) and POST (messages)
app.get('/mcp/sse', async (req, res) => {
  try {
    // Generate a session ID for this connection
    const sessionId = req.query.sessionId || `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    await establishSSEConnection(req, res, sessionId);
  } catch (error) {
    console.error('Error establishing MCP SSE connection:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to establish SSE connection' });
    }
  }
});

// Handle POST to /mcp/sse (for http-first strategy and streamable HTTP)
app.post('/mcp/sse', async (req, res) => {
  try {
    // Try to get session ID from various sources
    const sessionId = req.query.sessionId || 
                     req.headers['x-session-id'] || 
                     req.body?.sessionId;
    
    console.log(`POST /mcp/sse received, sessionId: ${sessionId || 'none'}, active sessions: ${activeTransports.size}, body: ${JSON.stringify(req.body).substring(0, 100)}`);
    
    // Check if this is a message for an existing session
    if (sessionId && activeTransports.has(sessionId)) {
      const existingSession = activeTransports.get(sessionId);
      
      if (existingSession && existingSession.transport) {
        // Handle message for existing session
        const { transport } = existingSession;
        if (transport && typeof transport.handlePostMessage === 'function') {
          console.log(`Routing POST to existing session: ${sessionId}`);
          return await transport.handlePostMessage(req, res);
        }
      }
    }
    
    // If no existing session and this looks like an initial connection
    // (has a JSON-RPC message in body), establish SSE connection
    if (req.body && (req.body.method || req.body.jsonrpc)) {
      // Generate new session ID
      const newSessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      console.log(`Establishing new SSE connection via POST: ${newSessionId}`);
      
      // Establish SSE connection - this will change response headers to SSE
      await establishSSEConnection(req, res, newSessionId);
      
      // The transport is now connected, and the initial message in req.body
      // will be handled by the transport's message queue
      // We don't need to manually process it here as the transport handles it
    } else {
      // No session and no message body - return error
      res.status(400).json({ 
        error: 'No active SSE session found',
        message: 'Please establish SSE connection via GET /mcp/sse first, or include a JSON-RPC message in the POST body',
        hint: 'For http-first strategy, POST with a JSON-RPC message to establish the connection'
      });
    }
  } catch (error) {
    console.error('Error handling POST to /mcp/sse:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: error.message });
    }
  }
});

// MCP Messages Endpoint - handles POST requests from the client
app.post('/mcp/messages', async (req, res) => {
  try {
    // Try multiple ways to get session ID
    const sessionId = req.query.sessionId || 
                     req.headers['x-session-id'] ||
                     req.body?.sessionId;
    
    console.log(`POST /mcp/messages received, sessionId: ${sessionId || 'none'}, active sessions: ${activeTransports.size}`);
    
    if (!sessionId) {
      // If no session ID, try to find the most recent transport
      const sessions = Array.from(activeTransports.keys());
      if (sessions.length === 0) {
        return res.status(400).json({ 
          error: 'No active SSE session. Please connect to /mcp/sse first.' 
        });
      }
      // Use the most recent session (simple fallback)
      const latestSession = sessions[sessions.length - 1];
      const { transport } = activeTransports.get(latestSession);
      
      if (transport && typeof transport.handlePostMessage === 'function') {
        console.log(`Routing POST /mcp/messages to latest session: ${latestSession}`);
        return await transport.handlePostMessage(req, res);
      }
    } else {
      const session = activeTransports.get(sessionId);
      if (!session) {
        console.log(`Session not found: ${sessionId}, available sessions: ${Array.from(activeTransports.keys()).join(', ')}`);
        return res.status(404).json({ 
          error: 'Session not found. Please establish SSE connection first.',
          availableSessions: Array.from(activeTransports.keys())
        });
      }
      
      const { transport } = session;
      if (transport && typeof transport.handlePostMessage === 'function') {
        console.log(`Routing POST /mcp/messages to session: ${sessionId}`);
        return await transport.handlePostMessage(req, res);
      }
    }
    
    // Fallback: handle message manually if transport doesn't have handlePostMessage
    console.log('Transport does not have handlePostMessage method');
    res.json({ 
      status: 'ok',
      message: 'Message received. Ensure SSE connection is active at /mcp/sse'
    });
  } catch (error) {
    console.error('Error handling MCP message:', error);
    res.status(500).json({ error: error.message });
  }
});

// Handle OPTIONS for CORS preflight
app.options('/mcp/sse', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Session-Id');
  res.status(200).end();
});

// MCP endpoint for Claude Desktop and other clients
// This is the main entry point that clients should connect to
app.get('/mcp', async (req, res) => {
  // Redirect to SSE endpoint or provide connection info
  res.json({
    name: 'neptune-feed-cache',
    version: '1.0.0',
    transport: 'sse',
    endpoints: {
      sse: '/mcp/sse',
      messages: '/mcp/messages'
    }
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
    console.log(`✅ MCP server available at https://localhost:${port}/mcp`);
    console.log(`\n⚠️  Using self-signed certificate. Browsers will show a security warning.`);
    console.log(`   Click "Advanced" → "Proceed to localhost" to continue.`);
  });
} else {
  app.listen(port, () => {
    console.log(`Feed aggregator app listening at http://localhost:${port}`);
    console.log(`MCP server available at http://localhost:${port}/mcp`);
  });
}
