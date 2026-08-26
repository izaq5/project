import { Injectable, inject } from '@angular/core';
import { Coupon, CouponValidationResult } from '../models/coupon.model';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class CouponService {
  private auth = inject(AuthService);

  private readonly standardCoupons: Coupon[] = [
    {
      code: 'PRIMEIRA10',
      type: 'first_purchase',
      discountPercent: 10,
      description: '10% de desconto automático na sua 1ª compra',
      isFirstPurchaseOnly: true
    },
    {
      code: 'CAPUTE15',
      type: 'standard',
      discountPercent: 15,
      description: '15% de desconto para compras acima de R$ 150',
      minValue: 150
    },
    {
      code: 'CAPUTE20',
      type: 'standard',
      discountPercent: 20,
      description: '20% de desconto especial CaputeStore acima de R$ 300',
      minValue: 300
    }
  ];

  validate(code: string, subtotal: number): CouponValidationResult {
    const cleanCode = (code || '').trim().toUpperCase();
    const user = this.auth.currentUser();

    if (!cleanCode) {
      return { valid: false, message: 'Digite um código de cupom.' };
    }

    // 1. Regra de Negócio: Cupom de Primeira Compra (10%)
    if (cleanCode === 'PRIMEIRA10' || cleanCode === 'BEMVINDO10') {
      if (user?.hasMadeFirstPurchase) {
        return {
          valid: false,
          message: '❌ Este cupom de 10% é válido EXCLUSIVAMENTE para a PRIMEIRA compra do cliente. Você já possui compras registradas em sua conta.'
        };
      }
      return {
        valid: true,
        discountPercent: 10,
        coupon: {
          code: cleanCode,
          type: 'first_purchase',
          discountPercent: 10,
          description: '10% OFF na Primeira Compra'
        },
        message: '✅ Cupom de 10% de Primeira Compra aplicado com sucesso!'
      };
    }

    // 2. Regra: Cupons Individuais de Sorteios (15%, 25%, 30%)
    if (cleanCode.includes('OFF-CAPUTE-') || cleanCode.includes('PREMIUM')) {
      const wonList = user?.wonCoupons || [];
      const hasWonThisCode = wonList.some(c => c.toUpperCase() === cleanCode);

      if (!hasWonThisCode && !cleanCode.startsWith('CAPUTE')) {
        return {
          valid: false,
          message: '❌ Este cupom de sorteio pertence a outro participante contemplado ou ainda não foi sorteado.'
        };
      }

      // Se for cupom de 25% ou 30% Premium, exige status Premium/VIP
      if ((cleanCode.includes('25') || cleanCode.includes('30')) && !user?.isPremium && !user?.isVip) {
        return {
          valid: false,
          message: '🔒 Este cupom é EXCLUSIVO para membros Premium ou VIP CaputeStore.'
        };
      }

      let discount = 15;
      if (cleanCode.includes('25')) discount = 25;
      if (cleanCode.includes('30')) discount = 30;

      return {
        valid: true,
        discountPercent: discount,
        coupon: {
          code: cleanCode,
          type: discount > 15 ? 'raffle_25_premium' : 'raffle_15',
          discountPercent: discount,
          description: `Cupom de ${discount}% OFF de Sorteio`
        },
        message: `✅ Cupom de Sorteio de ${discount}% OFF aplicado com sucesso!`
      };
    }

    // 3. Cupons Padrão da Loja
    const found = this.standardCoupons.find(c => c.code.toUpperCase() === cleanCode);
    if (!found) {
      return { valid: false, message: '❌ Cupom inválido ou não encontrado.' };
    }

    if (found.minValue && subtotal < found.minValue) {
      return {
        valid: false,
        message: `⚠️ Este cupom exige valor mínimo de R$ ${found.minValue.toFixed(2).replace('.', ',')}.`
      };
    }

    return {
      valid: true,
      discountPercent: found.discountPercent,
      coupon: found,
      message: `✅ Cupom ${found.code} de ${found.discountPercent}% aplicado com sucesso!`
    };
  }
}
