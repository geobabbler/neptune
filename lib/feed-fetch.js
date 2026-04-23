/**
 * HTTP fetch for feed XML with optional conditional GET (If-None-Match / If-Modified-Since).
 * Persists validators in a per-feed sidecar JSON next to the XML cache.
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const CONFIG = require('../config');

const getFetchStatePath = (cacheDir, url) => {
  const hex = Buffer.from(url).toString('hex');
  return path.join(cacheDir, `${hex}.fetch-state.json`);
};

const readFetchState = (cacheDir, url) => {
  try {
    const p = getFetchStatePath(cacheDir, url);
    if (!fs.existsSync(p)) return null;
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch {
    return null;
  }
};

const writeFetchState = (cacheDir, url, state) => {
  try {
    const p = getFetchStatePath(cacheDir, url);
    fs.writeFileSync(p, JSON.stringify(state, null, 2), 'utf8');
  } catch (e) {
    console.warn('Warning: could not write fetch state:', e.message);
  }
};

const normalizeMediaNs = (body) =>
  String(body).replace(
    'xmlns:media=&quot;http://search.yahoo.com/mrss/&quot;',
    'xmlns:media="http://search.yahoo.com/mrss/"',
  );

/**
 * @param {string} url
 * @param {string} cachePath - absolute path to .xml cache file
 * @param {string} cacheDir - cache directory (for fetch-state sidecar)
 * @param {{ skipConditional?: boolean }} [opts]
 * @returns {Promise<string|null>} feed XML or null
 */
async function fetchAndCacheFeed(url, cachePath, cacheDir, opts = {}) {
  const skipConditional = opts.skipConditional === true || !CONFIG.FEED_CONDITIONAL_GET;
  const headers = {
    'User-Agent': CONFIG.USER_AGENT,
    Accept: 'application/rss+xml, application/xml, application/atom+xml, text/xml, */*',
  };

  if (!skipConditional && cacheDir) {
    const prev = readFetchState(cacheDir, url);
    if (prev?.etag) headers['If-None-Match'] = prev.etag;
    if (prev?.lastModified) headers['If-Modified-Since'] = prev.lastModified;
  }

  try {
    const response = await axios.get(url, {
      timeout: CONFIG.FEED_HTTP_TIMEOUT_MS,
      headers,
      maxRedirects: 5,
      validateStatus: (status) =>
        (status >= 200 && status < 300) || status === 304,
    });

    if (response.status === 304) {
      if (!fs.existsSync(cachePath)) {
        console.warn(`304 for ${url} but no cache file; treating as miss`);
        return null;
      }
      const body = fs.readFileSync(cachePath, 'utf8');
      if (cacheDir) {
        const prev = readFetchState(cacheDir, url) || {};
        writeFetchState(cacheDir, url, {
          ...prev,
          lastNotModifiedAt: new Date().toISOString(),
          lastStatus: 304,
        });
      }
      return body;
    }

    const raw = response.data;
    const data = normalizeMediaNs(typeof raw === 'string' ? raw : String(raw));
    fs.writeFileSync(cachePath, data, 'utf8');

    if (cacheDir) {
      const etag = response.headers?.etag;
      const lastModified = response.headers?.['last-modified'];
      const prev = readFetchState(cacheDir, url) || {};
      writeFetchState(cacheDir, url, {
        ...prev,
        etag: etag || null,
        lastModified: lastModified || null,
        lastSuccessAt: new Date().toISOString(),
        lastStatus: 200,
      });
    }

    return data;
  } catch (error) {
    console.error(`Error fetching feed from ${url}:`, error.message);
    if (fs.existsSync(cachePath)) {
      console.log(`Using cached data for ${url}`);
      return fs.readFileSync(cachePath, 'utf8');
    }
    return null;
  }
}

module.exports = {
  fetchAndCacheFeed,
  getFetchStatePath,
  readFetchState,
  writeFetchState,
};
