// Centralized configuration for Neptune
// Values can be overridden via environment variables.

const CONFIG = {
  PORT: parseInt(process.env.PORT || '8080', 10),

  // How many months back to keep items when aggregating/searching
  FEED_MONTHS_BACK: parseInt(process.env.FEED_MONTHS_BACK || '12', 10),

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
};

module.exports = CONFIG;


