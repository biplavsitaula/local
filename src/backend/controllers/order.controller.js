const {
    calculateAndCreditLoyaltyPoints,
    deductLoyaltyPointsForOrder,
    CREDIT_STATUSES,
    DEDUCT_STATUSES,
} = require('../services/order.service');

/**
 * Order Controller — Loyalty Points Endpoint
 *
 * Handles the POST /orders/:id/loyalty-points route.
 * Validates input, routes to credit or deduct based on order status,
 * and returns a structured response.
 */

// All valid statuses that this endpoint accepts
const VALID_STATUSES = [...CREDIT_STATUSES, ...DEDUCT_STATUSES];

/**
 * Calculate and update loyalty points for an order.
 *
 * Accepts: { userId, orderTotal, orderStatus }
 * - delivered/completed → credits loyalty points
 * - cancelled/refunded → deducts previously credited points
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function calculateLoyaltyPointsController(req, res) {
    try {
        const { id } = req.params;
        const { userId, orderTotal, orderStatus } = req.body;

        // ─── Input Validation ────────────────────────────────────

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'Order ID is required in the URL parameter',
            });
        }

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'userId is required in the request body',
            });
        }

        if (orderTotal === undefined || orderTotal === null) {
            return res.status(400).json({
                success: false,
                message: 'orderTotal is required in the request body',
            });
        }

        if (typeof orderTotal !== 'number' || isNaN(orderTotal) || orderTotal <= 0) {
            return res.status(400).json({
                success: false,
                message: 'orderTotal must be a positive number',
            });
        }

        if (!orderStatus) {
            return res.status(400).json({
                success: false,
                message: 'orderStatus is required in the request body',
            });
        }

        if (!VALID_STATUSES.includes(orderStatus)) {
            return res.status(400).json({
                success: false,
                message: `Invalid orderStatus "${orderStatus}". Must be one of: ${VALID_STATUSES.join(', ')}`,
            });
        }

        // ─── Route to Credit or Deduct ───────────────────────────

        let result;

        if (CREDIT_STATUSES.includes(orderStatus)) {
            // Credit loyalty points for delivered/completed orders
            result = await calculateAndCreditLoyaltyPoints(id);

            return res.status(200).json({
                success: true,
                message: `Successfully credited ${result.pointsAwarded} loyalty points`,
                data: {
                    action: 'credit',
                    orderId: result.order._id,
                    billNumber: result.order.billNumber,
                    orderTotal: result.order.totalAmount,
                    orderStatus: result.order.status,
                    pointsAwarded: result.pointsAwarded,
                    tierMultiplier: result.tierMultiplier,
                    membershipTier: result.membershipTier,
                    updatedLoyalty: result.updatedLoyalty,
                },
            });
        }

        if (DEDUCT_STATUSES.includes(orderStatus)) {
            // Deduct loyalty points for cancelled/refunded orders
            result = await deductLoyaltyPointsForOrder(id);

            return res.status(200).json({
                success: true,
                message: `Successfully deducted ${result.pointsDeducted} loyalty points`,
                data: {
                    action: 'deduct',
                    orderId: result.order._id,
                    billNumber: result.order.billNumber,
                    orderTotal: result.order.totalAmount,
                    orderStatus: result.order.status,
                    pointsDeducted: result.pointsDeducted,
                    tierMultiplier: result.tierMultiplier,
                    membershipTier: result.membershipTier,
                    updatedLoyalty: result.updatedLoyalty,
                },
            });
        }
    } catch (error) {
        console.error('Loyalty points calculation error:', error);

        const statusCode = error.statusCode || 500;
        const message = error.message || 'Internal server error while calculating loyalty points';

        return res.status(statusCode).json({
            success: false,
            message,
        });
    }
}

module.exports = { calculateLoyaltyPointsController };
