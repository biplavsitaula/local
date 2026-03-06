const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema(
    {
        label: { type: String, required: true },
        address: { type: String, required: true },
        city: { type: String, required: true },
        isDefault: { type: Boolean, default: false },
    },
    { _id: true }
);

const preferencesSchema = new mongoose.Schema(
    {
        emailNotifications: { type: Boolean, default: true },
        smsNotifications: { type: Boolean, default: false },
        orderUpdates: { type: Boolean, default: true },
        promotionalOffers: { type: Boolean, default: false },
    },
    { _id: false }
);

const customerDashboardSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true,
            index: true,
        },

        // ─── Loyalty Points ─────────────────────────────────────
        loyaltyPoints: { type: Number, default: 0, min: 0 },
        totalPointsEarned: { type: Number, default: 0, min: 0 },
        totalPointsRedeemed: { type: Number, default: 0, min: 0 },

        // ─── Membership Tier ────────────────────────────────────
        membershipTier: {
            type: String,
            enum: ['Bronze', 'Silver', 'Gold', 'Platinum'],
            default: 'Bronze',
        },
        tierProgress: { type: Number, default: 0, min: 0, max: 100 },

        // ─── Order Stats ────────────────────────────────────────
        totalOrders: { type: Number, default: 0, min: 0 },
        totalSpent: { type: Number, default: 0, min: 0 },

        // ─── Favorites ──────────────────────────────────────────
        favoriteProducts: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
            },
        ],

        // ─── Profile ────────────────────────────────────────────
        addresses: [addressSchema],
        dateOfBirth: { type: Date },
        preferences: {
            type: preferencesSchema,
            default: () => ({}),
        },
    },
    { timestamps: true }
);

const CustomerDashboard = mongoose.model('CustomerDashboard', customerDashboardSchema);

module.exports = CustomerDashboard;
