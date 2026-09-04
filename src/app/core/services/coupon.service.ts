import { Injectable, inject, signal } from '@angular/core';
import { Coupon, CouponValidationResult } from '../models/coupon.model';
import { CartItem } from '../models/cart.model';
import { AuthService } from './auth.service';

const STORAGE_ACTIVE_COUPON_KEY = 'capute_active_coupon_code';

@Injectable({ providedIn: 'root' })
export class CouponService {
  private auth = inject(AuthService);

  readonly activeCouponCode = signal<string | null>(this.loadActiveCoupon());

  // Catálogo de cupons fixos e cupons de nicho (Exclusivos para membros VIP)
  readonly vipNicheCoupons: Coupon[] = [
    // 1. Nichos por Categoria
    {
      code: 'VIPGAMES20',
      type: 'exclusivo',
      discountPercent: 20,
      description: '20% OFF em toda a categoria Games',
      category: 'Games',
      isPremiumOnly: true,
      status: 'available',
      expiresInSeconds: 14400,
      expiresAt: 'Hoje às 23:59',
      badgeTag: '🎮 20% Games'
    },
    {
      code: 'CELULAR15VIP',
      type: 'exclusivo',
      discountPercent: 15,
      description: '15% OFF em Celulares e Smartphones',
      category: 'Celulares',
      isPremiumOnly: true,
      status: 'available',
      expiresInSeconds: 14400,
      expiresAt: 'Hoje às 23:59',
      badgeTag: '📱 15% Celulares'
    },
    {
      code: 'NOTEBOOK15VIP',
      type: 'exclusivo',
      discountPercent: 15,
      description: '15% OFF em Notebooks e Laptops',
      category: 'Notebooks',
      isPremiumOnly: true,
      status: 'available',
      expiresInSeconds: 14400,
      expiresAt: 'Hoje às 23:59',
      badgeTag: '💻 15% Notebooks'
    },
    {
      code: 'FONES25VIP',
      type: 'exclusivo',
      discountPercent: 25,
      description: '25% OFF em Fones e Headphones',
      category: 'Fones',
      isPremiumOnly: true,
      status: 'available',
      expiresInSeconds: 10800,
      expiresAt: 'Hoje às 22:00',
      badgeTag: '🎧 25% Fones'
    },
    {
      code: 'MONITOR15VIP',
      type: 'exclusivo',
      discountPercent: 15,
      description: '15% OFF em Monitores de Alta Performance',
      category: 'Monitores',
      isPremiumOnly: true,
      status: 'available',
      expiresInSeconds: 14400,
      expiresAt: 'Hoje às 23:59',
      badgeTag: '🖥️ 15% Monitores'
    },
    {
      code: 'WATCH20VIP',
      type: 'exclusivo',
      discountPercent: 20,
      description: '20% OFF em Smartwatches e Relógios Inteligentes',
      category: 'Smartwatches',
      isPremiumOnly: true,
      status: 'available',
      expiresInSeconds: 14400,
      expiresAt: 'Hoje às 23:59',
      badgeTag: '⌚ 20% Relógios'
    },
    {
      code: 'ACESSORIOS20VIP',
      type: 'exclusivo',
      discountPercent: 20,
      description: '20% OFF em Acessórios Eletrônicos',
      category: 'Acessórios',
      isPremiumOnly: true,
      status: 'available',
      expiresInSeconds: 14400,
      expiresAt: 'Hoje às 23:59',
      badgeTag: '🔌 20% Acessórios'
    },
    // 2. Cupons Fixos Globais (VIP)
    {
      code: 'VIP30',
      type: 'standard',
      discountPercent: 30,
      description: '30% OFF em toda a loja (VIP Exclusivo)',
      isPremiumOnly: true,
      status: 'available',
      expiresInSeconds: 7200,
      expiresAt: 'Hoje às 21:00',
      badgeTag: '👑 30% VIP'
    },
    {
      code: 'VIP15',
      type: 'standard',
      discountPercent: 15,
      description: '15% OFF fixo em toda a loja para membros VIP',
      isPremiumOnly: true,
      status: 'available',
      expiresInSeconds: 18000,
      expiresAt: 'Hoje às 23:59',
      badgeTag: '👑 15% VIP'
    }
  ];

