import { Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { OrderService } from '../../core/services/order.service';
import { FavoritesService } from '../../core/services/favorites.service';
import { ToastService } from '../../core/services/toast.service';
import { VipOfferModal } from '../../shared/components/vip-offer-modal/vip-offer-modal';

const MAX_AVATAR_SIZE = 2 * 1024 * 1024; // 2MB

@Component({
  selector: 'app-perfil',
  imports: [RouterLink, VipOfferModal],
  templateUrl: './perfil.html',
  styleUrl: './perfil.scss',
})
export class Perfil {
  authService = inject(AuthService);
  orderService = inject(OrderService);
  favoritesService = inject(FavoritesService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  showVipOffer = signal(false);
  avatarInput = viewChild<ElementRef<HTMLInputElement>>('avatarInput');

  requestVip(): void {
    const current = this.authService.currentUser();
    if (!current) return;
    if (current.exclusiveMember) {
      this.authService.updateExclusiveMember(false);
      this.toastService.success('Você saiu do Nexus VIP.');
    } else {
      this.showVipOffer.set(true);
    }
  }

  confirmVipOffer(): void {
    this.authService.updateExclusiveMember(true);
    this.showVipOffer.set(false);
    this.toastService.success('Bem-vindo(a) ao Nexus VIP! 🎉');
  }

  declineVipOffer(): void {
    this.showVipOffer.set(false);
  }

  triggerAvatarUpload(): void {
    this.avatarInput()?.nativeElement.click();
  }

  onAvatarSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.toastService.error('Selecione um arquivo de imagem válido.');
      input.value = '';
      return;
    }
    if (file.size > MAX_AVATAR_SIZE) {
      this.toastService.error('A imagem deve ter no máximo 2MB.');
      input.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      this.authService.updateAvatar(reader.result as string);
      this.toastService.success('Foto de perfil atualizada!');
    };
    reader.onerror = () => this.toastService.error('Não foi possível carregar a imagem.');
    reader.readAsDataURL(file);
    input.value = '';
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
