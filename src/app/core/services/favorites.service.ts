import { Injectable, computed, signal } from '@angular/core';

const STORAGE_KEY = 'nexus_favorites';

@Injectable({ providedIn: 'root' })
export class FavoritesService {
  private readonly _ids = signal<Set<string>>(this.load());
  readonly ids = this._ids.asReadonly();
  readonly count = computed(() => this._ids().size);

  isFavorite(id: string): boolean {
    return this._ids().has(id);
  }

  toggle(id: string): void {
    this._ids.update((set) => {
      const copy = new Set(set);
      if (copy.has(id)) copy.delete(id);
      else copy.add(id);
      this.save(copy);
      return copy;
    });
  }

  private load(): Set<string> {
    if (typeof localStorage === 'undefined') return new Set();
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
    } catch {
      return new Set();
    }
  }

  private save(set: Set<string>): void {
    if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(set)));
  }
}
