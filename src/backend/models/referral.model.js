const mongoose = require('mongoose');

/**
 * Referral Schema
 *
 * Tracks referral relationships between users.
 * A referral is "completed" when the referred user signs up,
 * and "rewardClaimed" becomes true once the referrer claims their reward.
 */
const referralSchema = new mongoose.Schema(
    {
        referrerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        referredUserId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        status: {
            type: String,
            enum: ['pending', 'completed'],
            default: 'pending',
        },
        rewardClaimed: {
            type: Boolean,
            default: false,
        },
        completedAt: {
            type: Date,
        },
    },
    { timestamps: true }
);

// Compound index for the claim query:
// find({ referrerId, status: "completed", rewardClaimed: false })
referralSchema.index({ referrerId: 1, status: 1, rewardClaimed: 1 });

const Referral = mongoose.model('Referral', referralSchema);

module.exports = { Referral };
