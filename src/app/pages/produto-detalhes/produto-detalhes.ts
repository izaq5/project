import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { FavoritesService } from '../../core/services/favorites.service';
import { ToastService } from '../../core/services/toast.service';
import { StarRating } from '../../shared/components/star-rating/star-rating';
import { ProductCard } from '../../shared/components/product-card/product-card';

type Tab = 'descricao' | 'especificacoes' | 'avaliacoes' | 'faq';

@Component({
  selector: 'app-produto-detalhes',
  imports: [RouterLink, StarRating, ProductCard],
  templateUrl: './produto-detalhes.html',
  styleUrl: './produto-detalhes.scss',
})
export class ProdutoDetalhes {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private productService = inject(ProductService);
  private cartService = inject(CartService);
  private favoritesService = inject(FavoritesService);
  private toastService = inject(ToastService);

  productId = signal<string>('');
  activeImage = signal(0);
  quantity = signal(1);
  activeTab = signal<Tab>('descricao');

  constructor() {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id') ?? '';
      this.productId.set(id);
      this.activeImage.set(0);
      this.quantity.set(1);
      this.activeTab.set('descricao');
      if (!this.product()) {
        this.router.navigate(['/produtos']);
      }
    });
  }

  product = computed(() => this.productService.getById(this.productId()));

  related = computed(() => {
    const p = this.product();
    return p ? this.productService.related(p, 4) : [];
  });

  discountPercent = computed(() => {
    const p = this.product();
    if (!p?.originalPrice || p.originalPrice <= p.price) return 0;
    return Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100);
  });

  installment = computed(() => {
    const p = this.product();
    if (!p) return 0;
    return p.price / 12;
  });

  isFavorite = computed(() => this.favoritesService.isFavorite(this.productId()));

  setActiveImage(i: number): void {
    this.activeImage.set(i);
  }

  incQuantity(): void {
    const p = this.product();
    if (p && this.quantity() < p.stock) this.quantity.update((q) => q + 1);
  }

  decQuantity(): void {
    if (this.quantity() > 1) this.quantity.update((q) => q - 1);
  }

  addToCart(): void {
    const p = this.product();
    if (!p) return;
    this.cartService.add(p, this.quantity());
    this.toastService.success(`${p.name} adicionado ao carrinho!`);
  }

  toggleFavorite(): void {
    this.favoritesService.toggle(this.productId());
    this.toastService.info(this.isFavorite() ? 'Adicionado aos favoritos.' : 'Removido dos favoritos.');
  }

  setTab(tab: Tab): void {
    this.activeTab.set(tab);
  }
}
