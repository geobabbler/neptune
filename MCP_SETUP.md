# MCP Server Setup for Neptune Feed Aggregator

This document explains how to set up and use the MCP (Model Context Protocol) server that exposes the cached feed data via HTTP/SSE.

## Overview

The MCP server is **integrated directly into the Express application** (`app.js`) and uses **HTTP/SSE (Server-Sent Events) transport**, making it suitable for serverless deployments. It provides a standardized interface for AI assistants to query the cached RSS/Atom feeds over the web.

## Installation

1. Install dependencies (including the MCP SDK):
```bash
npm install
```

The MCP server is automatically available when you start the Express application.

## Running the Server

Start the Express application as usual:
```bash
npm start
```

Or:
```bash
node app.js
```

The MCP server will be available at:
- **SSE Endpoint:** `http://localhost:8080/mcp/sse`
- **Messages Endpoint:** `http://localhost:8080/mcp/messages`
- **Info Endpoint:** `http://localhost:8080/mcp`

## Available Tools

The MCP server exposes the following tools:

### 1. `list_cached_feeds`
Lists all feeds that are currently cached, including their titles, URLs, item counts, and last update times.

**Example usage:**
```json
{
  "name": "list_cached_feeds",
  "arguments": {}
}
```

### 2. `get_feed_items`
Retrieves all items from a specific cached feed by its URL.

**Parameters:**
- `feedUrl` (required): The URL of the feed to retrieve items from
- `limit` (optional): Maximum number of items to return (default: 50)

**Example usage:**
```json
{
  "name": "get_feed_items",
  "arguments": {
    "feedUrl": "https://blog.geomusings.com/feed",
    "limit": 20
  }
}
```

### 3. `search_feed_items`
Searches across all cached feeds for items matching a query string. Searches in titles, descriptions, and source names.

**Parameters:**
- `query` (required): Search query string
- `limit` (optional): Maximum number of results to return (default: 20)

**Example usage:**
```json
{
  "name": "search_feed_items",
  "arguments": {
    "query": "GIS mapping",
    "limit": 10
  }
}
```

### 4. `get_aggregated_feed`
Gets the aggregated feed from the output directory (all feeds combined).

**Parameters:**
- `limit` (optional): Maximum number of items to return (default: 50)

**Example usage:**
```json
{
  "name": "get_aggregated_feed",
  "arguments": {
    "limit": 30
  }
}
```

## Configuring MCP Clients

### Claude Desktop

Add the following to your Claude Desktop configuration file:

**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`  
**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

#### For Local Development:
```json
{
  "mcpServers": {
    "neptune-feed-cache": {
      "url": "http://localhost:8080/mcp/sse"
    }
  }
}
```

#### For Production/Serverless Deployment:
```json
{
  "mcpServers": {
    "neptune-feed-cache": {
      "url": "https://your-serverless-app.com/mcp/sse"
    }
  }
}
```

**Note:** Replace `https://your-serverless-app.com` with your actual deployment URL.

### VS Code / Cursor

If using an MCP extension for VS Code or Cursor, configure it with the SSE endpoint URL:
```
http://localhost:8080/mcp/sse
```
(or your production URL)

## How It Works

1. The MCP server is integrated into the Express application (`app.js`)
2. It uses **SSE (Server-Sent Events)** transport for real-time communication
3. Clients connect via GET request to `/mcp/sse` to establish the SSE connection
4. Clients send MCP requests via POST to `/mcp/messages`
5. The server reads from the `cache/` directory (same cache used by the aggregator)
6. It parses cached XML files using shared helper functions (`mcp-helpers.js`)
7. It exposes the data through MCP tools that can be called by AI assistants

## Architecture

```
┌─────────────────┐
│  MCP Client     │
│ (Claude Desktop)│
└────────┬────────┘
         │
         │ HTTP/SSE
         │
         ▼
┌─────────────────┐
│  Express App    │
│   (app.js)      │
│                 │
│  GET /mcp/sse   │◄─── SSE Connection
│  POST /mcp/     │◄─── MCP Messages
│     messages    │
└────────┬────────┘
         │
         │ Reads from
         ▼
┌─────────────────┐
│  Cache Directory│
│  (cache/*.xml)  │
└─────────────────┘
```

## Benefits

- **Serverless Compatible:** Works in serverless environments (AWS Lambda, Vercel, etc.)
- **Remote Access:** AI clients can access the cache from anywhere via HTTP
- **Standardized Interface:** AI assistants can query feeds using a consistent protocol
- **Efficient:** Only reads from cache, no network requests to external feeds
- **Searchable:** Can search across all cached feeds simultaneously
- **Up-to-date:** Uses the same cache that the main aggregator maintains
- **Integrated:** No separate process needed - runs alongside your Express app

## Serverless Considerations

### Connection Limits
Some serverless providers have connection timeout limits:
- **AWS Lambda:** 15-minute maximum execution time
- **Vercel:** 60-second timeout for Hobby plan, 300 seconds for Pro
- **Google Cloud Run:** Configurable up to 60 minutes

For long-running connections, consider:
- Using a dedicated server (not serverless)
- Implementing connection pooling
- Using a stateless MCP handler (if available)

### CORS Configuration
If accessing from a web browser, you may need to configure CORS headers. The current implementation includes basic CORS headers, but you may need to customize them for your domain.

## Troubleshooting

### "No active SSE session"
- Ensure the client connects to `/mcp/sse` first before sending messages
- Check that the Express server is running
- Verify the URL is correct (including protocol: `http://` or `https://`)

### "Feed not found in cache"
- The feed may not have been cached yet. Run the main aggregator to populate the cache
- Check that the `cache/` directory exists and contains feed files
- Verify the feed URL matches what's in `feeds.opml`

### "Could not parse feed"
- The cached feed file may be corrupted or in an unexpected format
- Check the cache file manually: `cache/[hex-encoded-url].xml`
- Try triggering a rebuild: `POST /rebuild`

### Connection Issues
- **Local:** Ensure the server is running on the expected port (default: 8080)
- **Remote:** Verify the deployment URL is accessible
- **CORS:** Check browser console for CORS errors if accessing from web
- **Firewall:** Ensure the serverless platform allows incoming connections

### Testing the MCP Server

You can test the MCP endpoints directly:

1. **Check server info:**
   ```bash
   curl http://localhost:8080/mcp
   ```

2. **Test SSE connection (in browser or with curl):**
   ```bash
   curl -N http://localhost:8080/mcp/sse
   ```

3. **Send a test message (after establishing SSE connection):**
   ```bash
   curl -X POST http://localhost:8080/mcp/messages \
     -H "Content-Type: application/json" \
     -d '{"jsonrpc":"2.0","method":"tools/list","id":1}'
   ```

## Migration from stdio-based MCP Server

If you were using the standalone `mcp-server.js` (stdio-based), note that:

- The stdio version (`mcp-server.js`) is still available but not used by default
- The HTTP/SSE version is now integrated into `app.js`
- Update your Claude Desktop config to use `url` instead of `command`/`args`
- The helper functions are now in `mcp-helpers.js` for reuse
