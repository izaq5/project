import { Injectable, computed, signal } from '@angular/core';
import { Product } from '../models/product.model';
import { PRODUCTS_SEED } from './products-seed';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly _products = signal<Product[]>(PRODUCTS_SEED);
  readonly products = this._products.asReadonly();

  readonly categories = computed(() => {
    const set = new Set(this._products().map((p) => p.category));
    return Array.from(set).sort();
  });

  getById(id: string): Product | undefined {
    return this._products().find((p) => p.id === id);
  }

  filter(opts: { term?: string; category?: string | null; onlyExclusive?: boolean; maxPrice?: number; minPrice?: number; sort?: string }): Product[] {
    let list = this._products();

    if (opts.term && opts.term.trim()) {
      const t = opts.term.trim().toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(t) || p.category.toLowerCase().includes(t));
    }
    if (opts.category) {
      list = list.filter((p) => p.category === opts.category);
    }
    if (opts.onlyExclusive) {
      list = list.filter((p) => p.exclusive);
    }
    if (opts.maxPrice) {
      list = list.filter((p) => p.price <= opts.maxPrice!);
    }
    if (opts.minPrice) {
      list = list.filter((p) => p.price >= opts.minPrice!);
    }

    switch (opts.sort) {
      case 'menor-preco':
        list = [...list].sort((a, b) => a.price - b.price);
        break;
      case 'maior-preco':
        list = [...list].sort((a, b) => b.price - a.price);
        break;
      case 'melhor-avaliados':
        list = [...list].sort((a, b) => b.rating - a.rating);
        break;
      case 'mais-vendidos':
        list = [...list].sort((a, b) => b.reviewsCount - a.reviewsCount);
        break;
      default:
        break;
    }

    return list;
  }

  bestSellers(limit = 4): Product[] {
    return [...this._products()].sort((a, b) => b.reviewsCount - a.reviewsCount).slice(0, limit);
  }

  exclusiveProducts(limit = 8): Product[] {
    return this._products().filter((p) => p.exclusive).slice(0, limit);
  }

  newProducts(limit = 4): Product[] {
    return this._products().filter((p) => p.badge === 'novo').slice(0, limit);
  }

  related(product: Product, limit = 4): Product[] {
    return this._products()
      .filter((p) => p.id !== product.id && p.category === product.category)
      .slice(0, limit);
  }

  addSellerProduct(product: Product): void {
    this._products.update((list) => [product, ...list]);
  }
}
