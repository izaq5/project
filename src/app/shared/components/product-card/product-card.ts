import { Component, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Product } from '../../../core/models/product.model';
import { CartService } from '../../../core/services/cart.service';
import { FavoritesService } from '../../../core/services/favorites.service';
import { ToastService } from '../../../core/services/toast.service';
import { StarRating } from '../star-rating/star-rating';

@Component({
  selector: 'app-product-card',
  imports: [RouterLink, StarRating],
  templateUrl: './product-card.html',
  styleUrl: './product-card.scss',
})
export class ProductCard {
  product = input.required<Product>();

  private cartService = inject(CartService);
  private favoritesService = inject(FavoritesService);
  private toastService = inject(ToastService);

  get discountPercent(): number {
    const p = this.product();
    if (!p.originalPrice || p.originalPrice <= p.price) return 0;
    return Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100);
  }

  get isFavorite(): boolean {
    return this.favoritesService.isFavorite(this.product().id);
  }

  badgeLabel(): string {
    switch (this.product().badge) {
      case 'mais-vendido': return 'Mais vendido';
      case 'novo': return 'Novo';
      case 'exclusivo': return 'Exclusivo';
      default: return '';
    }
  }

  addToCart(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.cartService.add(this.product(), 1);
    this.toastService.success(`${this.product().name} adicionado ao carrinho!`);
  }

  toggleFavorite(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.favoritesService.toggle(this.product().id);
    this.toastService.info(this.isFavorite ? 'Adicionado aos favoritos.' : 'Removido dos favoritos.');
  }
}
