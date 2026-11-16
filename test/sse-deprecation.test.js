const { test } = require('node:test');
const assert = require('node:assert/strict');
const { once } = require('node:events');
const express = require('express');
const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { Client } = require('@modelcontextprotocol/sdk/client/index.js');
const { SSEClientTransport } = require('@modelcontextprotocol/sdk/client/sse.js');
const { CallToolRequestSchema, ListToolsRequestSchema, EmptyResultSchema } = require('@modelcontextprotocol/sdk/types.js');
const {
  SSE_DEPRECATION,
  DeprecatedSSEServerTransport,
  legacySseDeprecation,
} = require('../lib/sse-deprecation');

test('legacy SSE warnings preserve SDK handshake, tool results, and errors', { timeout: 10000 }, async (t) => {
  t.mock.timers.enable({ apis: ['Date'], now: new Date('2026-11-16T00:00:00Z') });
  const app = express();
  app.use(legacySseDeprecation);
  app.use(express.json());
  let transport;
  app.get('/sse', async (req, res) => {
    transport = new DeprecatedSSEServerTransport('/messages', res);
    const server = new Server({ name: 'test', version: '1' }, { capabilities: { tools: {} } });
    server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [{ name: 'example', inputSchema: { type: 'object' } }],
    }));
    server.setRequestHandler(CallToolRequestSchema, async (request) => {
      if (request.params.name === 'fail') throw new Error('Example failure');
      return {
        content: [{ type: 'text', text: '{"items":[]}' }],
        _meta: { existing: true },
      };
    });
    await server.connect(transport);
  });
  app.post('/messages', async (req, res) => {
    if (req.query.sessionId !== transport?.sessionId) {
      return res.status(404).send('Session not found');
    }
    await transport.handlePostMessage(req, res, req.body);
  });
  app.get('/mcp', (req, res) => res.json({ unchanged: true }));
  const httpServer = app.listen(0, '127.0.0.1');
  t.after(() => {
    httpServer.closeAllConnections();
    return new Promise((resolve) => httpServer.close(resolve));
  });
  await once(httpServer, 'listening');
  const base = `http://127.0.0.1:${httpServer.address().port}`;

  // Use a real SDK client: added metadata/comments must not break the protocol.
  const client = new Client({ name: 'test-client', version: '1' });
  t.after(() => client.close());
  const clientTransport = new SSEClientTransport(new URL(`${base}/sse`));
  const received = [];
  await client.connect(clientTransport);
  const onmessage = clientTransport.onmessage;
  clientTransport.onmessage = (message, extra) => {
    received.push(message);
    onmessage(message, extra);
  };
  assert.deepEqual(client.getServerVersion(), { name: 'test', version: '1' });
  const tools = await client.listTools();
  assert.equal(tools.tools[0].name, 'example');
  assert.deepEqual(tools._meta['neptune/sseDeprecation'], SSE_DEPRECATION);
  const result = await client.callTool({ name: 'example', arguments: {} });
  assert.equal(result.content[0].text, '{"items":[]}');
  assert.equal(result.content[1].text, SSE_DEPRECATION.warning);
  assert.equal(result._meta.existing, true);
  assert.deepEqual(result._meta['neptune/sseDeprecation'], SSE_DEPRECATION);
  await assert.rejects(client.callTool({ name: 'fail' }), /DEPRECATION WARNING/);
  await assert.rejects(client.request({ method: 'unknown' }, EmptyResultSchema), /DEPRECATION WARNING/);
  await client.ping();
  assert.deepEqual(received.at(-1).result._meta['neptune/sseDeprecation'], SSE_DEPRECATION);

  const post = await fetch(`${base}/messages?sessionId=${transport.sessionId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized' }),
  });
  assert.equal(post.status, 202);
  assert.equal(post.headers.get('sunset'), 'Mon, 15 Feb 2027 00:00:00 GMT');
  assert.match(await post.text(), /Accepted\n\nDEPRECATION WARNING/);
  const missingSession = await fetch(`${base}/messages`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}',
  });
  assert.equal(missingSession.status, 404);
  const missingBody = await missingSession.text();
  assert.match(missingBody, /Session not found\n\nDEPRECATION WARNING/);
  assert.equal(Number(missingSession.headers.get('content-length')), Buffer.byteLength(missingBody));

  const modern = await fetch(`${base}/mcp`);
  assert.equal(modern.headers.get('sunset'), null);
  assert.deepEqual(await modern.json(), { unchanged: true });
});

test('legacy endpoints return 410 at the cutoff without a restart', { timeout: 10000 }, async (t) => {
  const cutoff = Date.parse(SSE_DEPRECATION.retiresAt);
  t.mock.timers.enable({ apis: ['Date'], now: cutoff - 1 });
  const app = express();
  app.use(legacySseDeprecation);
  // Retirement must take precedence over malformed JSON or missing sessions.
  app.use(express.json());
  app.all(['/sse', '/messages'], (req, res) => res.send('Legacy route reached'));
  app.all('/mcp', (req, res) => res.json({ unchanged: true }));
  const httpServer = app.listen(0, '127.0.0.1');
  t.after(() => {
    httpServer.closeAllConnections();
    return new Promise((resolve) => httpServer.close(resolve));
  });
  await once(httpServer, 'listening');
  const base = `http://127.0.0.1:${httpServer.address().port}`;

  for (const [method, path] of [['GET', '/sse'], ['POST', '/messages?sessionId=existing']]) {
    const response = await fetch(`${base}${path}`, { method });
    assert.equal(response.status, 200);
    assert.match(await response.text(), /Legacy route reached\n\nDEPRECATION WARNING/);
  }

  for (const now of [cutoff, cutoff + 86400000]) {
    t.mock.timers.setTime(now);
    for (const [method, path] of [
      ['GET', '/sse'], ['GET', '/SSE/'], ['POST', '/messages'],
      ['POST', '/messages/?sessionId=existing'], ['OPTIONS', '/sse'],
    ]) {
      const response = await fetch(`${base}${path}`, {
        method,
        ...(method === 'POST' ? {
          headers: { 'Content-Type': 'application/json' }, body: '{invalid',
        } : {}),
      });
      assert.equal(response.status, 410, `${method} ${path}`);
      assert.equal(response.headers.get('sunset'), 'Mon, 15 Feb 2027 00:00:00 GMT');
      assert.equal(response.headers.get('link'), '</mcp>; rel="successor-version"');
      assert.deepEqual(await response.json(), {
        error: 'The legacy MCP SSE transport has been retired. Use /mcp instead.',
        replacement: '/mcp',
        retiredAt: SSE_DEPRECATION.retiresAt,
      });
    }
    const modern = await fetch(`${base}/mcp`);
    assert.equal(modern.status, 200);
    assert.equal(modern.headers.get('sunset'), null);
    assert.deepEqual(await modern.json(), { unchanged: true });
  }
});

