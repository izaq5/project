import { Injectable, signal } from '@angular/core';

export interface VipPartnership {
  id: string;
  category: string;
  partnerName: string;
  benefit: string;
  icon: string;
  claimCode: string;
  isBeta?: boolean;
}

@Injectable({ providedIn: 'root' })
export class VipService {
  // WhatsApp API URL direcionada para 5514997853237
  readonly whatsappPhone = '5514997853237';
  readonly whatsappGroupUrl = `https://api.whatsapp.com/send?phone=5514997853237&text=${encodeURIComponent('Olá! Sou membro VIP da CaputeStore e gostaria de entrar no grupo exclusivo do WhatsApp.')}`;
  readonly planPrice = 20.00;

  private readonly _partnerships = signal<VipPartnership[]>([
    {
      id: 'p_netflix',
      category: 'Filmes & Séries',
      partnerName: 'Netflix VIP Cine Pass',
      benefit: '1 Mês Grátis no Plano Premium 4K + 25% OFF em Lançamentos de Filmes',
      icon: '🎬',
      claimCode: 'CAPUTE-NETFLIX-VIP',
      isBeta: true
    },
    {
      id: 'p_spotify',
      category: 'Streaming de Música',
      partnerName: 'Spotify Ultra Premium',
      benefit: '3 Meses Grátis de Áudio Hi-Fi Sem Anúncios + Downloads Ilimitados',
      icon: '🎧',
      claimCode: 'CAPUTE-SPOTIFY-VIP',
      isBeta: true
    },
    {
      id: 'p_disney_max',
      category: 'Filmes & Streaming',
      partnerName: 'Disney+ & Max Cine Combo',
      benefit: '30% OFF na Assinatura Anual de Estreias de Cinema e Séries',
      icon: '🍿',
      claimCode: 'CAPUTE-CINEMAX-30',
      isBeta: true
    },
    {
      id: 'p_deezer_apple',
      category: 'Streaming de Música',
      partnerName: 'Deezer & Apple Music Pass',
      benefit: '2 Meses Grátis + Playlist Exclusiva CaputeStore de Alta Fidelidade',
      icon: '🎵',
      claimCode: 'CAPUTE-MUSIC-PASS',
      isBeta: true
    },
    {
      id: 'p_prime',
      category: 'Filmes & Aluguel',
      partnerName: 'Prime Video Cine Pass',
      benefit: '5 Ingressos Virtuais + Cashback Exclusivo em Aluguel de Filmes',
      icon: '🎥',
      claimCode: 'CAPUTE-PRIME-CINE',
      isBeta: true
    }
  ]);

  readonly partnerships = this._partnerships.asReadonly();
}
