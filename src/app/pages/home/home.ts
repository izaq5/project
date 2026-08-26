import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { ProductCard } from '../../shared/components/product-card/product-card';

@Component({
  selector: 'app-home',
  imports: [RouterLink, ProductCard],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  private productService = inject(ProductService);

  bestSellers = this.productService.bestSellers(4);
  exclusiveProducts = this.productService.exclusiveProducts(4);
  newProducts = this.productService.newProducts(4);
  categories = this.productService.categories().slice(0, 6);
}
