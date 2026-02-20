#!/usr/bin/env node
/**
 * Test script for the legacy HTTP+SSE MCP endpoint.
 * Usage: node test-sse.js [baseUrl]
 * Default baseUrl: http://localhost:8080
 *
 * Prerequisites: Start the Neptune server (npm start) in another terminal.
 *
 * Note: With SSE transport, POST returns 202 Accepted. The actual JSON-RPC
 * response is delivered via the SSE stream (event: message).
 */

const baseUrl = process.argv[2] || 'http://localhost:8080';
const sseUrl = `${baseUrl}/sse`;
const messagesUrl = `${baseUrl}/messages`;

async function testSse() {
  console.log('Connecting to SSE stream at', sseUrl, '...');

  const response = await fetch(sseUrl, {
    headers: { Accept: 'text/event-stream' },
  });

  if (!response.ok) {
    throw new Error(`SSE connection failed: ${response.status} ${response.statusText}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let sessionId = null;
  let buffer = '';
  let resolveMessage;
  const messagePromise = new Promise((r) => {
    resolveMessage = r;
  });

  // Read SSE stream in background
  (async () => {
    while (true) {
      const { done, value } = await reader.read();
      buffer += decoder.decode(value, { stream: !done });

      // Parse endpoint event for sessionId
      if (!sessionId) {
        const epMatch = buffer.match(/event: endpoint\ndata: ([^\n]+)/);
        if (epMatch) {
          const sidMatch = epMatch[1].match(/sessionId=([^&\s]+)/);
          if (sidMatch) sessionId = sidMatch[1];
        }
      }

      // Parse message event for JSON-RPC response
      const msgMatch = buffer.match(/event: message\ndata: ([^\n]+)/);
      if (msgMatch) {
        try {
          const data = JSON.parse(msgMatch[1].trim());
          resolveMessage(data);
          return;
        } catch {
          // Invalid JSON, keep reading
        }
      }

      if (done) break;
    }
  })();

  // Wait for session ID (with timeout)
  for (let i = 0; i < 50; i++) {
    if (sessionId) break;
    await new Promise((r) => setTimeout(r, 100));
  }
  if (!sessionId) throw new Error('Could not get session ID from SSE stream');
  console.log('Got session ID:', sessionId);

  // Send tools/list request
  const listToolsRequest = {
    jsonrpc: '2.0',
    id: 1,
    method: 'tools/list',
    params: {},
  };

  console.log('\nSending tools/list to', `${messagesUrl}?sessionId=${sessionId}`);
  const postResponse = await fetch(`${messagesUrl}?sessionId=${sessionId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(listToolsRequest),
  });

  if (postResponse.status !== 202) {
    throw new Error(`POST failed: ${postResponse.status} ${postResponse.statusText}`);
  }
  console.log('POST accepted (202), waiting for response via SSE...');

  const result = await Promise.race([
    messagePromise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Timeout waiting for SSE response')), 5000)
    ),
  ]);

  console.log('\nResponse:');
  console.log(JSON.stringify(result, null, 2));

  if (result.result?.tools) {
    console.log('\n✅ Tools exposed:', result.result.tools.map((t) => t.name).join(', '));
  }
}

testSse().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
