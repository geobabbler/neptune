# Neptune Feed Aggregator

This project aggregates and processes RSS/Atom feeds listed in an OPML file and generates an aggregated HTML page and an RSS feed.

## Project Structure
- `cache/`: Stores cached feeds in XML format.
- `output/`: Stores the generated HTML and RSS files.
- `feeds.opml`: OPML file with feed URLs..

## To Run
1. Navigate to the project directory:
```
cd neptune
```

2. Install dependencies:
```
npm install
```

3. Start the server:
```
npm run go
```

By default the app listens on port 8080. Access the aggregated results at:
- HTML view: [http://localhost:8080/view](http://localhost:8080/view)
- Aggregated RSS: [http://localhost:8080/feed](http://localhost:8080/feed)

For MCP (Model Context Protocol) clients, the HTTP endpoint is:
- MCP endpoint: [http://localhost:8080/mcp](http://localhost:8080/mcp)
- MCP info: [http://localhost:8080/mcp/info](http://localhost:8080/mcp/info)

The legacy MCP HTTP+SSE endpoints (`/sse` and `/messages`) are deprecated as of
November 16, 2026 and remain available through February 14, 2027 (90 days).
Starting February 15, 2027 at 00:00 UTC, both endpoints automatically return
HTTP `410 Gone` with migration guidance. Migrate to Streamable HTTP at `/mcp`.
Until retirement, legacy responses include a deprecation warning.
