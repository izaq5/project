export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  exclusiveMember: boolean; // Alias for VIP/Premium
  isVip: boolean;
  isPremium: boolean;
  hasMadeFirstPurchase: boolean;
  wonCoupons?: string[];
  createdAt: string;
  avatarUrl?: string;
}

export interface StoredUser extends User {
  password: string;
}