  // Cupons Disponíveis com regras de tempo e alto valor
  readonly specialAvailableCoupons: Coupon[] = [
    {
      code: 'PRIMEIRA10',
      type: 'first_purchase',
      discountPercent: 10,
      description: '10% de desconto especial com limite de 6 horas para resgatar!',
      isFirstPurchaseOnly: true,
      status: 'available',
      expiresInSeconds: 6 * 3600, // 6 Horas
      expiresAt: 'Expira em 6 horas',
      badgeTag: '⏱️ 10% (6 HORAS LIMITE)'
    },
    {
      code: 'ALTOVALOR25',
      type: 'exclusivo',
      discountPercent: 25,
      description: '25% OFF exclusivo para produtos de alto valor (a partir de R$ 2.000). Válido por no mínimo 1h30!',
      isHighValue: true,
      minProductPrice: 2000,
      status: 'available',
      expiresInSeconds: 5400, // 1h30 = 90 minutos
      expiresAt: 'Expira em 01:30:00',
      badgeTag: '💎 25% ALTO VALOR (1h30)'
    }
  ];

  // Cupons Em Breve (Próximos a serem liberados)
  readonly upcomingCoupons: Coupon[] = [
    {
      code: 'HORA15',
      type: 'standard',
      discountPercent: 15,
      description: '15% OFF em toda a loja. Liberado a partir das 18:00h para todos os clientes!',
      status: 'upcoming',
      startsAt: '18:00',
      badgeTag: '⏳ LIBERA ÀS 18:00'
    },
    {
      code: 'NOTURNO30',
      type: 'standard',
      discountPercent: 30,
      description: 'Super Flash Drop Noturno de 30% OFF para compras noturnas. Desbloqueia às 22:00h!',
      status: 'upcoming',
      startsAt: '22:00',
      badgeTag: '🌙 LIBERA ÀS 22:00'
    }
  ];

  getAvailableCoupons(): Coupon[] {
    const list: Coupon[] = [...this.specialAvailableCoupons];
    if (this.auth.isVip()) {
      list.push(...this.vipNicheCoupons);
    }
    return list;
  }

  getUpcomingCouponsList(): Coupon[] {
    return this.upcomingCoupons;
  }

  getVipCoupons(category?: string): Coupon[] {
    if (!this.auth.isVip()) {
      return [];
    }
    if (!category || category.toLowerCase() === 'todas' || category.toLowerCase() === 'todos') {
      return this.vipNicheCoupons;
    }
    return this.vipNicheCoupons.filter(
      c => c.category?.toLowerCase() === category.toLowerCase() || (!c.category && category.toLowerCase() === 'geral')
    );
  }

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

