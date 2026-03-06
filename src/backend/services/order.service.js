const { Order } = require('../models/order.models');
const CustomerDashboard = require('../models/customerDashboard.models');
const {
    creditLoyaltyPoints,
    deductLoyaltyPoints,
} = require('./customerDashboard.service');

/**
 * Order Service — Loyalty Points Calculation & Management
 *
 * Handles calculating, crediting, and deducting loyalty points
 * for orders based on customer tier and order status.
 */

// Tier multipliers for loyalty point calculation
const TIER_MULTIPLIERS = {
    Bronze: 1,
    Silver: 1,
    Gold: 1.5,
    Platinum: 2,
};

// Order statuses that qualify for points crediting
const CREDIT_STATUSES = ['delivered', 'completed'];

// Order statuses that trigger points deduction
const DEDUCT_STATUSES = ['cancelled', 'refunded'];

/**
 * Calculate the number of loyalty points for a given order total and tier.
 * Base rate: 1 point per unit of currency spent, multiplied by tier.
 *
 * @param {number} orderTotal - The order total amount
 * @param {string} membershipTier - Customer's membership tier
 * @returns {number} Calculated loyalty points (integer)
 */
function calculatePoints(orderTotal, membershipTier) {
    const multiplier = TIER_MULTIPLIERS[membershipTier] || 1;
    return Math.floor(orderTotal * multiplier);
}

/**
 * Calculate and credit loyalty points for a completed/delivered order.
 *
 * - Validates the order exists and has a qualifying status
 * - Prevents double-crediting via the loyaltyPointsCredited flag
 * - Looks up the customer's tier for multiplier calculation
 * - Credits points to the customer dashboard
 * - Marks the order as having credited points
 *
 * @param {string} orderId - The order's MongoDB _id
 * @returns {Promise<Object>} Result with order, points awarded, and updated dashboard
 */
async function calculateAndCreditLoyaltyPoints(orderId) {
    // 1. Find the order
    const order = await Order.findById(orderId);
    if (!order) {
        throw Object.assign(new Error('Order not found'), { statusCode: 404 });
    }

    // 2. Validate order status
    if (!CREDIT_STATUSES.includes(order.status)) {
        throw Object.assign(
            new Error(
                `Cannot credit points for order status "${order.status}". Order must be delivered or completed.`
            ),
            { statusCode: 400 }
        );
    }

    // 3. Check for duplicate crediting
    if (order.loyaltyPointsCredited) {
        throw Object.assign(
            new Error('Loyalty points have already been credited for this order'),
            { statusCode: 400 }
        );
    }

    // 4. Get customer dashboard to determine tier
    const userId = order.userId;
    if (!userId) {
        throw Object.assign(
            new Error('Order does not have an associated user'),
            { statusCode: 400 }
        );
    }

    const dashboard = await CustomerDashboard.findOne({ userId });
    if (!dashboard) {
        throw Object.assign(
            new Error('Customer dashboard not found for this user'),
            { statusCode: 404 }
        );
    }

    // 5. Calculate points
    const membershipTier = dashboard.membershipTier || 'Bronze';
    const pointsAwarded = calculatePoints(order.totalAmount, membershipTier);

    if (pointsAwarded <= 0) {
        throw Object.assign(
            new Error('No points to award for this order total'),
            { statusCode: 400 }
        );
    }

    // 6. Credit points to the customer dashboard
    const updatedDashboard = await creditLoyaltyPoints(
        userId.toString(),
        pointsAwarded,
        `Order ${order.billNumber} reward`
    );

    // 7. Mark order as having credited loyalty points
    order.loyaltyPointsCredited = true;
    await order.save();

    return {
        order: {
            _id: order._id,
            billNumber: order.billNumber,
            totalAmount: order.totalAmount,
            status: order.status,
            loyaltyPointsCredited: order.loyaltyPointsCredited,
        },
        pointsAwarded,
        tierMultiplier: TIER_MULTIPLIERS[membershipTier],
        membershipTier,
        updatedLoyalty: {
            loyaltyPoints: updatedDashboard.loyaltyPoints,
            totalPointsEarned: updatedDashboard.totalPointsEarned,
            membershipTier: updatedDashboard.membershipTier,
            tierProgress: updatedDashboard.tierProgress,
        },
    };
}

/**
 * Deduct loyalty points for a cancelled or refunded order.
 *
 * - Validates the order exists and has a qualifying status
 * - Only deducts if points were previously credited
 * - Recalculates the same points that were originally awarded
 * - Updates the customer dashboard and resets the order flag
 *
 * @param {string} orderId - The order's MongoDB _id
 * @returns {Promise<Object>} Result with order, points deducted, and updated dashboard
 */
async function deductLoyaltyPointsForOrder(orderId) {
    // 1. Find the order
    const order = await Order.findById(orderId);
    if (!order) {
        throw Object.assign(new Error('Order not found'), { statusCode: 404 });
    }

    // 2. Validate order status
    if (!DEDUCT_STATUSES.includes(order.status)) {
        throw Object.assign(
            new Error(
                `Cannot deduct points for order status "${order.status}". Order must be cancelled or refunded.`
            ),
            { statusCode: 400 }
        );
    }

    // 3. Check if points were previously credited
    if (!order.loyaltyPointsCredited) {
        throw Object.assign(
            new Error('No loyalty points were credited for this order; nothing to deduct'),
            { statusCode: 400 }
        );
    }

    // 4. Get customer dashboard to determine tier at time of crediting
    const userId = order.userId;
    if (!userId) {
        throw Object.assign(
            new Error('Order does not have an associated user'),
            { statusCode: 400 }
        );
    }

    const dashboard = await CustomerDashboard.findOne({ userId });
    if (!dashboard) {
        throw Object.assign(
            new Error('Customer dashboard not found for this user'),
            { statusCode: 404 }
        );
    }

    // 5. Recalculate the same points (using current tier — consistent with original crediting)
    const membershipTier = dashboard.membershipTier || 'Bronze';
    const pointsToDeduct = calculatePoints(order.totalAmount, membershipTier);

    // 6. Deduct points from the customer dashboard
    const updatedDashboard = await deductLoyaltyPoints(
        userId.toString(),
        pointsToDeduct,
        `Order ${order.billNumber} cancellation/refund`
    );

    // 7. Reset the loyalty points credited flag
    order.loyaltyPointsCredited = false;
    await order.save();

    return {
        order: {
            _id: order._id,
            billNumber: order.billNumber,
            totalAmount: order.totalAmount,
            status: order.status,
            loyaltyPointsCredited: order.loyaltyPointsCredited,
        },
        pointsDeducted: pointsToDeduct,
        tierMultiplier: TIER_MULTIPLIERS[membershipTier],
        membershipTier,
        updatedLoyalty: {
            loyaltyPoints: updatedDashboard.loyaltyPoints,
            totalPointsEarned: updatedDashboard.totalPointsEarned,
            membershipTier: updatedDashboard.membershipTier,
            tierProgress: updatedDashboard.tierProgress,
        },
    };
}

module.exports = {
    calculateAndCreditLoyaltyPoints,
    deductLoyaltyPointsForOrder,
    calculatePoints,
    TIER_MULTIPLIERS,
    CREDIT_STATUSES,
    DEDUCT_STATUSES,
};
