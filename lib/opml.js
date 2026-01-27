const fs = require('fs');
const path = require('path');
const xml2js = require('xml2js');

/**
 * Parse OPML content into a normalized feed metadata array.
 * Each entry has: url, title, description, defaultImageUrl.
 */
const parseOPML = async (opmlContent) => {
  const result = await xml2js.parseStringPromise(opmlContent);

  const outlines = result.opml?.body?.[0]?.outline || [];

  return outlines
    .filter((outline) => outline.$ && outline.$.xmlUrl)
    .map((outline) => ({
      url: outline.$.xmlUrl,
      title: outline.$.title || outline.$.text || 'Untitled',
      description: outline.$.description || '',
      defaultImageUrl: outline.$.defaultImageUrl || null,
    }));
};

/**
 * Read an OPML file from disk and return normalized feed metadata.
 */
const getFeedMetadata = async (opmlFilePath) => {
  const resolvedPath = path.resolve(opmlFilePath);
  const opmlContent = fs.readFileSync(resolvedPath, 'utf8');
  return parseOPML(opmlContent);
};

module.exports = {
  parseOPML,
  getFeedMetadata,
};


