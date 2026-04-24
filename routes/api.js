const express = require('express');
const router = express.Router();
const { concierge } = require('../controllers/concierge');
const { renderConcierge } = require('../controllers/conciergePage');

// POST /api/concierge
router.post('/concierge', concierge);

// Serve concierge page at GET /api/concierge (combined route)
router.get('/concierge', renderConcierge);

module.exports = router;
