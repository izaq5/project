export type CouponType = 'normal' | 'exclusivo';

export interface Coupon {
  code: string;
  type: CouponType;
  discountPercent: number;
  description: string;
  minValue?: number;
}

export interface CouponValidationResult {
  valid: boolean;
  coupon?: Coupon;
  message: string;
}
