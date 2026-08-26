import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { ProductCard } from '../../shared/components/product-card/product-card';

@Component({
  selector: 'app-produtos',
  imports: [ProductCard],
  templateUrl: './produtos.html',
  styleUrl: './produtos.scss',
})
export class Produtos {
  private productService = inject(ProductService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  categories = this.productService.categories();

  term = signal('');
  selectedCategory = signal<string | null>(null);
  onlyExclusive = signal(false);
  maxPrice = signal<number>(6000);
  sort = signal('relevancia');
  filtersOpen = signal(false);

  constructor() {
    this.route.queryParamMap.subscribe((params) => {
      this.term.set(params.get('q') ?? '');
      this.selectedCategory.set(params.get('categoria'));
      this.onlyExclusive.set(params.get('exclusivo') === '1');
      this.sort.set(params.get('ordenar') ?? 'relevancia');
    });
  }

  filtered = computed(() =>
    this.productService.filter({
      term: this.term(),
      category: this.selectedCategory(),
      onlyExclusive: this.onlyExclusive(),
      maxPrice: this.maxPrice(),
      sort: this.sort(),
    })
  );

  selectCategory(cat: string | null): void {
    this.selectedCategory.set(cat);
    this.syncUrl();
  }

  toggleExclusive(): void {
    this.onlyExclusive.update((v) => !v);
    this.syncUrl();
  }

  setSort(value: string): void {
    this.sort.set(value);
    this.syncUrl();
  }

  setMaxPrice(value: string): void {
    this.maxPrice.set(Number(value));
  }

  clearFilters(): void {
    this.term.set('');
    this.selectedCategory.set(null);
    this.onlyExclusive.set(false);
    this.maxPrice.set(6000);
    this.sort.set('relevancia');
    this.router.navigate([], { queryParams: {} });
  }

  private syncUrl(): void {
    this.router.navigate([], {
      queryParams: {
        q: this.term() || null,
        categoria: this.selectedCategory() || null,
        exclusivo: this.onlyExclusive() ? 1 : null,
        ordenar: this.sort() !== 'relevancia' ? this.sort() : null,
      },
      queryParamsHandling: 'merge',
    });
  }
}
