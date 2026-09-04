export type CouponType = 'first_purchase' | 'raffle_15' | 'raffle_25_premium' | 'raffle_30_premium' | 'standard' | 'exclusivo';

export interface Coupon {
  code: string;
  type: CouponType;
  discountPercent: number;
  description: string;
  minValue?: number;
  category?: string;
  isFirstPurchaseOnly?: boolean;
  isPremiumOnly?: boolean;
  assignedUserId?: string;
  status?: 'available' | 'upcoming' | 'expired';
  expiresAt?: string;
  expiresInSeconds?: number;
  startsAt?: string;
  minProductPrice?: number;
  badgeTag?: string;
  isHighValue?: boolean;
}

export interface CouponValidationResult {
  valid: boolean;
  coupon?: Coupon;
  message: string;
  discountPercent?: number;
}

export interface DrawCampaign {
  id: string;
  title: string;
  discount: number;
  totalCoupons: number;
  claimedCount: number;
  requiresPremium: boolean;
  hasParticipated?: boolean;
  canParticipate?: boolean;
  winners?: string[];
}
