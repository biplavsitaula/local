const mongoose = require('mongoose');

/**
 * ReferralReward Schema
 *
 * Stores claimed referral rewards. Each referral can only produce
 * one reward — enforced by a unique index on referralId.
 */
const referralRewardSchema = new mongoose.Schema(
    {
        referralId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Referral',
            required: true,
            unique: true, // DB-level duplicate prevention
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        rewardCode: {
            type: String,
            required: true,
            unique: true,
        },
        type: {
            type: String,
            default: 'percentage',
        },
        value: {
            type: Number,
            default: 10,
        },
        appliesTo: {
            type: String,
            default: 'next_purchase_only',
        },
        expiresAt: {
            type: Date,
            required: true,
        },
        status: {
            type: String,
            enum: ['active', 'used', 'expired'],
            default: 'active',
        },
    },
    { timestamps: true }
);

const ReferralReward = mongoose.model('ReferralReward', referralRewardSchema);

module.exports = { ReferralReward };
