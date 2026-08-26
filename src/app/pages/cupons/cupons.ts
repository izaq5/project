import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DrawService } from '../../core/services/draw.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-cupons',
  imports: [RouterLink],
  templateUrl: './cupons.html',
  styleUrl: './cupons.scss',
})
export class Cupons {
  drawService = inject(DrawService);
  authService = inject(AuthService);
  private toastService = inject(ToastService);

  copied = signal<string | null>(null);
  participating = signal<string | null>(null);

  get isFirstPurchaseAvailable(): boolean {
    return !(this.authService.currentUser()?.hasMadeFirstPurchase);
  }

  get userWonCoupons(): string[] {
    return this.authService.currentUser()?.wonCoupons || [];
  }

  async participate(drawId: string): Promise<void> {
    this.participating.set(drawId);
    const res = await this.drawService.participateInDraw(drawId);
    this.participating.set(null);
  }

  copyCode(code: string): void {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(code).catch(() => {});
    }
    this.copied.set(code);
    this.toastService.success(`Cupom ${code} copiado com sucesso!`);
    setTimeout(() => this.copied.set(null), 2000);
  }
}
