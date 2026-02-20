#!/usr/bin/env node
/**
 * Test script for the Streamable HTTP MCP endpoint (/mcp).
 * Usage: node test-mcp.js [baseUrl] [--verbose]
 * Default baseUrl: http://localhost:8080
 * Use --verbose or -v to show HTTP status and response body on errors.
 *
 * Prerequisites: Start the Neptune server (npm start) in another terminal.
 */

const args = process.argv.slice(2).filter((a) => !['--verbose', '-v'].includes(a));
const baseUrl = args[0] || 'http://localhost:8080';
const mcpUrl = `${baseUrl}/mcp`;
const verbose = process.argv.includes('--verbose') || process.argv.includes('-v');

async function testMcp() {
  const { Client } = require('@modelcontextprotocol/sdk/client/index.js');
  const { StreamableHTTPClientTransport } = require('@modelcontextprotocol/sdk/client/streamableHttp.js');

  console.log('Connecting to MCP at', mcpUrl, '...');

  const customFetch = verbose
    ? async (url, opts) => {
        const res = await fetch(url, opts);
        if (!res.ok) {
          const text = await res.text();
          console.error(`\nHTTP ${res.status} ${res.statusText} from ${opts?.method || 'GET'} ${url}`);
          if (text) console.error('Response:', text.slice(0, 500));
          return new Response(text, { status: res.status, statusText: res.statusText, headers: res.headers });
        }
        return res;
      }
    : undefined;

  const transport = new StreamableHTTPClientTransport(new URL(mcpUrl), { fetch: customFetch });
  const client = new Client({ name: 'test-mcp', version: '1.0.0' });

  await client.connect(transport);

  console.log('Connected. Listing tools...');
  const { tools } = await client.listTools();
  console.log('\nTools:', tools.map((t) => t.name).join(', '));

  // Call list_cached_feeds as a quick sanity check
  const result = await client.callTool({ name: 'list_cached_feeds', arguments: {} });
  console.log('\nlist_cached_feeds result (first 500 chars):');
  const text = result.content?.[0]?.text ?? JSON.stringify(result);
  console.log(text.slice(0, 500) + (text.length > 500 ? '...' : ''));

  await client.close();
  console.log('\n✅ /mcp endpoint test passed');
}

testMcp().catch((err) => {
  console.error('Error:', err.message);
  if (err.cause) console.error('Cause:', err.cause);
  process.exit(1);
});
