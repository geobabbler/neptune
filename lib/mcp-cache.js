/**
 * MCP Cache Manager
 * 
 * Provides optimized caching for MCP operations:
 * 1. Metadata index (fast feed listing)
 * 2. Item cache (pre-extracted items as JSON)
 * 3. In-memory LRU cache for parsed feeds
 * 
 * This is isolated to MCP operations only - aggregation workflow is unaffected.
 */

const fs = require('fs');
const path = require('path');

// Simple LRU Cache implementation
class LRUCache {
  constructor(maxSize = 50) {
    this.maxSize = maxSize;
    this.cache = new Map();
  }

  get(key) {
    if (!this.cache.has(key)) {
      return null;
    }
    // Move to end (most recently used)
    const value = this.cache.get(key);
    this.cache.delete(key);
    this.cache.set(key, value);
    return value;
  }

  set(key, value) {
    if (this.cache.has(key)) {
      // Update existing
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      // Remove least recently used (first item)
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }

  has(key) {
    return this.cache.has(key);
  }

  clear() {
    this.cache.clear();
  }

  size() {
    return this.cache.size;
  }
}

// In-memory cache for parsed feeds (keyed by cache path)
const parsedFeedCache = new LRUCache(50);

// Metadata index file path
const getMetadataIndexPath = (cacheDir) => {
  return path.join(cacheDir, '.metadata-index.json');
};

// Item cache file path (for a feed URL)
const getItemCachePath = (cacheDir, feedUrl) => {
  const hexUrl = Buffer.from(feedUrl).toString('hex');
  return path.join(cacheDir, `${hexUrl}.items.json`);
};

/**
 * Write metadata index (called during aggregation)
 * @param {string} cacheDir - Cache directory path
 * @param {Array} feeds - Array of feed metadata objects
 */
const writeMetadataIndex = (cacheDir, feeds) => {
  try {
    const indexPath = getMetadataIndexPath(cacheDir);
    const index = {
      version: '1.0',
      lastUpdated: new Date().toISOString(),
      feeds: feeds.map(feed => ({
        url: feed.url,
        title: feed.title,
        itemCount: feed.itemCount || 0,
        lastUpdated: feed.lastUpdated || new Date().toISOString(),
        cachePath: path.join(cacheDir, `${Buffer.from(feed.url).toString('hex')}.xml`),
      })),
    };
    fs.writeFileSync(indexPath, JSON.stringify(index, null, 2), 'utf8');
  } catch (error) {
    console.error('Error writing metadata index:', error);
    // Non-fatal - aggregation continues
  }
};

/**
 * Read metadata index (used by MCP)
 * @param {string} cacheDir - Cache directory path
 * @returns {Object|null} Metadata index or null if not found
 */
const readMetadataIndex = (cacheDir) => {
  try {
    const indexPath = getMetadataIndexPath(cacheDir);
    if (!fs.existsSync(indexPath)) {
      return null;
    }
    const data = fs.readFileSync(indexPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading metadata index:', error);
    return null;
  }
};

/**
 * Write item cache for a feed (called during aggregation)
 * @param {string} cacheDir - Cache directory path
 * @param {string} feedUrl - Feed URL
 * @param {Object} feedInfo - Feed info object with items, title, link
 */
const writeItemCache = (cacheDir, feedUrl, feedInfo) => {
  try {
    const itemCachePath = getItemCachePath(cacheDir, feedUrl);
    const cacheData = {
      version: '1.0',
      feedUrl,
      lastUpdated: new Date().toISOString(),
      feed: {
        title: feedInfo.title,
        link: feedInfo.link,
      },
      items: feedInfo.items || [],
    };
    fs.writeFileSync(itemCachePath, JSON.stringify(cacheData, null, 2), 'utf8');
  } catch (error) {
    console.error(`Error writing item cache for ${feedUrl}:`, error);
    // Non-fatal - aggregation continues
  }
};

/**
 * Read item cache for a feed (used by MCP)
 * @param {string} cacheDir - Cache directory path
 * @param {string} feedUrl - Feed URL
 * @returns {Object|null} Cached feed info or null if not found
 */
const readItemCache = (cacheDir, feedUrl) => {
  try {
    const itemCachePath = getItemCachePath(cacheDir, feedUrl);
    if (!fs.existsSync(itemCachePath)) {
      return null;
    }
    const data = fs.readFileSync(itemCachePath, 'utf8');
    const cacheData = JSON.parse(data);
    
    // Check if cache is stale (compare with XML file mtime)
    const xmlPath = path.join(cacheDir, `${Buffer.from(feedUrl).toString('hex')}.xml`);
    if (fs.existsSync(xmlPath)) {
      const xmlStats = fs.statSync(xmlPath);
      const cacheTime = new Date(cacheData.lastUpdated);
      const xmlTime = xmlStats.mtime;
      
      // If XML is newer, cache is stale
      if (xmlTime > cacheTime) {
        return null;
      }
    }
    
    return cacheData;
  } catch (error) {
    console.error(`Error reading item cache for ${feedUrl}:`, error);
    return null;
  }
};

/**
 * Get or set parsed feed in memory cache
 * @param {string} cachePath - Path to cached XML file
 * @param {Function} parseFn - Function to parse if not cached
 * @returns {Promise<Object>} Parsed feed object
 */
const getCachedParsedFeed = async (cachePath, parseFn) => {
  // Check in-memory cache first
  if (parsedFeedCache.has(cachePath)) {
    const cached = parsedFeedCache.get(cachePath);
    
    // Verify cache is still valid (check mtime)
    if (fs.existsSync(cachePath)) {
      const stats = fs.statSync(cachePath);
      if (stats.mtime.getTime() === cached.mtime) {
        return cached.parsedFeed;
      }
    }
    
    // Cache is stale, remove it
    parsedFeedCache.delete(cachePath);
  }
  
  // Parse and cache
  const parsedFeed = await parseFn();
  if (parsedFeed && fs.existsSync(cachePath)) {
    const stats = fs.statSync(cachePath);
    parsedFeedCache.set(cachePath, {
      parsedFeed,
      mtime: stats.mtime.getTime(),
    });
  }
  
  return parsedFeed;
};

/**
 * Clear all caches (useful for testing or manual refresh)
 */
const clearAllCaches = () => {
  parsedFeedCache.clear();
};

/**
 * Get cache statistics
 */
const getCacheStats = () => {
  return {
    inMemoryCacheSize: parsedFeedCache.size(),
    maxInMemoryCacheSize: parsedFeedCache.maxSize,
  };
};

module.exports = {
  writeMetadataIndex,
  readMetadataIndex,
  writeItemCache,
  readItemCache,
  getCachedParsedFeed,
  clearAllCaches,
  getCacheStats,
  getItemCachePath,
  getMetadataIndexPath,
};

