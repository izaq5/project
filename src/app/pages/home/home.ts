import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { ToastService } from '../../core/services/toast.service';
import { ProductCard } from '../../shared/components/product-card/product-card';

export interface HomeBanner {
  id: number;
  badge: string;
  badgeType: 'primary' | 'vip' | 'outline';
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  ctaClass: string;
  imageUrl: string;
}

@Component({
  selector: 'app-home',
  imports: [RouterLink, ProductCard],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit, OnDestroy {
  private productService = inject(ProductService);
  private toast = inject(ToastService);

  bestSellers = this.productService.bestSellers(4);
  exclusiveProducts = this.productService.exclusiveProducts(4);
  newProducts = this.productService.newProducts(4);
  categories = this.productService.categories().slice(0, 6);

  // SISTEMA DE BANNER DA TELA INICIAL
  banners: HomeBanner[] = [
    {
      id: 1,
      badge: '🔥 OFERTAS EM DESTAQUE',
      badgeType: 'primary',
      title: 'TECNOLOGIA QUE MOVE O SEU MUNDO',
      subtitle: 'Os melhores eletrônicos, celulares, notebooks e fones com entrega rápida e garantia total!',
      ctaText: 'VER OFERTAS',
      ctaLink: '/produtos',
      ctaClass: 'btn-primary',
      imageUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1200&auto=format&fit=crop'
    },
    {
      id: 2,
      badge: '👑 EXCLUSIVO CAPUTESTORE VIP',
      badgeType: 'vip',
      title: 'SORTEIOS DE CUPONS DE ATÉ 30% OFF',
      subtitle: 'Assine o Plano VIP por R$ 20,00 e ganhe acesso ao grupo do WhatsApp + sorteios de 25% e 30% OFF!',
      ctaText: 'QUERO SER VIP (R$ 20)',
      ctaLink: '/vip',
      ctaClass: 'btn-vip',
      imageUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1200&auto=format&fit=crop'
    },
    {
      id: 3,
      badge: '✨ LANÇAMENTOS 2026',
      badgeType: 'primary',
      title: 'EQUIPAMENTOS DE ALTA PERFORMANCE',
      subtitle: 'Smartphones Galaxy AI, mouses ultraleves e headphones ANC com parcelamento em até 12x sem juros!',
      ctaText: 'EXPLORAR LANÇAMENTOS',
      ctaLink: '/produtos',
      ctaClass: 'btn-outline',
      imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200&auto=format&fit=crop'
    }
  ];

  activeBannerIndex = signal(0);
  private timer: any;

  ngOnInit(): void {
    this.startAutoSlide();
  }

  ngOnDestroy(): void {
    this.stopAutoSlide();
  }

  nextSlide(): void {
    this.activeBannerIndex.update((idx) => (idx + 1) % this.banners.length);
  }

  prevSlide(): void {
    this.activeBannerIndex.update((idx) => (idx - 1 + this.banners.length) % this.banners.length);
  }

  setSlide(index: number): void {
    this.activeBannerIndex.set(index);
    this.restartAutoSlide();
  }

  private startAutoSlide(): void {
    if (typeof window !== 'undefined') {
      this.timer = setInterval(() => this.nextSlide(), 5000);
    }
  }

  private stopAutoSlide(): void {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  private restartAutoSlide(): void {
    this.stopAutoSlide();
    this.startAutoSlide();
  }

  subscribeNewsletter(): void {
    this.toast.success('Inscrição realizada com sucesso! Use o cupom PRIMEIRA10 na sua primeira compra.');
  }
}
