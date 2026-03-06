const CustomerDashboard = require('../models/customerDashboard.models');
const { Order } = require('../models/order.models');

/**
 * Customer Dashboard Service — Loyalty Points & Dashboard Operations
 *
 * Handles crediting, deducting, and redeeming loyalty points,
 * tier progression, dashboard CRUD, favorites, and order stats.
 */

// ─── Tier Configuration ─────────────────────────────────────────

const TIER_THRESHOLDS = {
    Bronze: 0,
    Silver: 500,
    Gold: 2000,
    Platinum: 5000,
};

/**
 * Calculate membership tier based on total points earned
 */
function calculateTier(totalPointsEarned) {
    if (totalPointsEarned >= TIER_THRESHOLDS.Platinum) return 'Platinum';
    if (totalPointsEarned >= TIER_THRESHOLDS.Gold) return 'Gold';
    if (totalPointsEarned >= TIER_THRESHOLDS.Silver) return 'Silver';
    return 'Bronze';
}

/**
 * Calculate tier progress percentage toward the next tier
 */
function calculateTierProgress(totalPointsEarned) {
    if (totalPointsEarned >= TIER_THRESHOLDS.Platinum) return 100;

    const tiers = [
        { name: 'Bronze', min: TIER_THRESHOLDS.Bronze, max: TIER_THRESHOLDS.Silver },
        { name: 'Silver', min: TIER_THRESHOLDS.Silver, max: TIER_THRESHOLDS.Gold },
        { name: 'Gold', min: TIER_THRESHOLDS.Gold, max: TIER_THRESHOLDS.Platinum },
    ];

    for (const tier of tiers) {
        if (totalPointsEarned >= tier.min && totalPointsEarned < tier.max) {
            return Math.round(((totalPointsEarned - tier.min) / (tier.max - tier.min)) * 100);
        }
    }

    return 0;
}

// ─── Dashboard CRUD ─────────────────────────────────────────────

/**
 * Get or create a customer dashboard.
 * Auto-creates a new dashboard with defaults if none exists.
 *
 * @param {string} userId - The user's ID
 * @returns {Promise<Object>} Dashboard document
 */
async function getOrCreateDashboard(userId) {
    if (!userId) throw new Error('userId is required');

    let dashboard = await CustomerDashboard.findOne({ userId });

    if (!dashboard) {
        dashboard = await CustomerDashboard.create({
            userId,
            loyaltyPoints: 0,
            totalPointsEarned: 0,
            totalPointsRedeemed: 0,
            membershipTier: 'Bronze',
            tierProgress: 0,
            totalOrders: 0,
            totalSpent: 0,
            favoriteProducts: [],
            addresses: [],
            preferences: {
                emailNotifications: true,
                smsNotifications: false,
                orderUpdates: true,
                promotionalOffers: false,
            },
        });
    }

    return dashboard;
}

/**
 * Get full dashboard data with populated references and recent orders.
 *
 * @param {string} userId - The user's ID
 * @returns {Promise<Object>} Populated dashboard with stats and recentOrders
 */
async function getDashboard(userId) {
    if (!userId) throw new Error('userId is required');

    const dashboard = await getOrCreateDashboard(userId);

    // Populate userId and favoriteProducts
    await dashboard.populate([
        {
            path: 'userId',
            select: 'fullName email mobile role createdAt',
        },
        {
            path: 'favoriteProducts',
            select: 'name imageUrl price finalPrice category rating reviewCount brand',
        },
    ]);

    // Fetch recent orders for this user
    let recentOrders = [];
    try {
        recentOrders = await Order.find({ userId })
            .sort({ createdAt: -1 })
            .limit(10)
            .populate('items.productId', 'name imageUrl category price finalPrice')
            .lean();
    } catch (err) {
        // Orders collection may not exist yet — that's fine
        console.warn('Could not fetch recent orders:', err.message);
    }

    // Build stats object
    const stats = {
        totalOrders: dashboard.totalOrders,
        totalSpent: dashboard.totalSpent,
        loyaltyPoints: dashboard.loyaltyPoints,
        membershipTier: dashboard.membershipTier,
        tierProgress: dashboard.tierProgress,
    };

    // Return as a plain object matching the frontend interface
    const dashObj = dashboard.toObject();
    dashObj.recentOrders = recentOrders;
    dashObj.stats = stats;

    return dashObj;
}

