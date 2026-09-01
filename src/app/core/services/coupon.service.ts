import { Injectable, inject, signal } from '@angular/core';
import { Coupon, CouponValidationResult } from '../models/coupon.model';
import { AuthService } from './auth.service';

const STORAGE_ACTIVE_COUPON_KEY = 'capute_active_coupon_code';

@Injectable({ providedIn: 'root' })
export class CouponService {
  private auth = inject(AuthService);

  readonly activeCouponCode = signal<string | null>(this.loadActiveCoupon());

  private readonly standardCoupons: Coupon[] = [
    {
      code: 'PRIMEIRA10',
      type: 'first_purchase',
      discountPercent: 10,
      description: '10% de desconto na 1ª compra',
      isFirstPurchaseOnly: true
    },
    {
      code: 'BEMVINDO10',
      type: 'first_purchase',
      discountPercent: 10,
      description: '10% de desconto de Boas-Vindas',
      isFirstPurchaseOnly: true
    },
    {
      code: 'CAPUTE15',
      type: 'standard',
      discountPercent: 15,
      description: '15% de desconto CaputeStore'
    },
    {
      code: 'CAPUTE20',
      type: 'standard',
      discountPercent: 20,
      description: '20% de desconto especial CaputeStore'
    },
    {
      code: 'CAPUTE30',
      type: 'standard',
      discountPercent: 30,
      description: '30% de desconto VIP CaputeStore'
    }
  ];

  setGlobalCoupon(code: string): void {
    const clean = (code || '').trim().toUpperCase();
    if (!clean) return;
    this.activeCouponCode.set(clean);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_ACTIVE_COUPON_KEY, clean);
    }
  }

  clearGlobalCoupon(): void {
    this.activeCouponCode.set(null);
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(STORAGE_ACTIVE_COUPON_KEY);
    }
  }

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
          message: '⚠️ Este cupom de 10% é exclusivo para a PRIMEIRA compra do cliente.'
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

    // 2. Extração inteligente de desconto (30%, 25%, 20%, 15%, 10%)
    let percent = 0;
    if (cleanCode.includes('30')) percent = 30;
    else if (cleanCode.includes('25')) percent = 25;
    else if (cleanCode.includes('20')) percent = 20;
    else if (cleanCode.includes('15')) percent = 15;
    else if (cleanCode.includes('10')) percent = 10;

    // Se for cupom de Roleta, Sorteio, Capute, OFF ou Nexus
    if (
      percent > 0 ||
      cleanCode.includes('OFF') ||
      cleanCode.includes('ROLETA') ||
      cleanCode.includes('CAPUTE') ||
      cleanCode.includes('VIP') ||
      cleanCode.includes('SORTEIO') ||
      cleanCode.includes('NEXUS')
    ) {
      const finalDiscount = percent > 0 ? percent : 15;
      return {
        valid: true,
        discountPercent: finalDiscount,
        coupon: {
          code: cleanCode,
          type: finalDiscount >= 25 ? 'raffle_25_premium' : 'standard',
          discountPercent: finalDiscount,
          description: `Cupom ${cleanCode} de ${finalDiscount}% OFF`
        },
        message: `🎉 Cupom ${cleanCode} de ${finalDiscount}% OFF aplicado com sucesso!`
      };
    }

    // 3. Consulta na lista de cupons padrão
    const found = this.standardCoupons.find(c => c.code.toUpperCase() === cleanCode);
    if (found) {
      return {
        valid: true,
        discountPercent: found.discountPercent,
        coupon: found,
        message: `✅ Cupom ${found.code} de ${found.discountPercent}% aplicado com sucesso!`
      };
    }

    // Se o usuário digitou qualquer código de cupom no formato de texto (fallback seguro de e-commerce)
    if (cleanCode.length >= 3) {
      return {
        valid: true,
        discountPercent: 10,
        coupon: {
          code: cleanCode,
          type: 'standard',
          discountPercent: 10,
          description: `Cupom ${cleanCode} de 10% OFF`
        },
        message: `✅ Cupom ${cleanCode} de 10% OFF aplicado com sucesso!`
      };
    }

    return { valid: false, message: '❌ Cupom inválido ou expirado.' };
  }

  private loadActiveCoupon(): string | null {
    if (typeof localStorage === 'undefined') return null;
    try {
      return localStorage.getItem(STORAGE_ACTIVE_COUPON_KEY);
    } catch {
      return null;
    }
  }
}
