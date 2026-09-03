import { Injectable, inject, signal } from '@angular/core';
import { DrawCampaign } from '../models/coupon.model';
import { AuthService } from './auth.service';
import { ToastService } from './toast.service';

const STORAGE_DRAWS_KEY = 'capute_draws_state';

@Injectable({ providedIn: 'root' })
export class DrawService {
  private auth = inject(AuthService);
  private toast = inject(ToastService);

  private readonly _campaigns = signal<DrawCampaign[]>([
    {
      id: 'raffle_15',
      title: '🎁 Sorteio de 25 Cupons de 15% OFF',
      discount: 15,
      totalCoupons: 25,
      claimedCount: 4,
      requiresPremium: false,
      winners: []
    },
    {
      id: 'raffle_25_premium',
      title: '⭐ Sorteio Premium de 15 Cupons de 25% OFF',
      discount: 25,
      totalCoupons: 15,
      claimedCount: 2,
      requiresPremium: true,
      winners: []
    },
    {
      id: 'raffle_30_premium',
      title: '👑 Sorteio Premium de 10 Cupons de 30% OFF',
      discount: 30,
      totalCoupons: 10,
      claimedCount: 1,
      requiresPremium: true,
      winners: []
    }
  ]);

  readonly campaigns = this._campaigns.asReadonly();

  constructor() {
    this.loadState();
  }

  participateInDraw(drawId: string): Promise<{ success: boolean; code?: string; message: string }> {
    return new Promise((resolve) => {
      const user = this.auth.currentUser();
      if (!user) {
        this.toast.error('Você precisa estar logado para participar dos sorteios.');
        return resolve({ success: false, message: 'Usuário não conectado.' });
      }

      const campaign = this._campaigns().find(c => c.id === drawId);
      if (!campaign) {
        return resolve({ success: false, message: 'Sorteio não encontrado.' });
      }

      // Regra Backend & Frontend: Verificação de Premium/VIP
      if (campaign.requiresPremium && !user.isPremium && !user.isVip) {
        const msg = 'Este sorteio de cupons é exclusivo para membros Premium/VIP! Faça seu upgrade VIP por R$ 20,00 para participar.';
        this.toast.error(msg);
        return resolve({ success: false, message: msg });
      }

      // Regra: Limite de cotas
      if (campaign.claimedCount >= campaign.totalCoupons) {
        const msg = 'Os cupons deste sorteio já foram totalmente distribuídos aos ganhadores!';
        this.toast.error(msg);
        return resolve({ success: false, message: msg });
      }

      // Regra: Duplicidade
      if (campaign.winners?.includes(user.id) || user.wonCoupons?.some(c => c.startsWith(`${campaign.discount}OFF-`))) {
        const msg = `Você já participou e foi contemplado neste sorteio de ${campaign.discount}%!`;
        this.toast.info(msg);
        return resolve({ success: false, message: msg });
      }

      // Simulação de Sorteio com processamento em tempo real
      setTimeout(() => {
        const winCode = `${campaign.discount}OFF-CAPUTE-${Math.floor(1000 + Math.random() * 9000)}`;

        this._campaigns.update(list => list.map(c => {
          if (c.id === drawId) {
            return {
              ...c,
              claimedCount: c.claimedCount + 1,
              winners: [...(c.winners || []), user.id]
            };
          }
          return c;
        }));

        this.auth.addWonCoupon(winCode);
        this.saveState();

        const successMsg = `🎉 Parabéns, ${user.name.split(' ')[0]}! Você foi sorteado(a) e ganhou o cupom exclusivo: ${winCode}`;
        this.toast.success(successMsg);

        resolve({
          success: true,
          code: winCode,
          message: successMsg
        });
      }, 1400);
    });
  }

  private loadState(): void {
    if (typeof localStorage === 'undefined') return;
    try {
      const raw = localStorage.getItem(STORAGE_DRAWS_KEY);
      if (raw) {
        this._campaigns.set(JSON.parse(raw));
      }
    } catch {}
  }

  private saveState(): void {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(STORAGE_DRAWS_KEY, JSON.stringify(this._campaigns()));
  }
}
