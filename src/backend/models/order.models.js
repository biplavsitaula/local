const mongoose = require('mongoose');

/**
 * Order Schema Extension — Loyalty Points Flag
 *
 * Add this field to your existing Order schema to track whether
 * loyalty points have already been credited for an order.
 * This prevents double-crediting on repeat API calls.
 */

const loyaltyPointsField = {
    loyaltyPointsCredited: {
        type: Boolean,
        default: false,
    },
};

/**
 * If you already have an Order model, add the field above to your existing schema.
 * Below is a reference schema showing where the field fits:
 */
const orderSchema = new mongoose.Schema(
    {
        billNumber: { type: String, required: true, unique: true },
        customer: {
            fullName: { type: String, required: true },
            email: { type: String },
            mobile: { type: String, required: true },
            location: { type: String },
            pan: { type: String },
        },
        items: [
            {
                productId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Product',
                    required: true,
                },
                name: { type: String, required: true },
                quantity: { type: Number, required: true, min: 1 },
                price: { type: Number, required: true, min: 0 },
                total: { type: Number, required: true, min: 0 },
            },
        ],
        subtotal: { type: Number, default: 0 },
        deliveryFee: { type: Number, default: 0 },
        totalAmount: { type: Number, required: true, min: 0 },
        status: {
            type: String,
            enum: ['pending', 'accepted', 'processing', 'shipped', 'delivered', 'completed', 'cancelled', 'refunded', 'rejected'],
            default: 'pending',
        },
        paymentMethod: {
            type: String,
            enum: ['qr', 'cod', 'card', 'online'],
            required: true,
        },
        paymentGateway: {
            type: String,
            enum: ['esewa', 'khalti', 'card', null],
        },
        paymentStatus: {
            type: String,
            enum: ['pending', 'paid', 'failed', 'refunded'],
            default: 'pending',
        },

        // ─── Loyalty Points Tracking ────────────────────────────
        loyaltyPointsCredited: {
            type: Boolean,
            default: false,
        },
        // ────────────────────────────────────────────────────────

        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
    },
    { timestamps: true }
);

const Order = mongoose.model('Order', orderSchema);

module.exports = { Order, loyaltyPointsField };