/**
 * Get aggregated dashboard summary.
 *
 * @param {string} userId - The user's ID
 * @returns {Promise<Object>} Summary object
 */
async function getDashboardSummary(userId) {
    if (!userId) throw new Error('userId is required');

    const dashboard = await getOrCreateDashboard(userId);
    await dashboard.populate('userId', 'fullName email mobile createdAt');

    // Count orders by status
    let completedOrders = 0;
    let pendingOrders = 0;
    try {
        completedOrders = await Order.countDocuments({
            userId,
            status: { $in: ['delivered', 'completed'] },
        });
        pendingOrders = await Order.countDocuments({
            userId,
            status: { $in: ['pending', 'accepted', 'processing', 'shipped'] },
        });
    } catch (err) {
        console.warn('Could not count orders:', err.message);
    }

    return {
        user: {
            fullName: dashboard.userId?.fullName || '',
            email: dashboard.userId?.email || '',
            mobile: dashboard.userId?.mobile || '',
            memberSince: dashboard.userId?.createdAt || dashboard.createdAt,
        },
        loyalty: {
            currentPoints: dashboard.loyaltyPoints,
            totalEarned: dashboard.totalPointsEarned,
            totalRedeemed: dashboard.totalPointsRedeemed,
            membershipTier: dashboard.membershipTier,
            tierProgress: dashboard.tierProgress,
        },
        orders: {
            total: dashboard.totalOrders,
            completed: completedOrders,
            pending: pendingOrders,
            totalSpent: dashboard.totalSpent,
        },
        favorites: dashboard.favoriteProducts.length,
        addresses: dashboard.addresses.length,
    };
}

/**
 * Update profile data (preferences, addresses, dateOfBirth).
 *
 * @param {string} userId - The user's ID
 * @param {Object} data - Fields to update
 * @returns {Promise<Object>} Updated dashboard
 */
async function updateDashboard(userId, data) {
    if (!userId) throw new Error('userId is required');

    const dashboard = await getOrCreateDashboard(userId);

    if (data.preferences) {
        dashboard.preferences = {
            ...dashboard.preferences.toObject(),
            ...data.preferences,
        };
    }

    if (data.addresses !== undefined) {
        dashboard.addresses = data.addresses;
    }

    if (data.dateOfBirth !== undefined) {
        dashboard.dateOfBirth = data.dateOfBirth;
    }

    await dashboard.save();

    return dashboard;
}

// ─── Favorites ──────────────────────────────────────────────────

/**
 * Add a product to the customer's favorites.
 *
 * @param {string} userId
 * @param {string} productId
 * @returns {Promise<Object>} Updated dashboard (favoriteProducts populated)
 */
async function addFavoriteProduct(userId, productId) {
    if (!userId) throw new Error('userId is required');
    if (!productId) throw new Error('productId is required');

    const dashboard = await getOrCreateDashboard(userId);

    // Use addToSet to avoid duplicates
    await CustomerDashboard.updateOne(
        { _id: dashboard._id },
        { $addToSet: { favoriteProducts: productId } }
    );

    const updated = await CustomerDashboard.findById(dashboard._id).populate(
        'favoriteProducts',
        'name imageUrl price finalPrice category rating reviewCount brand'
    );

    return updated;
}

/**
 * Remove a product from the customer's favorites.
 *
 * @param {string} userId
 * @param {string} productId
 * @returns {Promise<Object>} Updated dashboard (favoriteProducts populated)
 */
async function removeFavoriteProduct(userId, productId) {
    if (!userId) throw new Error('userId is required');
    if (!productId) throw new Error('productId is required');

    const dashboard = await getOrCreateDashboard(userId);

    await CustomerDashboard.updateOne(
        { _id: dashboard._id },
        { $pull: { favoriteProducts: productId } }
    );

    const updated = await CustomerDashboard.findById(dashboard._id).populate(
        'favoriteProducts',
        'name imageUrl price finalPrice category rating reviewCount brand'
    );

    return updated;
}

// ─── Loyalty Points ─────────────────────────────────────────────

