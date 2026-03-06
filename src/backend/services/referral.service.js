const crypto = require('crypto');
const { Referral } = require('../models/referral.model');
const { ReferralReward } = require('../models/referralReward.model');
const { Order } = require('../models/order.models');

/**
 * Referral Service — Business Logic
 *
 * Handles claiming referral rewards, listing referrals,
 * and listing claimed rewards.
 */

/**
 * Generate a unique reward code like "REF-A1B2C3D4".
 * @returns {string}
 */
function generateRewardCode() {
    const hex = crypto.randomBytes(4).toString('hex').toUpperCase();
    return `REF-${hex}`;
}

/**
 * Claim a referral reward for a user.
 *
 * Validation:
 *  1. Find a completed referral where the user is the referrer and reward is unclaimed
 *  2. Verify the referred user has at least one delivered order
 *  3. Atomically mark the referral as claimed (prevents race conditions)
 *  4. Generate and save a ReferralReward document
 *
 * @param {string} userId   - The referrer's user ID (from JWT)
 * @param {string} [referralId] - Optional specific referral to claim
 * @returns {Promise<Object>} The created reward
 * @throws {Object} Error with statusCode if not eligible
 */
async function claimReferralReward(userId, referralId) {
    // ─── 1. Build query to find eligible referral ────────────────
    const query = {
        referrerId: userId,
        status: 'completed',
        rewardClaimed: false,
    };

    if (referralId) {
        query._id = referralId;
    }

    const referral = await Referral.findOne(query);

    if (!referral) {
        throw Object.assign(
            new Error('Not eligible. No completed referral found or reward already claimed.'),
            { statusCode: 400 }
        );
    }

    // ─── 2. Verify referred user has at least one delivered order ─
    const deliveredOrder = await Order.findOne({
        userId: referral.referredUserId,
        status: 'delivered',
    });

    if (!deliveredOrder) {
        throw Object.assign(
            new Error('Not eligible. The referred user has no delivered orders yet.'),
            { statusCode: 400 }
        );
    }

    // ─── 3. Atomic update — prevents race conditions ─────────────
    const updatedReferral = await Referral.findOneAndUpdate(
        {
            _id: referral._id,
            rewardClaimed: false, // Re-check in filter for atomicity
        },
        { $set: { rewardClaimed: true } },
        { new: true }
    );

    if (!updatedReferral) {
        throw Object.assign(
            new Error('Not eligible. No completed referral found or reward already claimed.'),
            { statusCode: 400 }
        );
    }

    // ─── 4. Generate and save reward ─────────────────────────────
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const reward = await ReferralReward.create({
        referralId: updatedReferral._id,
        userId,
        rewardCode: generateRewardCode(),
        type: 'percentage',
        value: 10,
        appliesTo: 'next_purchase_only',
        expiresAt,
        status: 'active',
    });

    return {
        type: reward.type,
        value: reward.value,
        rewardCode: reward.rewardCode,
        expiresAt: reward.expiresAt,
        appliesTo: reward.appliesTo,
        status: reward.status,
    };
}

/**
 * List all referrals made by a user.
 *
 * @param {string} userId - The referrer's user ID
 * @returns {Promise<Array>} List of referral documents
 */
async function getUserReferrals(userId) {
    return Referral.find({ referrerId: userId })
        .populate('referredUserId', 'name email')
        .sort({ createdAt: -1 })
        .lean();
}

/**
 * List all claimed referral rewards for a user.
 *
 * @param {string} userId - The user's ID
 * @returns {Promise<Array>} List of reward documents
 */
async function getUserReferralRewards(userId) {
    return ReferralReward.find({ userId })
        .sort({ createdAt: -1 })
        .lean();
}

module.exports = {
    claimReferralReward,
    getUserReferrals,
    getUserReferralRewards,
    generateRewardCode,
};
