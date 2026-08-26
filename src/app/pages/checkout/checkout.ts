import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CartService } from '../../core/services/cart.service';
import { CouponService } from '../../core/services/coupon.service';
import { AuthService } from '../../core/services/auth.service';
import { OrderService } from '../../core/services/order.service';
import { ToastService } from '../../core/services/toast.service';
import { Coupon } from '../../core/models/coupon.model';
import { Order } from '../../core/models/order.model';

type Step = 1 | 2 | 3;
type PaymentMethod = 'pix' | 'cartao' | 'boleto';
type ShippingType = 'padrao' | 'expressa';

@Component({
  selector: 'app-checkout',
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './checkout.html',
  styleUrl: './checkout.scss',
})
export class Checkout {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  cartService = inject(CartService);
  private couponService = inject(CouponService);
  private authService = inject(AuthService);
  private orderService = inject(OrderService);
  private toastService = inject(ToastService);

  step = signal<Step>(1);
  shippingType = signal<ShippingType>('padrao');
  paymentMethod = signal<PaymentMethod>('pix');
  couponInput = signal('');
  appliedCoupon = signal<Coupon | null>(null);
  couponMessage = signal<{ type: 'success' | 'error'; text: string } | null>(null);
  finishedOrder = signal<Order | null>(null);
  submitting = signal(false);

  addressForm = this.fb.nonNullable.group({
    name: ['', Validators.required],
    phone: ['', Validators.required],
    cep: ['', Validators.required],
    state: ['', Validators.required],
    city: ['', Validators.required],
    street: ['', Validators.required],
    number: ['', Validators.required],
    complement: [''],
  });

  cardForm = this.fb.nonNullable.group({
    cardNumber: [''],
    cardName: [''],
    cardExpiry: [''],
    cardCvv: [''],
  });

  get shippingCost(): number {
    return this.shippingType() === 'expressa' ? 24.9 : 14.9;
  }

  discountAmount = computed(() => {
    const coupon = this.appliedCoupon();
    if (!coupon) return 0;
    return (this.cartService.subtotal() * coupon.discountPercent) / 100;
  });

  total = computed(() => Math.max(0, this.cartService.subtotal() + this.shippingCost - this.discountAmount()));

  isExclusiveMember = computed(() => this.authService.currentUser()?.exclusiveMember ?? false);

  goToStep(step: Step): void {
    if (step === 2 && this.addressForm.invalid) {
      this.addressForm.markAllAsTouched();
      this.toastService.error('Preencha os dados de entrega corretamente.');
      return;
    }
    this.step.set(step);
  }

  selectShipping(type: ShippingType): void {
    this.shippingType.set(type);
  }

  selectPayment(method: PaymentMethod): void {
    this.paymentMethod.set(method);
  }

  applyCoupon(): void {
    const result = this.couponService.validate(this.couponInput(), this.cartService.subtotal(), this.isExclusiveMember());
    if (result.valid && result.coupon) {
      this.appliedCoupon.set(result.coupon);
      this.couponMessage.set({ type: 'success', text: result.message });
      this.toastService.success(result.message);
    } else {
      this.appliedCoupon.set(null);
      this.couponMessage.set({ type: 'error', text: result.message });
    }
  }

  removeCoupon(): void {
    this.appliedCoupon.set(null);
    this.couponInput.set('');
    this.couponMessage.set(null);
  }

  finishOrder(): void {
    if (this.addressForm.invalid) {
      this.step.set(1);
      this.addressForm.markAllAsTouched();
      this.toastService.error('Preencha os dados de entrega corretamente.');
      return;
    }
    if (this.cartService.isEmpty()) {
      this.toastService.error('Seu carrinho está vazio.');
      return;
    }

    this.submitting.set(true);
    const address = this.addressForm.getRawValue();

    setTimeout(() => {
      const order = this.orderService.create({
        items: this.cartService.items(),
        subtotal: this.cartService.subtotal(),
        shipping: this.shippingCost,
        discount: this.discountAmount(),
        total: this.total(),
        paymentMethod: this.paymentMethod(),
        couponCode: this.appliedCoupon()?.code,
        shippingType: this.shippingType(),
        address,
      });

      this.finishedOrder.set(order);
      this.step.set(3);
      this.cartService.clear();
      this.submitting.set(false);
    }, 900);
  }

  continueShopping(): void {
    this.router.navigate(['/']);
  }

  field(name: keyof typeof this.addressForm.controls): boolean {
    const control = this.addressForm.get(name);
    return !!control && control.invalid && control.touched;
  }
}
