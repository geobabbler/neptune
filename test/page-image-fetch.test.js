const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const { extractImageFromHtml, enrichItemsMissingImages } = require('../lib/feeds');

const CERCANA_OG_SNIPPET = `
<meta property="og:image" content="https://cercanasystems.com/wp-content/uploads/2026/07/Screenshot-2026-07-10-at-8.22.14-AM.png" />
<div class="single-featured-image">
  <img src="https://cercanasystems.com/wp-content/uploads/2026/07/Screenshot-2026-07-10-at-8.22.14-AM.png" class="attachment-full size-full wp-post-image" />
</div>
`;

describe('extractImageFromHtml', () => {
  it('extracts og:image from WordPress post HTML', () => {
    const url = extractImageFromHtml(
      CERCANA_OG_SNIPPET,
      'https://cercanasystems.com/2026/07/cercana-executive-briefing-june-27-july-10-2026/',
    );
    assert.equal(
      url,
      'https://cercanasystems.com/wp-content/uploads/2026/07/Screenshot-2026-07-10-at-8.22.14-AM.png',
    );
  });

  it('falls back to wp-post-image when og:image is absent', () => {
    const html = `
      <div class="single-featured-image">
        <img src="/wp-content/uploads/2026/07/featured.png" class="wp-post-image" />
      </div>
    `;
    const url = extractImageFromHtml(html, 'https://example.com/post/');
    assert.equal(url, 'https://example.com/wp-content/uploads/2026/07/featured.png');
  });
});

describe('enrichItemsMissingImages', () => {
  it('fills imageUrl only for items missing one', async () => {
    const calls = [];
    const items = await enrichItemsMissingImages(
      [
        { title: 'Has image', link: 'https://example.com/a', imageUrl: 'https://example.com/existing.png' },
        { title: 'Needs image', link: 'https://example.com/needs-image', imageUrl: null },
      ],
      {
        fetchPageImage: async (link) => {
          calls.push(link);
          if (link.includes('needs-image')) {
            return 'https://example.com/featured.png';
          }
          return null;
        },
      },
    );

    assert.equal(items[0].imageUrl, 'https://example.com/existing.png');
    assert.equal(items[1].imageUrl, 'https://example.com/featured.png');
    assert.deepEqual(calls, ['https://example.com/needs-image']);
  });
});
