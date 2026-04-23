/**
 * Merge newly extracted feed items with a previously cached item list.
 * Retains items within the date window that are absent from the latest snapshot.
 * Incoming snapshot wins on key collision (publisher is source of truth for that entry).
 */

const { computeItemKey } = require('./feeds');

const mergeKeyFromItem = (item) => {
  if (item && item._itemKey) return item._itemKey;
  return computeItemKey(item);
};

/**
 * @param {Array<Object>|null|undefined} previousItems - items from last disk cache (may include _itemKey)
 * @param {Array<Object>} incomingItems - fresh extract from current XML
 * @param {{ monthsBack: number, maxItems: number, now?: Date }} opts
 * @returns {Array<Object>} merged items, each with _itemKey set for stable persistence
 */
function mergeFeedItems(previousItems, incomingItems, opts) {
  const { monthsBack, maxItems } = opts;
  const now = opts.now || new Date();
  const cutoff = new Date(now);
  cutoff.setMonth(cutoff.getMonth() - monthsBack);

  const map = new Map();

  const withinWindow = (item) => {
    const d = new Date(item.pubDate);
    return !Number.isNaN(d.getTime()) && d >= cutoff;
  };

  for (const it of previousItems || []) {
    const key = mergeKeyFromItem(it);
    if (!key) continue;
    if (withinWindow(it)) {
      map.set(key, { ...it, _itemKey: key });
    }
  }

  for (const it of incomingItems || []) {
    const key = computeItemKey(it);
    if (!key) continue;
    map.set(key, { ...it, _itemKey: key });
  }

  let merged = [...map.values()];
  merged = merged.filter(withinWindow);
  merged.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
  if (merged.length > maxItems) {
    merged = merged.slice(0, maxItems);
  }
  return merged;
}

module.exports = {
  mergeFeedItems,
};
