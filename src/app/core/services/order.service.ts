import { Injectable, signal } from '@angular/core';
import { Order } from '../models/order.model';

const STORAGE_KEY = 'nexus_orders';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly _orders = signal<Order[]>(this.load());
  readonly orders = this._orders.asReadonly();

  create(order: Omit<Order, 'id' | 'number' | 'date' | 'status'>): Order {
    const newOrder: Order = {
      ...order,
      id: `o_${Date.now()}`,
      number: Math.floor(100000 + Math.random() * 900000).toString(),
      date: new Date().toISOString(),
      status: 'processando',
    };
    this._orders.update((list) => [newOrder, ...list]);
    this.save();
    return newOrder;
  }

  private load(): Order[] {
    if (typeof localStorage === 'undefined') return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as Order[]) : [];
    } catch {
      return [];
    }
  }

  private save(): void {
    if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_KEY, JSON.stringify(this._orders()));
  }
}
