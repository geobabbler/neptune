/**
 * MCP Helper Functions for Neptune Feed Aggregator
 * 
 * Shared functions for accessing and parsing cached feeds
 */

const fs = require('fs');
const path = require('path');
const xml2js = require('xml2js');
const { decode } = require('html-entities');

// Helper function to decode HTML entities and summarize text
const summarizeText = (text, maxLength) => {
  if (!text) return '';
  text = text.replace(/<[^>]*>/g, '');
  text = decode(text);
  if (text.length <= maxLength) return text;
  let truncatedText = text.substring(0, maxLength);
  let lastSpaceIndex = truncatedText.lastIndexOf(" ");
  if (lastSpaceIndex > 0) {
    truncatedText = truncatedText.substring(0, lastSpaceIndex);
  }
  return truncatedText + "...";
};

// Parse OPML to get feed metadata
const getFeedMetadata = (opmlFile) => {
  try {
    const opmlContent = fs.readFileSync(opmlFile, 'utf8');
    const feedUrls = [];
    xml2js.parseString(opmlContent, (err, result) => {
      if (err) throw err;
      const outlines = result.opml.body[0].outline;
      outlines.forEach((outline) => {
        if (outline['$'] && outline['$'].xmlUrl) {
          feedUrls.push({
            url: outline['$'].xmlUrl,
            title: outline['$'].title || outline['$'].text || 'Untitled',
            description: outline['$'].description || ''
          });
        }
      });
    });
    return feedUrls;
  } catch (error) {
    console.error('Error reading OPML:', error);
    return [];
  }
};

// Get cache file path for a feed URL
const getCachePath = (cacheDir, url) => {
  return path.join(cacheDir, `${Buffer.from(url).toString('hex')}.xml`);
};

// Parse a cached feed file
const parseCachedFeed = async (cachePath) => {
  try {
    if (!fs.existsSync(cachePath)) {
      return null;
    }
    const feedData = fs.readFileSync(cachePath, 'utf8');
    const parsedFeed = await xml2js.parseStringPromise(feedData);
    return parsedFeed;
  } catch (error) {
    console.error('Error parsing cached feed:', error);
    return null;
  }
};

// Extract items from parsed feed (similar to parseFeedItems in app.js)
const extractFeedItems = (parsedFeed) => {
  try {
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    // Handle Atom feed
    if (parsedFeed.feed) {
      const feed = parsedFeed.feed;
      const feedTitle = feed.title ? feed.title[0]._ || feed.title[0] : 'Untitled Feed';
      const feedLink = feed.link && feed.link[0] && feed.link[0].href ? feed.link[0].href : '';

      const items = feed.entry ? feed.entry
        .filter(entry => {
          const pubDate = new Date(entry.updated ? entry.updated[0] : entry.published ? entry.published[0] : 0);
          return pubDate > twelveMonthsAgo;
        })
        .map(entry => ({
          title: entry.title ? entry.title[0]._ || entry.title[0] : 'Untitled',
          description: summarizeText(entry.content ? entry.content[0]._ || entry.content[0] :
            entry.summary ? entry.summary[0]._ || entry.summary[0] : '', 500),
          link: entry.link ? entry.link.find(l => l.$.rel === 'alternate')?.$.href || entry.link[0].$.href : '',
          pubDate: entry.updated ? entry.updated[0] : entry.published ? entry.published[0] : new Date().toISOString(),
          source: feedTitle,
          sourceLink: feedLink
        })) : [];

      return { title: feedTitle, items, link: feedLink };
    }

    // Handle RSS feed
    if (parsedFeed.rss && parsedFeed.rss.channel) {
      const channel = parsedFeed.rss.channel[0];
      const feedTitle = channel.title[0];
      const feedLink = channel.link[0];

      const items = channel.item ? channel.item
        .filter(item => {
          const pubDate = new Date(item.pubDate ? item.pubDate[0] : item.date ? item.date[0] : 0);
          return pubDate > twelveMonthsAgo;
        })
        .map(item => ({
          title: item.title ? item.title[0] : 'Untitled',
          description: summarizeText(item.description ? item.description[0] : '', 500),
          link: item.link ? item.link[0] : '',
          pubDate: item.pubDate ? item.pubDate[0] : item.date ? item.date[0] : new Date().toUTCString(),
          source: feedTitle,
          sourceLink: feedLink.toString()
        })) : [];

      return { title: feedTitle, items, link: feedLink.toString() };
    }

    // Handle RDF (RSS 1.0) feed
    if (parsedFeed['rdf:RDF']) {
      const rdf = parsedFeed['rdf:RDF'];
      const channel = rdf.channel[0];
      const feedTitle = channel.title[0];
      const feedLink = channel.link[0];
      const items = rdf.item ? rdf.item
        .filter(item => {
          const pubDate = new Date(item['dc:date'] ? item['dc:date'][0] : 0);
          return pubDate > twelveMonthsAgo;
        })
        .map(item => ({
          title: item.title ? item.title[0] : 'Untitled',
          description: summarizeText(item.description ? item.description[0] : '', 500),
          link: item.link ? item.link[0] : '',
          pubDate: item['dc:date'] ? item['dc:date'][0] : new Date().toUTCString(),
          source: feedTitle,
          sourceLink: feedLink.toString()
        })) : [];

      return { title: feedTitle, items, link: feedLink.toString() };
    }

    return null;
  } catch (error) {
    console.error('Error extracting feed items:', error);
    return null;
  }
};

