const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const os = require('os');

const {
  computeAggregationStats,
  getUniqueAggregatedItems,
  writeAggregationState,
  readAggregationState,
} = require('../lib/aggregation-state');
const { buildServiceMetadata } = require('../lib/service-metadata');

describe('aggregation-state', () => {
  it('dedupes aggregated items by link', () => {
    const unique = getUniqueAggregatedItems([
      { items: [{ link: 'https://a/1', pubDate: 'Mon, 01 Jan 2024 00:00:00 GMT' }] },
      { items: [{ link: 'https://a/1', pubDate: 'Mon, 01 Jan 2024 00:00:00 GMT' }, { link: 'https://a/2', pubDate: 'Tue, 02 Jan 2024 00:00:00 GMT' }] },
    ]);
    assert.equal(unique.length, 2);
  });

  it('computes item date bounds', () => {
    const stats = computeAggregationStats(
      [
        {
          items: [
            { link: 'https://a/old', pubDate: 'Mon, 01 Jan 2024 00:00:00 GMT' },
            { link: 'https://a/new', pubDate: 'Wed, 03 Jan 2024 00:00:00 GMT' },
          ],
        },
      ],
      18,
    );
    assert.equal(stats.totalItems, 2);
    assert.equal(stats.monthsBack, 18);
    assert.equal(stats.oldestItemAt, new Date('Mon, 01 Jan 2024 00:00:00 GMT').toISOString());
    assert.equal(stats.newestItemAt, new Date('Wed, 03 Jan 2024 00:00:00 GMT').toISOString());
  });
});

describe('writeAggregationState', () => {
  let tmpDir;

  before(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'neptune-meta-'));
  });

  after(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('persists feed and aggregation counts', () => {
    const written = writeAggregationState(tmpDir, {
      opmlCount: 10,
      cachedCount: 8,
      aggregatedFeeds: [
        {
          items: [{ link: 'https://x/i', pubDate: 'Mon, 01 Jan 2024 00:00:00 GMT' }],
        },
      ],
      monthsBack: 12,
    });

    assert.equal(written.feeds.failedOrEmptyCount, 2);
    assert.ok(written.lastCompletedAt);

    const read = readAggregationState(tmpDir);
    assert.equal(read.feeds.cachedCount, 8);
    assert.equal(read.aggregation.totalItems, 1);
  });
});

describe('buildServiceMetadata', () => {
  let tmpRoot;

  before(() => {
    tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'neptune-svc-meta-'));
    fs.mkdirSync(path.join(tmpRoot, 'output'), { recursive: true });
    fs.mkdirSync(path.join(tmpRoot, 'cache'), { recursive: true });
    fs.writeFileSync(
      path.join(tmpRoot, 'feeds.opml'),
      `<?xml version="1.0" encoding="UTF-8"?>
<opml version="2.0"><body>
  <outline text="A" title="A" type="rss" xmlUrl="https://example.com/a/feed"/>
  <outline text="B" title="B" type="rss" xmlUrl="https://example.com/b/feed"/>
</body></opml>`,
    );
    writeAggregationState(path.join(tmpRoot, 'output'), {
      opmlCount: 2,
      cachedCount: 2,
      aggregatedFeeds: [
        {
          items: [
            { link: 'https://x/1', pubDate: 'Mon, 01 Jun 2026 00:00:00 GMT' },
            { link: 'https://x/2', pubDate: 'Mon, 01 Jul 2026 00:00:00 GMT' },
          ],
        },
      ],
      monthsBack: 18,
    });
  });

  after(() => {
    fs.rmSync(tmpRoot, { recursive: true, force: true });
  });

  it('returns Tier 1 metadata shape', async () => {
    const meta = await buildServiceMetadata({
      outputDir: path.join(tmpRoot, 'output'),
      cacheDir: path.join(tmpRoot, 'cache'),
      opmlFile: path.join(tmpRoot, 'feeds.opml'),
      packageJson: {
        name: 'neptune',
        version: '1.1.0',
        description: 'test aggregator',
      },
      config: { PUBLIC_SITE_URL: 'https://geofeeds.me', FEED_MONTHS_BACK: 18 },
    });

    assert.equal(meta.service.name, 'neptune');
    assert.equal(meta.feeds.opmlCount, 2);
    assert.equal(meta.feeds.cachedCount, 2);
    assert.equal(meta.aggregation.totalItems, 2);
    assert.equal(meta.aggregation.monthsBack, 18);
    assert.equal(meta.endpoints.feed, 'https://geofeeds.me/feed');
    assert.equal(meta.endpoints.metadata, 'https://geofeeds.me/metadata');
    assert.ok(meta.capabilities.mcp.tools.includes('get_service_metadata'));
    assert.ok(meta.generatedAt);
  });
});
