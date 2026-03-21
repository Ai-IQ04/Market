/**
 * Auction Routes
 */

const express = require('express');
const router = express.Router();
const store = require('../store');

// GET /auctions - Return all auction items
router.get('/', (req, res) => {
  try {
    const items = store.getAll();
    res.json({
      success: true,
      count: items.length,
      data: items
    });
  } catch (err) {
    console.error('[API] Error fetching auctions:', err.message);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

module.exports = router;
