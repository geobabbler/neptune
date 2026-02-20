# MCP Server Setup for Neptune Feed Aggregator

This document explains how to set up and use the MCP (Model Context Protocol) server that exposes the cached feed data via HTTP (Streamable HTTP transport).

## Overview

The MCP server is **integrated directly into the Express application** (`app.js`) and uses the **Streamable HTTP transport**, making it suitable for serverless deployments. It provides a standardized interface for AI assistants to query the cached RSS/Atom feeds over the web.

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
- **Streamable HTTP (recommended):** `http://localhost:8080/mcp`
- **Info Endpoint:** `http://localhost:8080/mcp/info`
- **Legacy HTTP+SSE:** `http://localhost:8080/sse` (GET to establish stream) + `http://localhost:8080/messages` (POST for client messages)

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

Add the following to your Claude Desktop configuration file (Streamable HTTP):

**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`  
**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

#### For Local Development:
```json
{
  "mcpServers": {
    "neptune-feed-cache": {
      "url": "http://localhost:8080/mcp"
    }
  }
}
```

#### For Production/Serverless Deployment:
```json
{
  "mcpServers": {
    "neptune-feed-cache": {
      "url": "https://your-serverless-app.com/mcp"
    }
  }
}
```

**Note:** Replace `https://your-serverless-app.com` with your actual deployment URL.

### VS Code / Cursor

If using an MCP extension for VS Code or Cursor, configure it with the HTTP endpoint URL:
```
http://localhost:8080/mcp
```
(or your production URL)

### Legacy HTTP+SSE (protocol 2024-11-05)

For clients that require the deprecated HTTP+SSE transport:

- **GET** `http://localhost:8080/sse` — establish the SSE stream (server → client)
- **POST** `http://localhost:8080/messages?sessionId=<id>` — send JSON-RPC messages (client → server)

The session ID is provided by the server in the SSE stream's endpoint event. No authentication is required.

## How It Works

1. The MCP server is integrated into the Express application (`app.js`)
2. It uses **Streamable HTTP** transport for stateless request/response handling
3. Clients send JSON-RPC MCP requests via POST to `/mcp`
4. The server reads from the `cache/` directory (same cache used by the aggregator)
5. It parses cached XML files using shared helper functions (`mcp-helpers.js`)
6. It exposes the data through MCP tools that can be called by AI assistants

## Architecture

```
┌─────────────────┐
│  MCP Client     │
│ (Claude/Desktop)│
└────────┬────────┘
         │
         │ HTTP (Streamable)
         │
         ▼
┌─────────────────┐
│  Express App    │
│   (app.js)      │
│                 │
│  POST /mcp      │◄─── MCP Messages
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

### Multi-Pod / Load-Balanced Deployments (Kubernetes, etc.)

The Streamable HTTP transport keeps in-memory state per pod. The MCP handshake requires:
1. Client sends `initialize` → server responds
2. Client sends `notifications/initialized` → server must be the same instance

If these requests hit different pods (e.g. `initialize` → pod A, `notifications/initialized` → pod B), the second request will fail with 500 because pod B never received the initialize.

**Fix: Enable session affinity (sticky sessions)** so both requests go to the same pod.

**Kubernetes (nginx ingress):**
```yaml
annotations:
  nginx.ingress.kubernetes.io/affinity: "cookie"
  nginx.ingress.kubernetes.io/affinity-mode: "persistent"
```

**Kubernetes Service (ClientIP affinity):**
```yaml
spec:
  sessionAffinity: ClientIP
  sessionAffinityConfig:
    clientIP:
      timeoutSeconds: 10800
```

Alternatively, scale to 1 replica if MCP traffic is low.

## Troubleshooting

### "Feed not found in cache"
- The feed may not have been cached yet. Run the main aggregator to populate the cache
- Check that the `cache/` directory exists and contains feed files
- Verify the feed URL matches what's in `feeds.opml`

### "Could not parse feed"
- The cached feed file may be corrupted or in an unexpected format
- Check the cache file manually: `cache/[hex-encoded-url].xml`
- Try triggering a rebuild: `POST /rebuild`

### 500 on `notifications/initialized`
- Usually caused by **load balancing across multiple pods**. The `initialize` request hits one pod, but `notifications/initialized` hits another that never received the init. Enable session affinity (see "Multi-Pod / Load-Balanced Deployments" above).

### Connection Issues
- **Local:** Ensure the server is running on the expected port (default: 8080)
- **Remote:** Verify the deployment URL is accessible
- **CORS:** Check browser console for CORS errors if accessing from web
- **Firewall:** Ensure the serverless platform allows incoming connections

### Testing the MCP Server

You can test the MCP endpoints as follows:

1. **Quick check (server info):**
   ```bash
   curl http://localhost:8080/mcp/info
   ```

2. **Full test (Streamable HTTP /mcp endpoint):**
   ```bash
   node test-mcp.js
   ```
   This uses the MCP SDK client to connect, initialize, list tools, and call `list_cached_feeds`.

3. **Manual curl** (Streamable HTTP requires an initialize handshake first; responses are delivered via SSE, so raw curl is awkward. Prefer the test script or an MCP client.)

4. **Test the legacy SSE endpoint:**
   ```bash
   node test-sse.js
   ```
   Or manually: connect to `GET http://localhost:8080/sse` to receive the `endpoint` event with `sessionId`, then POST JSON-RPC to `http://localhost:8080/messages?sessionId=<id>`.

## Migration from stdio-based MCP Server

If you previously used the standalone `mcp-server.js` (stdio-based), it has been removed in favor of the integrated HTTP MCP server in `app.js`. Update any client configs to use the HTTP endpoint as shown above.
