export interface ProductReview {
  id: string;
  author: string;
  rating: number;
  comment: string;
  date: string;
}

export interface ProductSpec {
  label: string;
  value: string;
}

export interface ProductFaq {
  question: string;
  answer: string;
}

export type ProductBadge = 'mais-vendido' | 'novo' | 'exclusivo' | null;

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  images: string[];
  description: string;
  features: string[];
  specs: ProductSpec[];
  rating: number;
  reviewsCount: number;
  reviews: ProductReview[];
  stock: number;
  badge: ProductBadge;
  exclusive: boolean;
  faq: ProductFaq[];
  soldBy: string;
  freeShipping: boolean;
}
