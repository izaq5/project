import { Injectable } from '@angular/core';
import { Coupon, CouponType, CouponValidationResult } from '../models/coupon.model';

@Injectable({ providedIn: 'root' })
export class CouponService {
  private readonly coupons: Coupon[] = [
    {
      code: 'BEMVINDO10',
      type: 'normal',
      discountPercent: 10,
      description: '10% de desconto para novos clientes em qualquer compra.',
    },
    {
      code: 'PREMIUM15',
      type: 'normal',
      discountPercent: 15,
      description: '15% de desconto em toda a loja acima de R$ 100.',
      minValue: 100,
    },
    {
      code: 'NEXUSVIP',
      type: 'exclusivo',
      discountPercent: 25,
      description: '25% OFF exclusivo para membros Nexus VIP acima de R$ 150.',
      minValue: 150,
    },
    {
      code: 'BLACK30',
      type: 'exclusivo',
      discountPercent: 30,
      description: '30% OFF exclusivo — oferta especial para membros Nexus VIP acima de R$ 200.',
      minValue: 200,
    },
  ];

  getAll(): Coupon[] {
    return this.coupons;
  }

  getByType(type: CouponType): Coupon[] {
    return this.coupons.filter((c) => c.type === type);
  }

  validate(code: string, subtotal: number, isExclusiveMember: boolean): CouponValidationResult {
    const found = this.coupons.find((c) => c.code.toLowerCase() === code.trim().toLowerCase());

    if (!code.trim()) {
      return { valid: false, message: 'Digite um cupom de desconto.' };
    }
    if (!found) {
      return { valid: false, message: 'Cupom inválido ou expirado.' };
    }
    if (found.type === 'exclusivo' && !isExclusiveMember) {
      return { valid: false, message: 'Este cupom é exclusivo para membros Nexus VIP. Cadastre-se para desbloquear.' };
    }
    if (found.minValue && subtotal < found.minValue) {
      return { valid: false, message: `Valor mínimo de R$ ${found.minValue.toFixed(2).replace('.', ',')} para usar este cupom.` };
    }

    return {
      valid: true,
      coupon: found,
      message: `Cupom aplicado com sucesso! ${found.discountPercent}% de desconto aplicado.`,
    };
  }
}
