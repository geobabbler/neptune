/**
 * MCP tool list metadata (names, descriptions, input JSON schemas).
 * Single source used by Streamable HTTP + SSE MCP and GET /mcp/info.
 */

module.exports = [
  {
    name: 'list_cached_feeds',
    description:
      'List all feeds that are currently cached, including their titles, URLs, and item counts.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'get_feed_items',
    description: 'Get all items from a specific cached feed by its URL.',
    inputSchema: {
      type: 'object',
      properties: {
        feedUrl: {
          type: 'string',
          description: 'The URL of the feed to retrieve items from',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of items to return (default: 50)',
        },
      },
      required: ['feedUrl'],
    },
  },
  {
    name: 'search_feed_items',
    description:
      'Search across all cached feeds for items matching a query string. Supports multi-term search (AND/OR), field-specific queries (title:term), quoted phrases, fuzzy matching, date/time ranges, and feed filtering. Results are relevance-scored and sorted by relevance then date. dateFrom/dateTo accept YYYY-MM-DD (date-only, uses start/end of day) or full ISO 8601 date/time. Use compact=true and maxDescriptionLength=150-200 to reduce response size for LLM context windows.',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description:
            'Search query string. Supports: multi-term (AND/OR), field-specific (title:term, description:term, source:term), quoted phrases ("exact phrase"), and boolean operators (AND, OR). Default is AND logic.',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of results to return (default: 20)',
        },
        useWordBoundary: {
          type: 'boolean',
          description:
            'Use word boundary matching instead of substring matching (default: true)',
        },
        fuzzyTolerance: {
          type: 'number',
          description:
            'Fuzzy matching tolerance (Levenshtein distance, 0-2). 0 = exact only, 1 = allow 1 char difference, 2 = allow 2 char difference (default: 1)',
        },
        dateFrom: {
          type: 'string',
          description: `Filter results from this date/time. Supports:
- Date only (YYYY-MM-DD): interpreted as start of that day UTC (00:00:00)
- Date/time (ISO 8601, e.g. YYYY-MM-DDTHH:mm:ssZ): used as-is

IMPORTANT: If the user provides natural language dates (e.g., "Q3 2025", "last month"), convert to ISO 8601 before calling.

Examples:
- "Q3 2025" → "2025-07-01" or "2025-07-01T00:00:00Z"
- "today 2pm UTC" → "2026-01-22T14:00:00Z"
- "yesterday" → "2026-01-21"`,
        },
        dateTo: {
          type: 'string',
          description: `Filter results until this date/time. Supports:
- Date only (YYYY-MM-DD): interpreted as end of that day UTC (23:59:59.999)
- Date/time (ISO 8601, e.g. YYYY-MM-DDTHH:mm:ssZ): used as-is

IMPORTANT: If the user provides natural language dates, convert to ISO 8601 before calling.

Examples:
- "Q3 2025" → "2025-09-30" or "2025-09-30T23:59:59Z"
- "today" → "2026-01-22" (includes entire day)
- "end of month" → "2026-01-31T23:59:59Z"`,
        },
        feedUrls: {
          type: 'array',
          items: { type: 'string' },
          description:
            'Filter to specific feed URLs only. If not provided, searches all feeds.',
        },
        perFeedLimit: {
          type: 'number',
          description:
            'Maximum results per feed before merging (default: 10). Higher values improve recall but may slow search.',
        },
        maxDescriptionLength: {
          type: 'number',
          description:
            'Maximum length for item descriptions in results (default: 300). Use smaller values (100-200) to reduce context window usage. Descriptions are truncated at word boundaries.',
        },
        compact: {
          type: 'boolean',
          description:
            'Return only essential fields (title, link, pubDate, source, relevanceScore). Excludes description, imageUrl, sourceLink, and matchPositions. Use this to minimize context window usage (default: false).',
        },
        includeOriginal: {
          type: 'boolean',
          description:
            'Include the full parsed XML item in results. This significantly increases response size and should only be used when needed (default: false).',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'get_aggregated_feed',
    description:
      'Get the aggregated feed from the output directory (all feeds combined).',
    inputSchema: {
      type: 'object',
      properties: {
        limit: {
          type: 'number',
          description: 'Maximum number of items to return (default: 50)',
        },
      },
    },
  },
  {
    name: 'get_service_metadata',
    description:
      'Get Tier 1 service metadata: feed counts, aggregation freshness, item date span, public endpoints, and MCP tool names.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
];
