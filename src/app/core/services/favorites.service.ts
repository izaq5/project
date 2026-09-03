import { Injectable, computed, inject, signal } from '@angular/core';
import { ProductService } from './product.service';

const STORAGE_KEY = 'capute_favorites';
const LEGACY_KEY = 'nexus_favorites';

@Injectable({ providedIn: 'root' })
export class FavoritesService {
  private productService = inject(ProductService);

  private readonly _ids = signal<Set<string>>(this.load());
  readonly ids = this._ids.asReadonly();

  // Lista de produtos favoritados válidos no catálogo
  readonly validFavoriteProducts = computed(() => {
    const activeSet = this._ids();
    return this.productService.products().filter((p) => activeSet.has(p.id));
  });

  // Contagem 100% precisa sincronizada com os produtos reais existentes
  readonly count = computed(() => this.validFavoriteProducts().length);

  isFavorite(id: string): boolean {
    return this._ids().has(id);
  }

  toggle(id: string): boolean {
    let nowActive = false;
    this._ids.update((set) => {
      const copy = new Set(set);
      if (copy.has(id)) {
        copy.delete(id);
        nowActive = false;
      } else {
        copy.add(id);
        nowActive = true;
      }
      this.save(copy);
      return copy;
    });
    return nowActive;
  }

  private load(): Set<string> {
    if (typeof localStorage === 'undefined') return new Set();
    try {
      let raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        raw = localStorage.getItem(LEGACY_KEY);
      }
      if (!raw) return new Set();

      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return new Set(parsed.filter((id): id is string => typeof id === 'string' && id.trim().length > 0));
      }
      return new Set();
    } catch {
      return new Set();
    }
  }

  private save(set: Set<string>): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(set)));
    }
  }
}

