const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const {
    claimReward,
    listReferrals,
    listRewards,
} = require('../controllers/referral.controller');

/**
 * Referral Routes
 *
 * POST /customer/referral/claim    — Claim a referral reward
 * GET  /customer/referrals         — List all referrals made by the user
 * GET  /customer/referral/rewards  — List all claimed referral rewards
 *
 * Usage in server.js:
 *   const referralRoutes = require('./routes/referral.route');
 *   app.use('/api', referralRoutes);
 */

// ─── Claim Referral Reward ──────────────────────────────────────
router.post('/customer/referral/claim', authenticate, claimReward);

// ─── List User Referrals ────────────────────────────────────────
router.get('/customer/referrals', authenticate, listReferrals);

// ─── List Claimed Rewards ───────────────────────────────────────
router.get('/customer/referral/rewards', authenticate, listRewards);

module.exports = router;
