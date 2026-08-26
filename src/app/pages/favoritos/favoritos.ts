import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { FavoritesService } from '../../core/services/favorites.service';
import { ProductCard } from '../../shared/components/product-card/product-card';

@Component({
  selector: 'app-favoritos',
  imports: [RouterLink, ProductCard],
  templateUrl: './favoritos.html',
  styleUrl: './favoritos.scss',
})
export class Favoritos {
  private productService = inject(ProductService);
  favoritesService = inject(FavoritesService);

  favoriteProducts = computed(() =>
    this.productService.products().filter((p) => this.favoritesService.ids().has(p.id))
  );
}
