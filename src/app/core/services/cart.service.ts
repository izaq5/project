import { Injectable, computed, effect, signal } from '@angular/core';
import { CartItem } from '../models/cart.model';
import { Product } from '../models/product.model';

const STORAGE_KEY = 'nexus_cart';

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly _items = signal<CartItem[]>(this.loadFromStorage());
  readonly items = this._items.asReadonly();

  readonly itemCount = computed(() => this._items().reduce((sum, i) => sum + i.quantity, 0));
  readonly subtotal = computed(() => this._items().reduce((sum, i) => sum + i.product.price * i.quantity, 0));
  readonly isEmpty = computed(() => this._items().length === 0);

  constructor() {
    effect(() => this.saveToStorage(this._items()));
  }

  add(product: Product, quantity = 1): void {
    this._items.update((items) => {
      const idx = items.findIndex((i) => i.product.id === product.id);
      if (idx > -1) {
        const copy = [...items];
        copy[idx] = { ...copy[idx], quantity: copy[idx].quantity + quantity };
        return copy;
      }
      return [...items, { product, quantity }];
    });
  }

  updateQuantity(productId: string, quantity: number): void {
    if (quantity < 1) {
      this.remove(productId);
      return;
    }
    this._items.update((items) => items.map((i) => (i.product.id === productId ? { ...i, quantity } : i)));
  }

  increment(productId: string): void {
    const item = this._items().find((i) => i.product.id === productId);
    if (item) this.updateQuantity(productId, item.quantity + 1);
  }

  decrement(productId: string): void {
    const item = this._items().find((i) => i.product.id === productId);
    if (item) this.updateQuantity(productId, item.quantity - 1);
  }

  remove(productId: string): void {
    this._items.update((items) => items.filter((i) => i.product.id !== productId));
  }

  clear(): void {
    this._items.set([]);
  }

  private loadFromStorage(): CartItem[] {
    if (typeof localStorage === 'undefined') return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as CartItem[]) : [];
    } catch {
      return [];
    }
  }

  private saveToStorage(items: CartItem[]): void {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }
}