  validate(code: string, subtotal: number, cartItems: CartItem[] = []): CouponValidationResult {
    const cleanCode = (code || '').trim().toUpperCase();
    const isVip = this.auth.isVip();
    const user = this.auth.currentUser();

    if (!cleanCode) {
      return { valid: false, message: 'Digite um código de cupom.' };
    }

    // 1. Regra: Cupom de Primeira Compra (10% OFF - Limite 6 Horas)
    if (cleanCode === 'PRIMEIRA10' || cleanCode === 'BEMVINDO10') {
      if (user?.hasMadeFirstPurchase) {
        return {
          valid: false,
          message: '⚠️ Este cupom de 10% é exclusivo para a 1ª compra. Você já realizou compras anteriormente.'
        };
      }
      return {
        valid: true,
        discountPercent: 10,
        coupon: {
          code: cleanCode,
          type: 'first_purchase',
          discountPercent: 10,
          description: '10% OFF na Primeira Compra (Limite de 6 horas)',
          isFirstPurchaseOnly: true,
          status: 'available',
          expiresInSeconds: 6 * 3600
        },
        message: '🎉 Cupom de 10% OFF ativado com sucesso para sua primeira compra!'
      };
    }

    // 2. Regra: Cupom de 25% OFF para Produtos de Alto Valor (mínimo R$ 2.000)
    if (cleanCode === 'ALTOVALOR25') {
      const hasHighValueItem = cartItems.some(i => i.product.price >= 2000);
      if (cartItems.length > 0 && !hasHighValueItem) {
        return {
          valid: false,
          message: '⚠️ O cupom ALTOVALOR25 de 25% OFF é válido exclusivamente para produtos de alto valor (itens a partir de R$ 2.000,00). Adicione um item elegível.'
        };
      }
      return {
        valid: true,
        discountPercent: 25,
        coupon: {
          code: 'ALTOVALOR25',
          type: 'exclusivo',
          discountPercent: 25,
          description: '25% OFF em produtos de alto valor (a partir de R$ 2.000)',
          minProductPrice: 2000,
          isHighValue: true,
          status: 'available',
          expiresInSeconds: 5400
        },
        message: '💎 Cupom ALTOVALOR25 de 25% OFF aplicado para itens de alto valor!'
      };
    }

    // 3. Regra: Cupom de 15% OFF Agendado
    if (cleanCode === 'HORA15' || cleanCode === 'CAPUTE15') {
      return {
        valid: true,
        discountPercent: 15,
        coupon: {
          code: cleanCode,
          type: 'standard',
          discountPercent: 15,
          description: '15% OFF em toda a loja',
          status: 'available'
        },
        message: `🎉 Cupom ${cleanCode} de 15% OFF aplicado com sucesso!`
      };
    }

    // 4. Busca no catálogo de cupons VIP (nicho e fixos)
    const vipFound = this.vipNicheCoupons.find(c => c.code.toUpperCase() === cleanCode);
    if (vipFound) {
      if (!isVip) {
        return {
          valid: false,
          message: '⚠️ Este cupom é exclusivo para membros VIP. Assine o Plano VIP (R$ 20,00) para desbloquear!'
        };
      }

      // Se for cupom de nicho por categoria, verifica se o carrinho possui itens dessa categoria
      if (vipFound.category) {
        const hasCategoryItem = cartItems.some(
          item => item.product.category?.toLowerCase() === vipFound.category?.toLowerCase()
        );

        if (!hasCategoryItem && cartItems.length > 0) {
          return {
            valid: false,
            message: `⚠️ O cupom ${vipFound.code} é válido apenas para produtos da categoria "${vipFound.category}". Adicione itens dessa categoria ao carrinho.`
          };
        }
      }

      return {
        valid: true,
        coupon: vipFound,
        discountPercent: vipFound.discountPercent,
        message: vipFound.category
          ? `🎉 Cupom VIP de ${vipFound.discountPercent}% OFF aplicado para itens de ${vipFound.category}!`
          : `🎉 Cupom VIP ${vipFound.code} de ${vipFound.discountPercent}% OFF aplicado com sucesso!`
      };
    }

    // 5. Cupons de Sorteio e Roleta (ex: 30OFF-CAPUTE-8492, 25OFF-CAPUTE-7193, 15OFF-CAPUTE-3104, 20OFF-ROLETA-1234)
    if (cleanCode.includes('OFF-CAPUTE-') || cleanCode.includes('OFF-ROLETA-')) {
      let percent = 15;
      if (cleanCode.startsWith('30') || cleanCode.includes('30OFF')) percent = 30;
      else if (cleanCode.startsWith('25') || cleanCode.includes('25OFF')) percent = 25;
      else if (cleanCode.startsWith('20') || cleanCode.includes('20OFF')) percent = 20;
      else if (cleanCode.startsWith('15') || cleanCode.includes('15OFF')) percent = 15;

      // Sorteios de 25% e 30% são exclusivos VIP
      if (percent >= 25 && !isVip) {
        return {
          valid: false,
          message: `⚠️ O cupom de ${percent}% OFF do Sorteio Premium é exclusivo para membros VIP.`
        };
      }

      return {
        valid: true,
        discountPercent: percent,
        coupon: {
          code: cleanCode,
          type: percent >= 25 ? 'raffle_25_premium' : 'standard',
          discountPercent: percent,
          description: `Cupom ${cleanCode} de ${percent}% OFF`
        },
        message: `🎉 Cupom sorteado ${cleanCode} de ${percent}% OFF aplicado com sucesso!`
      };
    }

    // Se o cupom tiver menção a VIP ou porcentagens altas mas não estiver no catálogo
    if (cleanCode.includes('VIP') || cleanCode.includes('30') || cleanCode.includes('25')) {
      if (!isVip) {
        return {
          valid: false,
          message: '⚠️ Cupons com descontos fixos e benefícios VIP são exclusivos para membros VIP.'
        };
      }
    }

    return {
      valid: false,
      message: '❌ Cupom inválido, expirado ou indisponível para o seu plano.'
    };
  }

  calculateDiscount(coupon: Coupon | null, subtotal: number, cartItems: CartItem[] = []): number {
    if (!coupon || !coupon.discountPercent || subtotal <= 0) return 0;

    // Se for cupom de produtos de alto valor (itens a partir de minProductPrice)
    if (coupon.minProductPrice) {
      const highValueTotal = cartItems
        .filter(item => item.product.price >= coupon.minProductPrice!)
        .reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

      return (highValueTotal * coupon.discountPercent) / 100;
    }

    // Se for cupom de nicho específico por categoria
    if (coupon.category) {
      const categoryTotal = cartItems
        .filter(item => item.product.category?.toLowerCase() === coupon.category?.toLowerCase())
        .reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

      return (categoryTotal * coupon.discountPercent) / 100;
    }

    // Se for cupom global aplicável a toda a loja
    return (subtotal * coupon.discountPercent) / 100;
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

