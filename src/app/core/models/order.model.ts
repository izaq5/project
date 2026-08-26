import { CartItem } from './cart.model';

export type OrderStatus = 'processando' | 'enviado' | 'entregue';

export interface Order {
  id: string;
  number: string;
  date: string;
  items: CartItem[];
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  status: OrderStatus;
  paymentMethod: 'pix' | 'cartao' | 'boleto';
  couponCode?: string;
  shippingType: 'padrao' | 'expressa';
  address: {
    name: string;
    phone: string;
    cep: string;
    state: string;
    city: string;
    street: string;
    number: string;
    complement?: string;
  };
}