test('all SSE message types carry warnings without mutating original payloads', async () => {
  const { EventEmitter } = require('node:events');
  const response = new EventEmitter();
  const chunks = [];
  response.writeHead = () => {};
  response.write = (chunk) => chunks.push(chunk);
  const transport = new DeprecatedSSEServerTransport('/messages', response);
  await transport.start();
  assert.match(chunks[0], /^event: endpoint\ndata: \/messages\?sessionId=/);
  assert.equal(chunks[1], `: ${SSE_DEPRECATION.warning}\n\n`);
  const messages = [
    { jsonrpc: '2.0', id: 1, result: { protocolVersion: '2024-11-05' } },
    { jsonrpc: '2.0', method: 'notifications/tools/list_changed' },
    { jsonrpc: '2.0', id: 2, method: 'ping', params: { _meta: { existing: true } } },
    { jsonrpc: '2.0', id: 3, error: { code: -32601, message: 'Unknown method', data: { detail: 'kept' } } },
  ];
  for (const original of messages) {
    const before = JSON.stringify(original);
    await transport.send(original);
    const sent = JSON.parse(chunks.at(-1).match(/data: (.*)\n/)[1]);
    assert.equal(sent.jsonrpc, original.jsonrpc);
    assert.equal(sent.id, original.id);
    if (sent.error) {
      assert.match(sent.error.message, /DEPRECATION WARNING/);
      assert.deepEqual(sent.error.data, original.error.data);
    } else {
      assert.deepEqual((sent.result || sent.params)._meta['neptune/sseDeprecation'], SSE_DEPRECATION);
    }
    assert.equal(JSON.stringify(original), before);
  }
});
