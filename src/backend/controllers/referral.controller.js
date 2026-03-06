const {
    claimReferralReward,
    getUserReferrals,
    getUserReferralRewards,
} = require('../services/referral.service');

/**
 * Referral Controller — Request Handlers
 *
 * Handles POST /customer/referral/claim
 *         GET  /customer/referrals
 *         GET  /customer/referral/rewards
 */

/**
 * Claim a referral reward.
 *
 * Extracts userId from the authenticated user (req.user),
 * optionally accepts referralId from the request body.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function claimReward(req, res) {
    try {
        const userId = req.user._id || req.user.id;
        const { referralId } = req.body;

        const reward = await claimReferralReward(userId, referralId);

        return res.status(200).json({
            success: true,
            message: 'Reward claimed successfully',
            reward,
        });
    } catch (error) {
        console.error('Referral claim error:', error);

        const statusCode = error.statusCode || 500;
        const message = error.message || 'Internal server error while claiming referral reward';

        return res.status(statusCode).json({
            success: false,
            message,
        });
    }
}

/**
 * List all referrals made by the authenticated user.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function listReferrals(req, res) {
    try {
        const userId = req.user._id || req.user.id;
        const referrals = await getUserReferrals(userId);

        return res.status(200).json({
            success: true,
            data: referrals,
        });
    } catch (error) {
        console.error('List referrals error:', error);

        return res.status(500).json({
            success: false,
            message: 'Internal server error while fetching referrals',
        });
    }
}

/**
 * List all claimed referral rewards for the authenticated user.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function listRewards(req, res) {
    try {
        const userId = req.user._id || req.user.id;
        const rewards = await getUserReferralRewards(userId);

        return res.status(200).json({
            success: true,
            data: rewards,
        });
    } catch (error) {
        console.error('List referral rewards error:', error);

        return res.status(500).json({
            success: false,
            message: 'Internal server error while fetching referral rewards',
        });
    }
}

module.exports = { claimReward, listReferrals, listRewards };
