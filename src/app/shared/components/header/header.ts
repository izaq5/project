import { Component, HostListener, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';
import { FavoritesService } from '../../../core/services/favorites.service';
import { AuthService } from '../../../core/services/auth.service';
import { ProductService } from '../../../core/services/product.service';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  private router = inject(Router);
  cartService = inject(CartService);
  favoritesService = inject(FavoritesService);
  authService = inject(AuthService);
  productService = inject(ProductService);

  searchTerm = signal('');
  mobileMenuOpen = signal(false);
  userMenuOpen = signal(false);
  onlineCount = signal(this.randomOnline());

  private randomOnline(): number {
    return Math.floor(Math.random() * 30) + 8;
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen.update((v) => !v);
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }

  toggleUserMenu(): void {
    this.userMenuOpen.update((v) => !v);
  }

  @HostListener('document:click')
  closeUserMenu(): void {
    this.userMenuOpen.set(false);
  }

  onSearch(event: Event): void {
    event.stopPropagation();
  }

  submitSearch(): void {
    const term = this.searchTerm().trim();
    this.router.navigate(['/produtos'], { queryParams: term ? { q: term } : {} });
    this.closeMobileMenu();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
