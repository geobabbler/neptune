const fs = require('fs');
const path = require('path');

const STATE_VERSION = '1.0';
const STATE_FILENAME = 'aggregation-state.json';

const getAggregationStatePath = (outputDir) => path.join(outputDir, STATE_FILENAME);

const getUniqueAggregatedItems = (aggregatedFeeds) => {
  const allItems = aggregatedFeeds.flatMap((feed) => feed.items || []);
  return allItems.filter(
    (item, index, self) => index === self.findIndex((t) => t.link === item.link),
  );
};

const computeAggregationStats = (aggregatedFeeds, monthsBack) => {
  const uniqueItems = getUniqueAggregatedItems(aggregatedFeeds);
  const dates = uniqueItems
    .map((item) => new Date(item.pubDate))
    .filter((d) => !Number.isNaN(d.getTime()))
    .sort((a, b) => a - b);

  return {
    totalItems: uniqueItems.length,
    newestItemAt: dates.length ? dates[dates.length - 1].toISOString() : null,
    oldestItemAt: dates.length ? dates[0].toISOString() : null,
    monthsBack,
  };
};

/**
 * @param {string} outputDir
 * @param {{ opmlCount: number, cachedCount: number, aggregatedFeeds: Array, monthsBack: number }} params
 */
const writeAggregationState = (outputDir, { opmlCount, cachedCount, aggregatedFeeds, monthsBack }) => {
  const cached = Math.max(0, cachedCount);
  const opml = Math.max(0, opmlCount);
  const state = {
    version: STATE_VERSION,
    lastCompletedAt: new Date().toISOString(),
    feeds: {
      opmlCount: opml,
      cachedCount: cached,
      failedOrEmptyCount: Math.max(0, opml - cached),
    },
    aggregation: computeAggregationStats(aggregatedFeeds, monthsBack),
  };

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  fs.writeFileSync(getAggregationStatePath(outputDir), JSON.stringify(state, null, 2), 'utf8');
  return state;
};

const readAggregationState = (outputDir) => {
  try {
    const statePath = getAggregationStatePath(outputDir);
    if (!fs.existsSync(statePath)) {
      return null;
    }
    return JSON.parse(fs.readFileSync(statePath, 'utf8'));
  } catch {
    return null;
  }
};

module.exports = {
  STATE_VERSION,
  getAggregationStatePath,
  getUniqueAggregatedItems,
  computeAggregationStats,
  writeAggregationState,
  readAggregationState,
};
