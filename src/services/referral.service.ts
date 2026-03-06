import { apiGet, apiPost, ApiResponse } from '@/lib/api';

// ==================== Interfaces ====================

export interface ReferralReward {
    type: string;
    value: number;
    rewardCode: string;
    expiresAt: string;
    appliesTo: string;
    status: string;
}

export interface ClaimRewardResponse {
    success: boolean;
    message: string;
    reward: ReferralReward;
}

export interface Referral {
    _id: string;
    referrerId: string;
    referredUserId: {
        _id: string;
        name?: string;
        email?: string;
    };
    status: string;
    rewardClaimed: boolean;
    completedAt?: string;
    createdAt: string;
    updatedAt: string;
}

export interface ReferralRewardRecord {
    _id: string;
    referralId: string;
    userId: string;
    rewardCode: string;
    type: string;
    value: number;
    appliesTo: string;
    expiresAt: string;
    status: string;
    createdAt: string;
}

// ==================== Service ====================

export const referralService = {
    /**
     * Claim a referral reward
     * POST /customer/referral/claim
     */
    claimReward: async (referralId?: string): Promise<ClaimRewardResponse> => {
        const body = referralId ? { referralId } : {};
        const res = await apiPost<ClaimRewardResponse>('/customer/referral/claim', body);
        return res as unknown as ClaimRewardResponse;
    },

    /**
     * List all referrals made by the user
     * GET /customer/referrals
     */
    getReferrals: async (): Promise<ApiResponse<Referral[]>> => {
        return apiGet<Referral[]>('/customer/referrals');
    },

    /**
     * Send referral invitation
     * POST /customer/referral/invite
     */
    sendReferralInvite: async (data: { friendName: string; friendEmail: string }): Promise<ApiResponse<any>> => {
        return apiPost<any>('/customer/referral/invite', data);
    },

    /**
     * List all claimed referral rewards
     * GET /customer/referral/rewards
     */
    getRewards: async (): Promise<ApiResponse<ReferralRewardRecord[]>> => {
        return apiGet<ReferralRewardRecord[]>('/customer/referral/rewards');
    },
};
