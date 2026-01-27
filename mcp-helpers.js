/**
 * MCP Helper Functions for Neptune Feed Aggregator
 * 
 * Shared functions for accessing and parsing cached feeds
 */

const fs = require('fs');
const path = require('path');
const xml2js = require('xml2js');
const { decode } = require('html-entities');
const { getFeedMetadata: getOpmlFeedMetadata } = require('./lib/opml');
const { summarizeText, extractFeedItems: extractFeedItemsLib } = require('./lib/feeds');
const mcpCache = require('./lib/mcp-cache');

// Parse OPML to get feed metadata (async, shared with app.js / HTTP MCP)
const getFeedMetadata = async (opmlFile) => {
  try {
    return await getOpmlFeedMetadata(opmlFile);
  } catch (error) {
    console.error('Error reading OPML:', error);
    return [];
  }
};

// Get cache file path for a feed URL (re-exported from mcp-cache)
// Note: We import from mcp-cache to avoid circular dependency
const getCachePath = (cacheDir, url) => mcpCache.getCachePath(cacheDir, url);

// Helper: Fix common XML issues before parsing
const sanitizeXml = (xmlString) => {
  let sanitized = xmlString;
  
  // Pre-step 1: Fix namespace declarations using &quot; instead of quotes
  // This is a common malformation where xmlns attributes use HTML entities
  // Pattern: xmlns:name=&quot;value&quot; -> xmlns:name="value"
  // Target namespace declarations specifically for reliability
  sanitized = sanitized.replace(
    /(xmlns(?::\w+)?)\s*=\s*&quot;([^&<>]*?)&quot;/g,
    (match, namespaceName, namespaceValue) => {
      return `${namespaceName}="${namespaceValue}"`;
    }
  );
  
  // Pre-step 2: Fix any other attributes using &quot; as delimiters
  // This catches non-namespace attributes that might have the same issue
  sanitized = sanitized.replace(
    /(\w+(?::\w+)?)\s*=\s*&quot;([^&<>]*?)&quot;/g,
    (match, attrName, attrValue) => {
      // Skip if we already fixed it as a namespace
      if (attrName.startsWith('xmlns')) {
        return match; // Already handled above
      }
      return `${attrName}="${attrValue}"`;
    }
  );
  
  // Pre-step 3: Handle the specific case where &quot; appears at end of line before >
  sanitized = sanitized.replace(/&quot;\s*>/g, '">');
  
  // Pre-step 2: Fix unquoted attributes more aggressively
  // This handles cases where attributes like attr=value&more appear
  // We'll quote any unquoted attribute that contains &, <, >, or spaces
  sanitized = sanitized.replace(
    /(\w+(?::\w+)?)\s*=\s*([^"'\s>]+[&<>][^"'\s>]*)/g,
    (match, attrName, attrValue) => {
      // Skip if already quoted
      if (attrValue.startsWith('"') || attrValue.startsWith("'")) {
        return match;
      }
      // Skip if it's an HTML entity being used incorrectly
      if (attrValue.startsWith('&quot;') || attrValue.startsWith('&apos;')) {
        return match; // Let the previous step handle it
      }
      // Escape special characters and quote
      let fixed = attrValue
        .replace(/&(?![a-zA-Z]+;|#\d+|#x[0-9a-fA-F]+;)/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
      return `${attrName}="${fixed}"`;
    }
  );
  
  // Step 1: Fix unquoted attributes that contain ampersands by quoting them
  // Pattern: attr=value&more (unquoted attribute with &)
  // This handles cases like: <tag attr=value&more> or <tag attr=value&more other=value>
  sanitized = sanitized.replace(
    /(\w+)\s*=\s*([^"'\s>]+&[^"'\s>]*?)(?=\s+\w+\s*=|>|\s*\/>)/g,
    (match, attrName, attrValue) => {
      // Skip if it's already a valid entity
      if (/&(amp|lt|gt|quot|apos|#\d+|#x[0-9a-fA-F]+);/.test(attrValue)) {
        return match;
      }
      // Escape ampersands and quote the attribute value
      const fixedValue = attrValue.replace(/&(?![a-zA-Z]+;|#\d+|#x[0-9a-fA-F]+;)/g, '&amp;');
      return `${attrName}="${fixedValue}"`;
    }
  );
  
  // Step 2: Fix unquoted attributes at end of tag (before > or />)
  sanitized = sanitized.replace(
    /(\w+)\s*=\s*([^"'\s>]+&[^"'\s>]*?)(\s*\/?>)/g,
    (match, attrName, attrValue, ending) => {
      // Skip if it's already a valid entity
      if (/&(amp|lt|gt|quot|apos|#\d+|#x[0-9a-fA-F]+);/.test(attrValue)) {
        return match;
      }
      // Escape ampersands and quote the attribute value
      const fixedValue = attrValue.replace(/&(?![a-zA-Z]+;|#\d+|#x[0-9a-fA-F]+;)/g, '&amp;');
      return `${attrName}="${fixedValue}"${ending}`;
    }
  );
  
  // Step 3: Fix unescaped ampersands in quoted attribute values
  sanitized = sanitized.replace(
    /(\w+\s*=\s*["'])([^"']*?)(&)(?![a-zA-Z]+;|#\d+|#x[0-9a-fA-F]+;)([^"']*?)(["'])/g,
    (match, prefix, before, amp, after, suffix) => {
      return prefix + before + '&amp;' + after + suffix;
    }
  );
  
  // Step 4: More aggressive - find any unquoted attribute with & and quote it
  // This catches edge cases where the above patterns might miss
  sanitized = sanitized.replace(
    /<([^>]+)>/g,
    (match, attributes) => {
      // Check if this tag has unquoted attributes with ampersands
      if (!/&/.test(attributes)) {
        return match; // No ampersands, skip
      }
      
      // Process each attribute in the tag - catch ALL unquoted attributes with &
      let fixedAttributes = attributes.replace(
        /(\w+)\s*=\s*([^"'\s>]+)/g,
        (attrMatch, attrName, attrValue) => {
          // Skip if already quoted
          if (attrValue.startsWith('"') || attrValue.startsWith("'")) {
            // But still check for unescaped & in quoted values
            if (/&(?![a-zA-Z]+;|#\d+|#x[0-9a-fA-F]+;)/.test(attrValue)) {
              const fixedValue = attrValue.replace(/&(?![a-zA-Z]+;|#\d+|#x[0-9a-fA-F]+;)/g, '&amp;');
              return `${attrName}=${fixedValue}`;
            }
            return attrMatch;
          }
          
          // Unquoted attribute - check if it has an unescaped &
          if (/&(?![a-zA-Z]+;|#\d+|#x[0-9a-fA-F]+;)/.test(attrValue)) {
            const fixedValue = attrValue.replace(/&(?![a-zA-Z]+;|#\d+|#x[0-9a-fA-F]+;)/g, '&amp;');
            return `${attrName}="${fixedValue}"`;
          }
          
          return attrMatch;
        }
      );
      
      return `<${fixedAttributes}>`;
    }
  );
  
  return sanitized;
};

// Parse a cached feed file (with in-memory caching)
const parseCachedFeed = async (cachePath) => {
  try {
    if (!fs.existsSync(cachePath)) {
      return null;
    }
    
    // Use in-memory cache if available
    return await mcpCache.getCachedParsedFeed(cachePath, async () => {
      const feedData = fs.readFileSync(cachePath, 'utf8');
      
      // Try parsing first
      try {
        const parsedFeed = await xml2js.parseStringPromise(feedData);
        return parsedFeed;
      } catch (parseError) {
      // If parsing fails, try sanitizing and parsing again
      console.warn(`XML parse error for ${cachePath}, attempting to sanitize:`, parseError.message);
      
      // Log the problematic line if available for debugging
      const lines = feedData.split('\n');
      const errorLine = parseError.line || 7; // Default to 7 if not available
      const problemLine = lines[errorLine - 1];
      if (problemLine) {
        console.warn(`Problematic line ${errorLine}: ${problemLine.substring(0, 200)}`);
        console.warn(`Full line: ${problemLine}`);
      }
      
      // Also show surrounding lines for context
      if (lines.length > errorLine) {
        console.warn(`Line ${errorLine - 1}: ${lines[errorLine - 2]?.substring(0, 100) || 'N/A'}`);
        console.warn(`Line ${errorLine + 1}: ${lines[errorLine]?.substring(0, 100) || 'N/A'}`);
      }
      
      try {
        const sanitized = sanitizeXml(feedData);
        
        // Log a snippet of the sanitized version around the problematic area for debugging
        if (parseError.line) {
          const sanitizedLines = sanitized.split('\n');
          const problemLine = sanitizedLines[parseError.line - 1];
          const prevLine = sanitizedLines[parseError.line - 2];
          const nextLine = sanitizedLines[parseError.line];
          if (problemLine) {
            console.warn(`Sanitized line ${parseError.line}: ${problemLine.substring(0, 200)}`);
            if (prevLine) console.warn(`  Previous: ${prevLine.substring(0, 100)}`);
            if (nextLine) console.warn(`  Next: ${nextLine.substring(0, 100)}`);
          }
        }
        
        const parsedFeed = await xml2js.parseStringPromise(sanitized);
        console.log(`Successfully parsed after sanitization: ${cachePath}`);
        return parsedFeed;
      } catch (sanitizeError) {
        // If sanitization didn't help, log the original error with context
        console.error(`Error parsing cached feed ${cachePath}:`, parseError.message);
        console.error(`Line: ${parseError.line || 'unknown'}, Column: ${parseError.column || 'unknown'}`);
        if (parseError.message.includes('Unquoted attribute value')) {
          console.error(`This feed has malformed XML with unescaped characters in attributes.`);
          console.error(`Sanitization attempt also failed: ${sanitizeError.message}`);
          if (sanitizeError.line) {
            console.error(`Sanitization error at line: ${sanitizeError.line}, column: ${sanitizeError.column}`);
          }
        }
        return null;
      }
    }
    });
  } catch (error) {
    console.error(`Error reading/parsing cached feed ${cachePath}:`, error.message);
    return null;
  }
};

// Extract items from parsed feed (shared implementation)
// Note: uses the same monthsBack as the main app (config-controlled).
const CONFIG = require('./config');
const extractFeedItems = (parsedFeed) =>
  extractFeedItemsLib(parsedFeed, { monthsBack: CONFIG.FEED_MONTHS_BACK });

// Get feed items with item cache optimization
const getFeedItemsWithCache = async (cacheDir, feedUrl, parsedFeed) => {
  // Try item cache first (fastest path)
  const itemCache = mcpCache.readItemCache(cacheDir, feedUrl);
  if (itemCache && itemCache.items && itemCache.items.length > 0) {
    return {
      title: itemCache.feed.title,
      link: itemCache.feed.link,
      items: itemCache.items,
    };
  }
  
  // Fallback: extract from parsed feed
  if (parsedFeed) {
    return extractFeedItems(parsedFeed);
  }
  
  return null;
};

// Get all cached feeds (optimized with metadata index)
const getAllCachedFeeds = async (cacheDir, opmlFile) => {
  // Try to use metadata index first (fast path)
  const metadataIndex = mcpCache.readMetadataIndex(cacheDir);
  if (metadataIndex && metadataIndex.feeds && metadataIndex.feeds.length > 0) {
    // Merge with OPML metadata to include title, defaultImageUrl, etc.
    const opmlFeeds = await getFeedMetadata(opmlFile);
    const opmlMap = new Map(opmlFeeds.map(f => [f.url, f]));
    
    return metadataIndex.feeds.map(indexFeed => {
      const opmlFeed = opmlMap.get(indexFeed.url) || {};
      return {
        ...opmlFeed,
        url: indexFeed.url,
        title: indexFeed.title || opmlFeed.title || indexFeed.url,
        itemCount: indexFeed.itemCount,
        lastUpdated: indexFeed.lastUpdated,
      };
    });
  }

  // Fallback: parse feeds from XML (slower, but works if index doesn't exist)
  const feedMetadata = await getFeedMetadata(opmlFile);
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

  const feedMetadata = await getFeedMetadata(opmlFile);
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
        // Try item cache first (fastest)
        let feedInfo = await getFeedItemsWithCache(cacheDir, feed.url, null);
        
        // If item cache miss, parse XML
        if (!feedInfo) {
          const parsedFeed = await parseCachedFeed(cachePath);
          if (!parsedFeed) {
            return [];
          }
          
          feedInfo = await getFeedItemsWithCache(cacheDir, feed.url, parsedFeed);
          if (!feedInfo || !feedInfo.items) {
            return [];
          }
        }
        
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
  getFeedItemsWithCache,
  getAllCachedFeeds,
  searchCachedFeeds,
  summarizeText,
  sanitizeXml
};

