const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { calculateLoyaltyPointsController } = require('../controllers/order.controller');

/**
 * Order Routes — Loyalty Points
 *
 * POST /orders/:id/loyalty-points
 *   - Calculates and credits/deducts loyalty points for an order
 *   - Requires authentication
 *   - Body: { userId, orderTotal, orderStatus }
 *
 * Usage in server.js:
 *   const orderRoutes = require('./routes/order.route');
 *   app.use('/api', orderRoutes);
 */

// ─── Loyalty Points Route ────────────────────────────────────
router.post(
    '/orders/:id/loyalty-points',
    authenticate,
    calculateLoyaltyPointsController
);

module.exports = router;
