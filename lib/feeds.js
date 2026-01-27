const { decode } = require('html-entities');
const cheerio = require('cheerio');
const { URL } = require('url');

// Shared text summarization
const summarizeText = (text, maxLength) => {
  if (!text) return '';

  // Remove HTML tags
  text = text.replace(/<[^>]*>/g, '');

  // Decode HTML entities
  text = decode(text);

  if (text.length <= maxLength) {
    return text;
  }

  let truncatedText = text.substring(0, maxLength);
  const lastSpaceIndex = truncatedText.lastIndexOf(' ');

  if (lastSpaceIndex > 0) {
    truncatedText = truncatedText.substring(0, lastSpaceIndex);
  }

  return `${truncatedText}...`;
};

// Validate image URL format and extension
const isValidImageUrl = (url) => {
  if (!url || typeof url !== 'string') return false;

  try {
    const urlObj = new URL(url);
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.ico'];
    const pathname = urlObj.pathname.toLowerCase();
    const hasImageExtension = imageExtensions.some((ext) => pathname.endsWith(ext));
    const hasImagePattern = /\.(jpg|jpeg|png|gif|webp|svg|bmp|ico)(\?|$)/i.test(url);
    return hasImageExtension || hasImagePattern;
  } catch {
    return false;
  }
};

// Convert relative URL to absolute, if possible
const resolveImageUrl = (imageUrl, baseUrl) => {
  if (!imageUrl) return null;

  try {
    // Already absolute
    new URL(imageUrl);
    return imageUrl;
  } catch {
    if (!baseUrl) return null;
    try {
      const base = new URL(baseUrl);
      return new URL(imageUrl, base).toString();
    } catch {
      return null;
    }
  }
};

// Extract image URL from HTML content
const extractImageFromHtml = (htmlContent, baseUrl) => {
  if (!htmlContent || typeof htmlContent !== 'string') return null;

  try {
    const $ = cheerio.load(htmlContent);

    // Priority 1: og:image meta
    const ogImage =
      $('meta[property="og:image"]').attr('content') ||
      $('meta[name="og:image"]').attr('content');
    if (ogImage) {
      const resolved = resolveImageUrl(ogImage, baseUrl);
      if (resolved && isValidImageUrl(resolved)) {
        return resolved;
      }
    }

    // Priority 2: first <img>
    const firstImg = $('img').first();
    if (firstImg.length > 0) {
      const imgSrc = firstImg.attr('src') || firstImg.attr('data-src');
      if (imgSrc) {
        const resolved = resolveImageUrl(imgSrc, baseUrl);
        if (resolved && isValidImageUrl(resolved)) {
          return resolved;
        }
      }
    }

    return null;
  } catch {
    return null;
  }
};

// Extract featured image URL from a feed item
const extractImageUrl = (item, itemLink, description) => {
  try {
    // 1. RSS enclosure
    if (item.enclosure && Array.isArray(item.enclosure)) {
      for (const enclosure of item.enclosure) {
        const type = enclosure.$?.type || enclosure.type || '';
        if (type.startsWith('image/')) {
          const url = enclosure.$?.url || enclosure.url || '';
          if (url && isValidImageUrl(url)) {
            return url;
          }
        }
      }
    }

    // 2. og:image as direct RSS element
    if (item['og:image']) {
      let ogImageUrl = null;
      if (Array.isArray(item['og:image'])) {
        const ogImage = item['og:image'][0];
        ogImageUrl =
          typeof ogImage === 'string'
            ? ogImage
            : ogImage._ || ogImage.$?.url || ogImage.url || ogImage.content;
      } else if (typeof item['og:image'] === 'string') {
        ogImageUrl = item['og:image'];
      } else {
        ogImageUrl =
          item['og:image']._ ||
          item['og:image'].$?.url ||
          item['og:image'].url ||
          item['og:image'].content;
      }

      if (ogImageUrl) {
        const resolved = resolveImageUrl(ogImageUrl, itemLink);
        if (resolved && isValidImageUrl(resolved)) {
          return resolved;
        }
      }
    }

    // 3. media:thumbnail / media:content
    if (item['media:thumbnail'] && Array.isArray(item['media:thumbnail'])) {
      const thumbnail = item['media:thumbnail'][0];
      const url = thumbnail.$?.url || thumbnail.url || '';
      if (url && isValidImageUrl(url)) {
        return url;
      }
    }

    if (item['media:content'] && Array.isArray(item['media:content'])) {
      for (const content of item['media:content']) {
        const medium = content.$?.medium || content.medium || '';
        const type = content.$?.type || content.type || '';
        if (medium === 'image' || type.startsWith('image/')) {
          const url = content.$?.url || content.url || '';
          if (url && isValidImageUrl(url)) {
            return url;
          }
        }
      }
    }

    // 4 & 5. From HTML description (img / og:image) + regex fallback
    if (description) {
      const htmlImageUrl = extractImageFromHtml(description, itemLink);
      if (htmlImageUrl) {
        return htmlImageUrl;
      }

      // Regex fallback
      try {
        const urlRegex = /https?:\/\/[^\s"'<>]+/g;
        const matches = description.match(urlRegex) || [];
        for (const raw of matches) {
          const cleaned = raw.replace(/[),.]+$/, '');
          if (cleaned && isValidImageUrl(cleaned)) {
            const resolved = resolveImageUrl(cleaned, itemLink);
            if (resolved && isValidImageUrl(resolved)) {
              return resolved;
            }
          }
        }
      } catch {
        // ignore
      }
    }

    return null;
  } catch {
    return null;
  }
};