// Get all cached feeds
const getAllCachedFeeds = async (cacheDir, opmlFile) => {
  const feedMetadata = getFeedMetadata(opmlFile);
  const cachedFeeds = [];

  for (const feed of feedMetadata) {
    const cachePath = getCachePath(cacheDir, feed.url);
    if (fs.existsSync(cachePath)) {
      const parsedFeed = await parseCachedFeed(cachePath);
      if (parsedFeed) {
        const feedInfo = extractFeedItems(parsedFeed);
        if (feedInfo && feedInfo.items.length > 0) {
          cachedFeeds.push({
            ...feed,
            itemCount: feedInfo.items.length,
            lastUpdated: fs.statSync(cachePath).mtime.toISOString()
          });
        }
      }
    }
  }

  return cachedFeeds;
};

// Helper: Calculate Levenshtein distance for fuzzy matching
const levenshteinDistance = (str1, str2) => {
  const matrix = [];
  const len1 = str1.length;
  const len2 = str2.length;

  if (len1 === 0) return len2;
  if (len2 === 0) return len1;

  for (let i = 0; i <= len2; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= len1; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= len2; i++) {
    for (let j = 1; j <= len1; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[len2][len1];
};

// Helper: Check if strings match (exact, word boundary, or fuzzy)
const matchesTerm = (text, term, useWordBoundary = true, fuzzyTolerance = 0) => {
  const textLower = text.toLowerCase();
  const termLower = term.toLowerCase();

  // Exact substring match
  if (textLower.includes(termLower)) {
    return { matched: true, exact: true };
  }

  // Word boundary match
  if (useWordBoundary) {
    const wordBoundaryRegex = new RegExp(`\\b${termLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    if (wordBoundaryRegex.test(text)) {
      return { matched: true, exact: true };
    }
  }

  // Fuzzy matching
  if (fuzzyTolerance > 0) {
    const words = textLower.split(/\s+/);
    for (const word of words) {
      if (word.length >= termLower.length - 2 && word.length <= termLower.length + 2) {
        const distance = levenshteinDistance(termLower, word);
        if (distance <= fuzzyTolerance) {
          return { matched: true, exact: false, distance };
        }
      }
    }
  }

  return { matched: false };
};

// Helper: Parse query into terms and field-specific queries
const parseQuery = (query) => {
  const fieldQueries = { title: [], description: [], source: [], general: [] };
  const quotedPhrases = [];
  let currentQuery = query;

  // Extract quoted phrases
  const quoteRegex = /"([^"]+)"/g;
  let match;
  while ((match = quoteRegex.exec(query)) !== null) {
    quotedPhrases.push(match[1]);
    currentQuery = currentQuery.replace(match[0], '');
  }

  // Extract field-specific queries (title:term, description:term, source:term)
  const fieldRegex = /(title|description|source):([^\s]+)/gi;
  while ((match = fieldRegex.exec(currentQuery)) !== null) {
    const field = match[1].toLowerCase();
    const term = match[2];
    if (fieldQueries[field]) {
      fieldQueries[field].push(term);
    }
    currentQuery = currentQuery.replace(match[0], '');
  }

  // Parse AND/OR logic
  const hasOr = /\s+OR\s+/i.test(currentQuery);
  const hasAnd = /\s+AND\s+/i.test(currentQuery);
  const logic = hasOr ? 'OR' : 'AND';

  // Split remaining query into terms
  const terms = currentQuery
    .split(/\s+(?:AND|OR)\s+/i)
    .map(t => t.trim())
    .filter(t => t.length > 0);

  // Add general terms
  fieldQueries.general = terms;

  return {
    quotedPhrases,
    fieldQueries,
    logic,
    allTerms: [...quotedPhrases, ...terms, ...fieldQueries.title, ...fieldQueries.description, ...fieldQueries.source]
  };
};

// Helper: Calculate relevance score for an item
const calculateRelevanceScore = (item, parsedQuery, useWordBoundary, fuzzyTolerance) => {
  let score = 0;
  const matchedFields = [];
  const matchPositions = { title: [], description: [], source: [] };

  const title = (item.title || '').toLowerCase();
  const description = (item.description || '').toLowerCase();
  const source = (item.source || '').toLowerCase();

  // Field weights
  const weights = { title: 3, description: 2, source: 1 };

  // Check quoted phrases (exact phrase matching)
  for (const phrase of parsedQuery.quotedPhrases) {
    const phraseLower = phrase.toLowerCase();
    if (title.includes(phraseLower)) {
      score += weights.title * 10; // Bonus for exact phrase
      matchedFields.push('title');
      const index = title.indexOf(phraseLower);
      if (index >= 0) matchPositions.title.push([index, index + phraseLower.length]);
    }
    if (description.includes(phraseLower)) {
      score += weights.description * 10;
      matchedFields.push('description');
      const index = description.indexOf(phraseLower);
      if (index >= 0) matchPositions.description.push([index, index + phraseLower.length]);
    }
    if (source.includes(phraseLower)) {
      score += weights.source * 10;
      matchedFields.push('source');
      const index = source.indexOf(phraseLower);
      if (index >= 0) matchPositions.source.push([index, index + phraseLower.length]);
    }
  }

  // Check field-specific queries
  for (const term of parsedQuery.fieldQueries.title) {
    const match = matchesTerm(title, term, useWordBoundary, fuzzyTolerance);
    if (match.matched) {
      score += weights.title * (match.exact ? 3 : 1);
      if (!matchedFields.includes('title')) matchedFields.push('title');
    }
  }

  for (const term of parsedQuery.fieldQueries.description) {
    const match = matchesTerm(description, term, useWordBoundary, fuzzyTolerance);
    if (match.matched) {
      score += weights.description * (match.exact ? 2 : 1);
      if (!matchedFields.includes('description')) matchedFields.push('description');
    }
  }

  for (const term of parsedQuery.fieldQueries.source) {
    const match = matchesTerm(source, term, useWordBoundary, fuzzyTolerance);
    if (match.matched) {
      score += weights.source * (match.exact ? 1 : 0.5);
      if (!matchedFields.includes('source')) matchedFields.push('source');
    }
  }

  // Check general terms
  for (const term of parsedQuery.fieldQueries.general) {
    let termMatched = false;

    const titleMatch = matchesTerm(title, term, useWordBoundary, fuzzyTolerance);
    if (titleMatch.matched) {
      score += weights.title * (titleMatch.exact ? 3 : 1);
      termMatched = true;
      if (!matchedFields.includes('title')) matchedFields.push('title');
    }

    const descMatch = matchesTerm(description, term, useWordBoundary, fuzzyTolerance);
    if (descMatch.matched) {
      score += weights.description * (descMatch.exact ? 2 : 1);
      termMatched = true;
      if (!matchedFields.includes('description')) matchedFields.push('description');
    }

    const sourceMatch = matchesTerm(source, term, useWordBoundary, fuzzyTolerance);
    if (sourceMatch.matched) {
      score += weights.source * (sourceMatch.exact ? 1 : 0.5);
      termMatched = true;
      if (!matchedFields.includes('source')) matchedFields.push('source');
    }

    // For AND logic, if a term doesn't match, return 0 score
    if (parsedQuery.logic === 'AND' && !termMatched) {
      return { score: 0, matchedFields: [], matchPositions: {} };
    }
  }

  return { score, matchedFields: [...new Set(matchedFields)], matchPositions };
};

// Search across all cached feeds with advanced features
const searchCachedFeeds = async (
  cacheDir,
  opmlFile,
  query,
  limit = 20,
  options = {}
) => {
  const startTime = Date.now();
  const {
    useWordBoundary = true,
    fuzzyTolerance = 1,
    dateFrom = null,
    dateTo = null,
    feedUrls = null,
    perFeedLimit = 10
  } = options;

  const feedMetadata = getFeedMetadata(opmlFile);
  const parsedQuery = parseQuery(query);
  const results = [];

  // Filter feeds if feedUrls specified
  const feedsToSearch = feedUrls
    ? feedMetadata.filter(feed => feedUrls.includes(feed.url))
    : feedMetadata;

  // Process feeds in parallel with concurrency limit
  const concurrencyLimit = 10;
  const feedChunks = [];
  for (let i = 0; i < feedsToSearch.length; i += concurrencyLimit) {
    feedChunks.push(feedsToSearch.slice(i, i + concurrencyLimit));
  }

  for (const chunk of feedChunks) {
    const chunkPromises = chunk.map(async (feed) => {
      const cachePath = getCachePath(cacheDir, feed.url);
      if (!fs.existsSync(cachePath)) {
        return [];
      }

      try {
        const parsedFeed = await parseCachedFeed(cachePath);
        if (!parsedFeed) {
          return [];
        }

        const feedInfo = extractFeedItems(parsedFeed);
        if (!feedInfo || !feedInfo.items) {
          return [];
        }

        // Filter by date range if specified
        let items = feedInfo.items;
        if (dateFrom || dateTo) {
          items = items.filter(item => {
            const itemDate = new Date(item.pubDate);
            if (dateFrom && itemDate < new Date(dateFrom)) return false;
            if (dateTo && itemDate > new Date(dateTo)) return false;
            return true;
          });
        }

        // Score and filter items
        const scoredItems = items
          .map(item => {
            const relevance = calculateRelevanceScore(
              item,
              parsedQuery,
              useWordBoundary,
              fuzzyTolerance
            );

            // For AND logic, skip items with 0 score
            if (parsedQuery.logic === 'AND' && relevance.score === 0) {
              return null;
            }

            // For OR logic, include items with any match
            return {
              ...item,
              feedUrl: feed.url,
              relevanceScore: relevance.score,
              matchedFields: relevance.matchedFields,
              matchPositions: relevance.matchPositions
            };
          })
          .filter(item => item !== null && item.relevanceScore > 0)
          .sort((a, b) => b.relevanceScore - a.relevanceScore)
          .slice(0, perFeedLimit);

        return scoredItems;
      } catch (error) {
        console.error(`Error processing feed ${feed.url}:`, error);
        return [];
      }
    });

    const chunkResults = await Promise.all(chunkPromises);
    results.push(...chunkResults.flat());
  }

  // Sort by relevance score (descending), then by date (newest first)
  results.sort((a, b) => {
    if (b.relevanceScore !== a.relevanceScore) {
      return b.relevanceScore - a.relevanceScore;
    }
    return new Date(b.pubDate) - new Date(a.pubDate);
  });

  const finalResults = results.slice(0, limit);
  const searchTime = Date.now() - startTime;

  return {
    query,
    results: finalResults,
    metadata: {
      totalMatches: results.length,
      returnedMatches: finalResults.length,
      feedsSearched: feedsToSearch.length,
      feedsWithMatches: new Set(finalResults.map(r => r.feedUrl)).size,
      searchTimeMs: searchTime,
      queryParsed: {
        logic: parsedQuery.logic,
        quotedPhrases: parsedQuery.quotedPhrases,
        terms: parsedQuery.allTerms,
        fieldQueries: parsedQuery.fieldQueries
      }
    }
  };
};

module.exports = {
  getFeedMetadata,
  getCachePath,
  parseCachedFeed,
  extractFeedItems,
  getAllCachedFeeds,
  searchCachedFeeds,
  summarizeText
};

