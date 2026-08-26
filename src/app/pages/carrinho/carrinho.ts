import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartService } from '../../core/services/cart.service';

@Component({
  selector: 'app-carrinho',
  imports: [RouterLink],
  templateUrl: './carrinho.html',
  styleUrl: './carrinho.scss',
})
export class Carrinho {
  cartService = inject(CartService);

  readonly shipping = 14.9;
  readonly freeShippingThreshold = 500;

  get shippingCost(): number {
    return this.cartService.subtotal() >= this.freeShippingThreshold || this.cartService.isEmpty() ? 0 : this.shipping;
  }

  get total(): number {
    return this.cartService.subtotal() + this.shippingCost;
  }

  get missingForFreeShipping(): number {
    return Math.max(0, this.freeShippingThreshold - this.cartService.subtotal());
  }
}