// Core feed extraction (Atom, RSS 2.0, RDF)
const extractFeedItems = (parsedFeed, { baseUrl = null, monthsBack = 12 } = {}) => {
  try {
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - monthsBack);

    const resolveUrl = (url, base) => {
      if (!url || url.startsWith('http')) return url;
      if (!base) return url;
      try {
        const baseUrlObj = new URL(base);
        return new URL(url, baseUrlObj.origin).toString();
      } catch {
        return url;
      }
    };

    // Atom
    if (parsedFeed.feed) {
      const feed = parsedFeed.feed;
      const feedTitle = feed.title ? feed.title[0]._ || feed.title[0] : 'Untitled Feed';
      const feedLink = feed.link?.href ? feed.link[0].href || feed.link[0].href : '/list';

      const items = (feed.entry || [])
        .filter((entry) => {
          const pubDate = new Date(
            entry.updated ? entry.updated[0] : entry.published ? entry.published[0] : 0,
          );
          return pubDate > twelveMonthsAgo;
        })
        .map((entry) => {
          const entryLink = entry.link
            ? entry.link.find((l) => l.$.rel === 'alternate')?.$.href || entry.link[0].$.href
            : '';
          const entryDescription = entry.content
            ? entry.content[0]._ || entry.content[0]
            : entry.summary
            ? entry.summary[0]._ || entry.summary[0]
            : '';

          const imageUrl = extractImageUrl(entry, entryLink, entryDescription);

          return {
            title: entry.title ? entry.title[0]._ || entry.title[0] : 'Untitled',
            description: summarizeText(entryDescription, 1000),
            link: entryLink,
            pubDate: entry.updated
              ? entry.updated[0]
              : entry.published
              ? entry.published[0]
              : new Date().toISOString(),
            source: feedTitle,
            sourceLink: feedLink,
            imageUrl: imageUrl || null,
            original: entry,
          };
        });

      return { title: feedTitle, items };
    }

    // RSS 2.0
    if (parsedFeed.rss && parsedFeed.rss.channel) {
      const channel = parsedFeed.rss.channel[0];
      const feedTitle = channel.title ? channel.title[0] || 'Untitled Feed' : 'Untitled Feed';
      let feedLink = channel.link ? channel.link[0] || '' : '';

      if (feedLink && !feedLink.startsWith('http')) {
        if (baseUrl) {
          feedLink = resolveUrl(feedLink, baseUrl);
        } else {
          const atomLink = channel['atom:link'];
          if (atomLink && Array.isArray(atomLink) && atomLink[0]?.$?.href) {
            const atomLinkUrl = atomLink[0].$.href;
            if (atomLinkUrl.startsWith('http')) {
              feedLink = resolveUrl(feedLink, atomLinkUrl);
            }
          }
        }
      }

      const items = (channel.item || [])
        .filter((item) => {
          const pubDate = new Date(
            item.pubDate ? item.pubDate[0] : item.date ? item.date[0] : 0,
          );
          return pubDate > twelveMonthsAgo;
        })
        .map((item) => {
          let itemLink = item.link ? item.link[0] : '';

          if (itemLink && !itemLink.startsWith('http')) {
            if (feedLink && feedLink.startsWith('http')) {
              itemLink = resolveUrl(itemLink, feedLink);
            } else if (baseUrl) {
              itemLink = resolveUrl(itemLink, baseUrl);
            }
          }

          const rawContent = item['content:encoded']
            ? item['content:encoded'][0]._ || item['content:encoded'][0] || ''
            : item.description
            ? item.description[0]
            : '';

          const imageUrl = extractImageUrl(item, itemLink, rawContent);
          const summarizedDescription = summarizeText(rawContent, 1000);

          return {
            title: item.title ? item.title[0] : 'Untitled',
            description: summarizedDescription,
            link: itemLink,
            pubDate: item.pubDate
              ? item.pubDate[0]
              : item.date
              ? item.date[0]
              : new Date().toUTCString(),
            source: feedTitle,
            sourceLink: feedLink.toString(),
            imageUrl: imageUrl || null,
            original: item,
          };
        });

      return { title: feedTitle, items };
    }

    // RDF (RSS 1.0)
    if (parsedFeed['rdf:RDF']) {
      const rdf = parsedFeed['rdf:RDF'];
      const channel = rdf.channel[0];
      const feedTitle = channel.title[0];
      const feedLink = channel.link[0];

      const items = (rdf.item || [])
        .filter((item) => {
          const pubDate = new Date(item['dc:date'] ? item['dc:date'][0] : 0);
          return pubDate > twelveMonthsAgo;
        })
        .map((item) => {
          const itemLink = item.link ? item.link[0] : '';
          const itemDescription = item.description ? item.description[0] : '';
          const imageUrl = extractImageUrl(item, itemLink, itemDescription);

          return {
            title: item.title ? item.title[0] : 'Untitled',
            description: summarizeText(itemDescription, 1000),
            link: itemLink,
            pubDate: item['dc:date'] ? item['dc:date'][0] : new Date().toUTCString(),
            source: feedTitle,
            sourceLink: feedLink.toString(),
            imageUrl: imageUrl || null,
            original: item,
          };
        });

      return { title: feedTitle, items };
    }

    return null;
  } catch (error) {
    console.error('Error extracting feed items:', error);
    return null;
  }
};

module.exports = {
  summarizeText,
  extractFeedItems,
  extractImageUrl,
  extractImageFromHtml,
  isValidImageUrl,
  resolveImageUrl,
};


