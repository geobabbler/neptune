const { getFeedMetadata } = require('./opml');
const { readAggregationState } = require('./aggregation-state');
const mcpCache = require('./mcp-cache');

const NEPTUNE_MCP_TOOL_NAMES = [
  'list_cached_feeds',
  'get_feed_items',
  'search_feed_items',
  'get_aggregated_feed',
  'get_service_metadata',
];

const buildEndpoints = (publicSiteUrl) => {
  const base = publicSiteUrl.replace(/\/+$/, '');
  return {
    feed: `${base}/feed`,
    view: `${base}/view`,
    list: `${base}/list`,
    briefings: `${base}/briefings`,
    metadata: `${base}/metadata`,
    mcp: `${base}/mcp`,
    mcpInfo: `${base}/mcp/info`,
  };
};

/**
 * Build Tier 1 service metadata for GET /metadata and MCP get_service_metadata.
 * @param {{ outputDir: string, cacheDir: string, opmlFile: string, packageJson: object, config: object }} ctx
 */
async function buildServiceMetadata(ctx) {
  const { outputDir, cacheDir, opmlFile, packageJson, config } = ctx;
  const publicSiteUrl = config.PUBLIC_SITE_URL;

  let opmlCount = 0;
  try {
    const feeds = await getFeedMetadata(opmlFile);
    opmlCount = feeds.length;
  } catch {
    // keep 0
  }

  const savedState = readAggregationState(outputDir);
  let feedsMeta = savedState?.feeds ?? null;
  let aggregationMeta = savedState?.aggregation ?? null;
  const lastCompletedAt = savedState?.lastCompletedAt ?? null;

  if (!feedsMeta) {
    const index = mcpCache.readMetadataIndex(cacheDir);
    const cachedCount = index?.feeds?.length ?? 0;
    feedsMeta = {
      opmlCount,
      cachedCount,
      failedOrEmptyCount: Math.max(0, opmlCount - cachedCount),
    };
  } else if (feedsMeta.opmlCount == null) {
    feedsMeta = { ...feedsMeta, opmlCount };
  }

  if (!aggregationMeta) {
    aggregationMeta = {
      totalItems: null,
      newestItemAt: null,
      oldestItemAt: null,
      monthsBack: config.FEED_MONTHS_BACK,
    };
  }

  return {
    service: {
      name: packageJson.name,
      version: packageJson.version,
      description: packageJson.description,
      publicSiteUrl,
    },
    feeds: feedsMeta,
    aggregation: {
      lastCompletedAt,
      totalItems: aggregationMeta.totalItems ?? null,
      newestItemAt: aggregationMeta.newestItemAt ?? null,
      oldestItemAt: aggregationMeta.oldestItemAt ?? null,
      monthsBack: aggregationMeta.monthsBack ?? config.FEED_MONTHS_BACK,
    },
    endpoints: buildEndpoints(publicSiteUrl),
    capabilities: {
      mcp: {
        tools: NEPTUNE_MCP_TOOL_NAMES,
      },
    },
    generatedAt: new Date().toISOString(),
  };
}

module.exports = {
  buildServiceMetadata,
  buildEndpoints,
  NEPTUNE_MCP_TOOL_NAMES,
};
