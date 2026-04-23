const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const http = require('http');
const os = require('os');

const { computeItemKey } = require('../lib/feeds');
const { mergeFeedItems } = require('../lib/feed-item-merge');
const { fetchAndCacheFeed, getFetchStatePath } = require('../lib/feed-fetch');
const mcpCache = require('../lib/mcp-cache');

describe('computeItemKey', () => {
  it('uses guid from RSS original when present', () => {
    const key = computeItemKey({
      title: 'T',
      link: 'https://a.com/x',
      pubDate: 'Mon, 01 Jan 2024 00:00:00 GMT',
      original: { guid: [{ _: 'urn:uuid:abc', $: { isPermaLink: 'false' } }] },
    });
    assert.equal(key, 'guid:urn:uuid:abc');
  });

  it('falls back to normalized link', () => {
    const key = computeItemKey({
      title: 'T',
      link: 'https://example.com/path#frag',
      pubDate: 'Mon, 01 Jan 2024 00:00:00 GMT',
      original: {},
    });
    assert.equal(key, 'link:https://example.com/path');
  });

  it('uses hash when no guid and no link', () => {
    const key = computeItemKey({
      title: 'Only title',
      link: '',
      pubDate: '2024-01-01',
      original: {},
    });
    assert.ok(key.startsWith('hash:'));
  });
});

describe('mergeFeedItems', () => {
  it('dedupes by key and prefers incoming snapshot on collision', () => {
    const prev = [
      {
        title: 'Old title',
        link: 'https://x.com/a',
        pubDate: '2024-06-01T00:00:00.000Z',
        source: 'S',
        sourceLink: 'https://x.com',
        description: 'd1',
        imageUrl: null,
        original: {},
        _itemKey: 'link:https://x.com/a',
      },
    ];
    const incoming = [
      {
        title: 'New title',
        link: 'https://x.com/a',
        pubDate: '2024-08-01T00:00:00.000Z',
        source: 'S',
        sourceLink: 'https://x.com',
        description: 'd2',
        imageUrl: null,
        original: {},
      },
    ];
    const merged = mergeFeedItems(prev, incoming, { monthsBack: 24, maxItems: 100 });
    assert.equal(merged.length, 1);
    assert.equal(merged[0].title, 'New title');
    assert.equal(merged[0]._itemKey, 'link:https://x.com/a');
  });

  it('retains previous-only item still within monthsBack', () => {
    const now = new Date('2025-03-15T12:00:00.000Z');
    const prev = [
      {
        title: 'Dropped from feed',
        link: 'https://x.com/only-old',
        pubDate: '2025-02-01T00:00:00.000Z',
        source: 'S',
        sourceLink: 'https://x.com',
        description: 'd',
        imageUrl: null,
        original: {},
      },
    ];
    const incoming = [
      {
        title: 'Fresh',
        link: 'https://x.com/new',
        pubDate: '2025-03-10T00:00:00.000Z',
        source: 'S',
        sourceLink: 'https://x.com',
        description: 'd',
        imageUrl: null,
        original: {},
      },
    ];
    const merged = mergeFeedItems(prev, incoming, { monthsBack: 18, maxItems: 100, now });
    const links = new Set(merged.map((i) => i.link));
    assert.ok(links.has('https://x.com/only-old'));
    assert.ok(links.has('https://x.com/new'));
  });
});

describe('conditional fetch + item cache', () => {
  let tmpDir;
  let server;
  let baseUrl;

  before(async () => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'neptune-diff-'));
    await new Promise((resolve) => {
      let count = 0;
      server = http.createServer((req, res) => {
        count += 1;
        if (req.url === '/rss') {
          if (count === 1) {
            assert.ok(!req.headers['if-none-match']);
            res.writeHead(200, {
              'Content-Type': 'application/rss+xml',
              ETag: '"v1"',
            });
            res.end(
              `<?xml version="1.0"?><rss version="2.0"><channel><title>T</title><link>https://t</link><item><title>A</title><link>https://t/a</link><pubDate>Mon, 01 Mar 2025 12:00:00 GMT</pubDate><description>x</description></item></channel></rss>`,
            );
          } else {
            assert.equal(req.headers['if-none-match'], '"v1"');
            res.writeHead(304, {});
            res.end();
          }
          return;
        }
        res.writeHead(404);
        res.end();
      });
      server.listen(0, resolve);
    });
    const port = server.address().port;
    baseUrl = `http://127.0.0.1:${port}/rss`;
  });

  after(async () => {
    if (server) await new Promise((r) => server.close(r));
    if (tmpDir && fs.existsSync(tmpDir)) {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it('304 returns cached body and preserves validators', async () => {
    const hex = Buffer.from(baseUrl).toString('hex');
    const cachePath = path.join(tmpDir, `${hex}.xml`);

    const body1 = await fetchAndCacheFeed(baseUrl, cachePath, tmpDir, { skipConditional: false });
    assert.ok(body1 && body1.includes('<item>'));
    const state1 = JSON.parse(fs.readFileSync(getFetchStatePath(tmpDir, baseUrl), 'utf8'));
    assert.equal(state1.etag, '"v1"');

    const mtime1 = fs.statSync(cachePath).mtimeMs;

    const body2 = await fetchAndCacheFeed(baseUrl, cachePath, tmpDir, { skipConditional: false });
    assert.equal(body2, body1);
    const mtime2 = fs.statSync(cachePath).mtimeMs;
    assert.equal(mtime2, mtime1);
  });

  it('readItemCache stays valid after 304 when items.json matches xml mtime marker', () => {
    const feedUrl = 'https://example.com/feed.xml';
    const hex = Buffer.from(feedUrl).toString('hex');
    const d = path.join(tmpDir, `mcp-${hex}`);
    fs.mkdirSync(d, { recursive: true });
    const xmlPath = path.join(d, `${hex}.xml`);
    const xml = `<?xml version="1.0"?><rss version="2.0"><channel><title>X</title><link>https://x</link><item><title>I</title><link>https://x/i</link><pubDate>Mon, 01 Mar 2025 12:00:00 GMT</pubDate><description>d</description></item></channel></rss>`;
    fs.writeFileSync(xmlPath, xml);
    const mtimeMs = fs.statSync(xmlPath).mtimeMs;

    mcpCache.writeItemCache(d, feedUrl, {
      title: 'X',
      link: 'https://x',
      items: [
        {
          title: 'I',
          link: 'https://x/i',
          pubDate: 'Mon, 01 Mar 2025 12:00:00 GMT',
          source: 'X',
          sourceLink: 'https://x',
          description: 'd',
          imageUrl: null,
          original: { pubDate: ['Mon, 01 Mar 2025 12:00:00 GMT'] },
        },
      ],
    });

    const cached = mcpCache.readItemCache(d, feedUrl);
    assert.ok(cached);
    assert.equal(cached.items.length, 1);
    assert.equal(cached.items[0].title, 'I');
    assert.ok(!Object.prototype.hasOwnProperty.call(cached.items[0], '_itemKey'));

    fs.utimesSync(xmlPath, new Date(mtimeMs + 2000), new Date(mtimeMs + 2000));
    const stale = mcpCache.readItemCache(d, feedUrl);
    assert.equal(stale, null);
  });
});
