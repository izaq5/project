import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { CouponService } from '../../core/services/coupon.service';
import { ToastService } from '../../core/services/toast.service';
import { Coupon } from '../../core/models/coupon.model';

@Component({
  selector: 'app-carrinho',
  imports: [RouterLink],
  templateUrl: './carrinho.html',
  styleUrl: './carrinho.scss',
})
export class Carrinho implements OnInit {
  cartService = inject(CartService);
  private couponService = inject(CouponService);
  private toastService = inject(ToastService);

  readonly shipping = 14.9;
  readonly freeShippingThreshold = 500;

  couponInput = signal('');
  appliedCoupon = signal<Coupon | null>(null);
  couponMessage = signal<{ type: 'success' | 'error'; text: string } | null>(null);

  ngOnInit(): void {
    const activeCode = this.couponService.activeCouponCode();
    if (activeCode && !this.cartService.isEmpty()) {
      this.couponInput.set(activeCode);
      this.applyCoupon(false);
    }
  }

  get shippingCost(): number {
    return this.cartService.subtotal() >= this.freeShippingThreshold || this.cartService.isEmpty() ? 0 : this.shipping;
  }

  discountAmount = computed(() => {
    const coupon = this.appliedCoupon();
    if (!coupon) return 0;
    return (this.cartService.subtotal() * coupon.discountPercent) / 100;
  });

  get total(): number {
    return Math.max(0, this.cartService.subtotal() + this.shippingCost - this.discountAmount());
  }

  get missingForFreeShipping(): number {
    return Math.max(0, this.freeShippingThreshold - this.cartService.subtotal());
  }

  applyCoupon(showToast = true): void {
    const code = this.couponInput().trim();
    if (!code) {
      this.couponMessage.set({ type: 'error', text: 'Digite o código do cupom.' });
      return;
    }

    const result = this.couponService.validate(code, this.cartService.subtotal());
    if (result.valid && result.coupon) {
      this.appliedCoupon.set(result.coupon);
      this.couponMessage.set({ type: 'success', text: result.message });
      this.couponService.setGlobalCoupon(result.coupon.code);
      if (showToast) this.toastService.success(result.message);
    } else {
      this.appliedCoupon.set(null);
      this.couponMessage.set({ type: 'error', text: result.message });
      if (showToast) this.toastService.error(result.message);
    }
  }

  removeCoupon(): void {
    this.appliedCoupon.set(null);
    this.couponInput.set('');
    this.couponMessage.set(null);
    this.couponService.clearGlobalCoupon();
    this.toastService.info('Cupom removido do carrinho.');
  }
}
