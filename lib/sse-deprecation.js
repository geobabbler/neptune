const { SSEServerTransport } = require('@modelcontextprotocol/sdk/server/sse.js');

// Fixed notice period: November 16, 2026 + 90 days. Never reset on restart.
const SSE_DEPRECATION = Object.freeze({
  deprecatedAt: '2026-11-16',
  supportEndsAt: '2027-02-14',
  retiresAt: '2027-02-15T00:00:00.000Z',
  replacement: '/mcp',
  warning:
    'DEPRECATION WARNING: The legacy MCP HTTP+SSE transport (/sse and /messages) ' +
    'will no longer be supported after February 14, 2027 ' +
    '(90 days after November 16, 2026). The endpoints will return HTTP 410 Gone ' +
    'starting February 15, 2027 at 00:00 UTC. Migrate to Streamable HTTP at /mcp.',
});

const META_KEY = 'neptune/sseDeprecation';

function withDeprecation(message) {
  if (message.result) {
    const result = {
      ...message.result,
      _meta: { ...message.result._meta, [META_KEY]: SSE_DEPRECATION },
    };
    // Tool content is what many assistants actually display to users.
    if (Array.isArray(result.content)) {
      result.content = [
        ...result.content,
        { type: 'text', text: SSE_DEPRECATION.warning },
      ];
    }
    return { ...message, result };
  }
  if (message.error) {
    return {
      ...message,
      error: {
        ...message.error,
        message: `${message.error.message}\n\n${SSE_DEPRECATION.warning}`,
      },
    };
  }
  return {
    ...message,
    params: {
      ...message.params,
      _meta: { ...message.params?._meta, [META_KEY]: SSE_DEPRECATION },
    },
  };
}

class DeprecatedSSEServerTransport extends SSEServerTransport {
  async start() {
    await super.start();
    // Keep the SDK's endpoint event as a URL. SSE comments are safe for clients
    // that only understand the standard endpoint and message events.
    this.res.write(`: ${SSE_DEPRECATION.warning}\n\n`);
  }

  async send(message) {
    return super.send(withDeprecation(message));
  }
}

function legacySseDeprecation(req, res, next) {
  // Match Express's default case-insensitive, optional-trailing-slash routes.
  if (!/^\/(sse|messages)\/?$/i.test(req.path)) return next();

  res.setHeader('Deprecation', '@1794787200'); // 2026-11-16T00:00:00Z
  res.setHeader('Sunset', new Date(SSE_DEPRECATION.retiresAt).toUTCString());
  res.setHeader('Link', '</mcp>; rel="successor-version"');
  res.setHeader('X-Deprecation-Warning', SSE_DEPRECATION.warning);

  // Check each request so a running server retires the endpoints without a restart.
  // Return before wrapping res.end() so the retirement response stays valid JSON.
  if (Date.now() >= Date.parse(SSE_DEPRECATION.retiresAt)) {
    return res.status(410).json({
      error: 'The legacy MCP SSE transport has been retired. Use /mcp instead.',
      replacement: SSE_DEPRECATION.replacement,
      retiredAt: SSE_DEPRECATION.retiresAt,
    });
  }

  // The SDK writes POST acknowledgements/errors directly with res.end(),
  // bypassing Express's res.send(). Also cover HTTP errors opening the stream.
  if (req.method === 'POST' || req.method === 'GET') {
    const end = res.end;
    res.end = function (chunk, encoding, callback) {
      if (this.getHeader('Content-Type') !== 'text/event-stream' &&
          (typeof chunk === 'string' || Buffer.isBuffer(chunk))) {
        const body = Buffer.concat([
          Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk, typeof encoding === 'string' ? encoding : 'utf8'),
          Buffer.from(`\n\n${SSE_DEPRECATION.warning}`),
        ]);
        if (!this.headersSent && this.hasHeader('Content-Length')) {
          this.setHeader('Content-Length', body.length);
        }
        return end.call(this, body, typeof encoding === 'function' ? encoding : callback);
      }
      return end.call(this, chunk, encoding, callback);
    };
  }
  next();
}

module.exports = {
  SSE_DEPRECATION,
  DeprecatedSSEServerTransport,
  legacySseDeprecation,
};