/**
 * Credit loyalty points to a customer's dashboard.
 *
 * @param {string} userId - The user's ID
 * @param {number} points - Number of points to credit
 * @param {string} [reason] - Optional reason for crediting
 * @returns {Promise<Object>} Updated dashboard document
 */
async function creditLoyaltyPoints(userId, points, reason = 'Order reward') {
    if (!userId) throw new Error('userId is required');
    if (!points || points <= 0) throw new Error('Points must be a positive number');

    const dashboard = await getOrCreateDashboard(userId);

    dashboard.loyaltyPoints += points;
    dashboard.totalPointsEarned += points;

    dashboard.membershipTier = calculateTier(dashboard.totalPointsEarned);
    dashboard.tierProgress = calculateTierProgress(dashboard.totalPointsEarned);

    await dashboard.save();

    return dashboard;
}

/**
 * Deduct loyalty points from a customer's dashboard.
 * Used when orders are cancelled or refunded.
 *
 * @param {string} userId - The user's ID
 * @param {number} points - Number of points to deduct
 * @param {string} [reason] - Optional reason for deduction
 * @returns {Promise<Object>} Updated dashboard document
 */
async function deductLoyaltyPoints(userId, points, reason = 'Order cancellation') {
    if (!userId) throw new Error('userId is required');
    if (!points || points <= 0) throw new Error('Points must be a positive number');

    const dashboard = await getOrCreateDashboard(userId);

    if (dashboard.loyaltyPoints < points) {
        dashboard.totalPointsRedeemed += dashboard.loyaltyPoints;
        dashboard.loyaltyPoints = 0;
    } else {
        dashboard.loyaltyPoints -= points;
        dashboard.totalPointsRedeemed += points;
    }

    // Tier doesn't downgrade on deduction — totalPointsEarned stays the same
    dashboard.tierProgress = calculateTierProgress(dashboard.totalPointsEarned);

    await dashboard.save();

    return dashboard;
}

/**
 * Redeem loyalty points (customer-initiated).
 * Validates balance before deducting.
 *
 * @param {string} userId - The user's ID
 * @param {number} points - Number of points to redeem
 * @returns {Promise<Object>} Updated dashboard document
 */
async function redeemLoyaltyPoints(userId, points) {
    if (!userId) throw new Error('userId is required');
    if (!points || points <= 0) throw new Error('Points must be a positive number');

    const dashboard = await getOrCreateDashboard(userId);

    if (dashboard.loyaltyPoints < points) {
        throw Object.assign(
            new Error(
                `Insufficient loyalty points. Available: ${dashboard.loyaltyPoints}, requested: ${points}`
            ),
            { statusCode: 400 }
        );
    }

    dashboard.loyaltyPoints -= points;
    dashboard.totalPointsRedeemed += points;

    // Tier doesn't downgrade on redemption
    dashboard.tierProgress = calculateTierProgress(dashboard.totalPointsEarned);

    await dashboard.save();

    return dashboard;
}

// ─── Order Stats ────────────────────────────────────────────────

/**
 * Record an order's contribution to the dashboard stats.
 * Call this when an order is placed or completed.
 *
 * @param {string} userId - The user's ID
 * @param {number} orderTotal - The order total amount
 * @returns {Promise<Object>} Updated dashboard document
 */
async function recordOrderStats(userId, orderTotal) {
    if (!userId) throw new Error('userId is required');
    if (orderTotal === undefined || orderTotal === null) {
        throw new Error('orderTotal is required');
    }

    const dashboard = await getOrCreateDashboard(userId);

    dashboard.totalOrders += 1;
    dashboard.totalSpent += orderTotal;

    await dashboard.save();

    return dashboard;
}

// ─── Exports ────────────────────────────────────────────────────

module.exports = {
    // Dashboard CRUD
    getOrCreateDashboard,
    getDashboard,
    getDashboardSummary,
    updateDashboard,

    // Favorites
    addFavoriteProduct,
    removeFavoriteProduct,

    // Loyalty Points
    creditLoyaltyPoints,
    deductLoyaltyPoints,
    redeemLoyaltyPoints,

    // Order Stats
    recordOrderStats,

    // Helpers
    calculateTier,
    calculateTierProgress,
    TIER_THRESHOLDS,
};
