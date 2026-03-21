/**
 * In-memory Auction Store
 * Stores auction items in a Map and computes status based on time
 */

class AuctionStore {
  constructor() {
    /** @type {Map<string, object>} */
    this.items = new Map();
  }

  /**
   * Add or update an auction item
   */
  addOrUpdate(item) {
    if (!item || !item.id) return;
    
    const existing = this.items.get(item.id);
    if (existing) {
      // Merge: keep existing fields, override with new non-null values
      const merged = { ...existing };
      for (const [key, value] of Object.entries(item)) {
        if (value !== null && value !== undefined) {
          merged[key] = value;
        }
      }
      merged.updatedAt = Date.now();
      this.items.set(item.id, merged);
    } else {
      item.updatedAt = Date.now();
      this.items.set(item.id, item);
    }
  }

  /**
   * Remove an auction item by ID
   */
  remove(id) {
    this.items.delete(id);
  }

  /**
   * Compute the status of an item based on current time vs endTime
   */
  computeStatus(item) {
    if (!item.endTime) return 'OPEN';
    
    const now = Date.now();
    const timeLeft = item.endTime - now;

    if (timeLeft <= 0) return 'CLOSED';
    if (timeLeft <= 10 * 60 * 1000) return 'ENDING_SOON'; // < 10 minutes
    return 'OPEN';
  }

  /**
   * Get all items with computed status, sorted by newest first
   */
  getAll() {
    const result = [];
    for (const item of this.items.values()) {
      result.push({
        ...item,
        status: this.computeStatus(item)
      });
    }
    // Sort by createdAt descending (newest first)
    result.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    return result;
  }

  /**
   * Get count of items
   */
  get size() {
    return this.items.size;
  }

  /**
   * Clear all items
   */
  clear() {
    this.items.clear();
  }
}

// Singleton instance
const store = new AuctionStore();

module.exports = store;
