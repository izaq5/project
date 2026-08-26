import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { VipService } from '../../core/services/vip.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-vip',
  imports: [RouterLink],
  templateUrl: './vip.html',
  styleUrl: './vip.scss',
})
export class Vip {
  auth = inject(AuthService);
  vipService = inject(VipService);
  toast = inject(ToastService);

  showCheckoutModal = signal(false);
  paymentMethod = signal<'pix' | 'cartao' | 'boleto'>('pix');
  processing = signal(false);

  openCheckout(): void {
    if (!this.auth.isLoggedIn()) {
      this.toast.error('Você precisa fazer login ou cadastrar-se antes de assinar o Plano VIP.');
      return;
    }
    this.showCheckoutModal.set(true);
  }

  closeCheckout(): void {
    this.showCheckoutModal.set(false);
  }

  confirmPayment(): void {
    this.processing.set(true);
    setTimeout(() => {
      this.processing.set(false);
      this.showCheckoutModal.set(false);
      const res = this.auth.becomeVip();
      if (res.success) {
        this.toast.success(res.message);
      }
    }, 1200);
  }

  copyPartnerCode(code: string): void {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(code);
      this.toast.success(`Código de parceria ${code} copiado com sucesso!`);
    }
  }
}
