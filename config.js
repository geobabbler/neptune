// Centralized configuration for Neptune
// Values can be overridden via environment variables.

const CONFIG = {
  PORT: parseInt(process.env.PORT || '8080', 10),

  // How many months back to keep items when aggregating/searching
  FEED_MONTHS_BACK: parseInt(process.env.FEED_MONTHS_BACK || '18', 10),

  // Cron expression for aggregation job
  AGGREGATION_CRON: process.env.AGGREGATION_CRON || '*/15 * * * *',

  // Max concurrent feeds to fetch/process during aggregation
  AGGREGATION_CONCURRENCY: parseInt(process.env.AGGREGATION_CONCURRENCY || '5', 10),

  // User agent for outbound feed requests
  USER_AGENT:
    process.env.FEED_USER_AGENT ||
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0',

  // HTTP client timeout (ms) for fetching feeds
  FEED_HTTP_TIMEOUT_MS: parseInt(process.env.FEED_HTTP_TIMEOUT_MS || '10000', 10),

  // If-None-Match / If-Modified-Since when validators are known (set FEED_FETCH_FORCE_FULL=1 to skip)
  FEED_CONDITIONAL_GET: process.env.FEED_FETCH_FORCE_FULL === '1' ? false : process.env.FEED_CONDITIONAL_GET !== '0',

  // Merge new snapshot with prior item cache within FEED_MONTHS_BACK (set FEED_MERGE_ITEMS=0 to disable)
  FEED_MERGE_ITEMS: process.env.FEED_MERGE_ITEMS !== '0',

  // Cap merged item list per feed (after date prune)
  FEED_MAX_MERGED_ITEMS: parseInt(process.env.FEED_MAX_MERGED_ITEMS || '2000', 10),
};

module.exports = CONFIG;


