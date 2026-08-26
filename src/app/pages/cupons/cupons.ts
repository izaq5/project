import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CouponService } from '../../core/services/coupon.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-cupons',
  imports: [RouterLink],
  templateUrl: './cupons.html',
  styleUrl: './cupons.scss',
})
export class Cupons {
  private couponService = inject(CouponService);
  authService = inject(AuthService);
  private toastService = inject(ToastService);

  normalCoupons = this.couponService.getByType('normal');
  exclusiveCoupons = this.couponService.getByType('exclusivo');
  copied = signal<string | null>(null);

  get isExclusiveMember(): boolean {
    return this.authService.currentUser()?.exclusiveMember ?? false;
  }

  copyCode(code: string): void {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(code).catch(() => {});
    }
    this.copied.set(code);
    this.toastService.success(`Cupom ${code} copiado!`);
    setTimeout(() => this.copied.set(null), 2000);
  }
}
