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
      id: 'p_cine',
      category: 'Entretenimento & Filmes',
      partnerName: 'CineMax VIP Pass',
      benefit: '1 Mês Grátis de Ingressos + 30% OFF em Combos de Pipoca',
      icon: '🎬',
      claimCode: 'CAPUTE-CINEMAX-VIP',
      isBeta: true
    },
    {
      id: 'p_stream',
      category: 'Streaming & Música',
      partnerName: 'SoundPrime Ultra',
      benefit: '2 Meses de Áudio Hi-Fi Sem Anúncios',
      icon: '🎧',
      claimCode: 'CAPUTE-SOUND-VIP',
      isBeta: true
    },
    {
      id: 'p_games',
      category: 'Games & E-Sports',
      partnerName: 'GameVault Pass',
      benefit: 'Acesso VIP a Servidores Dedicados + 20% OFF em Jogos Digitais',
      icon: '🎮',
      claimCode: 'CAPUTE-GAMEPASS-2025',
      isBeta: true
    },
    {
      id: 'p_edu',
      category: 'Cursos & Tecnologia',
      partnerName: 'TechAcademy Pro',
      benefit: '40% OFF em Certificações Digitais e Bootcamps',
      icon: '🚀',
      claimCode: 'CAPUTE-ACADEMY-VIP',
      isBeta: true
    }
  ]);

  readonly partnerships = this._partnerships.asReadonly();
}
