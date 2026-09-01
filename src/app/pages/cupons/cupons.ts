import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { DrawService } from '../../core/services/draw.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

export interface WinnerFeedItem {
  name: string;
  cityState: string;
  discount: string;
  code: string;
  timeAgo: string;
}

@Component({
  selector: 'app-cupons',
  imports: [RouterLink],
  templateUrl: './cupons.html',
  styleUrl: './cupons.scss',
})
export class Cupons implements OnInit, OnDestroy {
  drawService = inject(DrawService);
  authService = inject(AuthService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  copied = signal<string | null>(null);
  participating = signal<string | null>(null);
  selectedState = signal<string>('Todos');
  loadingState = signal<boolean>(false);
  spinningWheel = signal<boolean>(false);
  rouletteResult = signal<{ discount: string; code: string } | null>(null);

  // Relógio Regressivo em Tempo Real
  countdownHours = signal(3);
  countdownMinutes = signal(42);
  countdownSeconds = signal(18);
  private timerInterval: any;

  readonly brazilianStates = [
    { code: 'Todos', name: '🇧🇷 Brasil Inteiro (Todos os Estados)' },
    { code: 'SP', name: 'São Paulo (SP)' },
    { code: 'RJ', name: 'Rio de Janeiro (RJ)' },
    { code: 'MG', name: 'Minas Gerais (MG)' },
    { code: 'RS', name: 'Rio Grande do Sul (RS)' },
    { code: 'BA', name: 'Bahia (BA)' },
    { code: 'PR', name: 'Paraná (PR)' },
    { code: 'SC', name: 'Santa Catarina (SC)' },
    { code: 'CE', name: 'Ceará (CE)' },
    { code: 'PE', name: 'Pernambuco (PE)' },
    { code: 'GO', name: 'Goiás (GO)' },
    { code: 'DF', name: 'Distrito Federal (DF)' },
    { code: 'AM', name: 'Amazonas (AM)' },
  ];

  private readonly initialWinners: WinnerFeedItem[] = [
    { name: 'Carlos M.', cityState: 'São Paulo / SP', discount: '30% OFF', code: '30OFF-CAPUTE-8492', timeAgo: 'há 5 min' },
    { name: 'Mariana S.', cityState: 'Salvador / BA', discount: '15% OFF', code: '15OFF-CAPUTE-3104', timeAgo: 'há 12 min' },
    { name: 'Lucas F.', cityState: 'Porto Alegre / RS', discount: '25% OFF', code: '25OFF-CAPUTE-7193', timeAgo: 'há 28 min' },
    { name: 'Beatriz R.', cityState: 'Curitiba / PR', discount: '10% OFF', code: 'PRIMEIRA10', timeAgo: 'há 45 min' },
    { name: 'Felipe T.', cityState: 'Belo Horizonte / MG', discount: '30% OFF', code: '30OFF-CAPUTE-5241', timeAgo: 'há 1 hora' },
    { name: 'Amanda C.', cityState: 'Recife / PE', discount: '15% OFF', code: '15OFF-CAPUTE-9812', timeAgo: 'há 2 horas' },
    { name: 'Gabriel K.', cityState: 'Brasília / DF', discount: '25% OFF', code: '25OFF-CAPUTE-4410', timeAgo: 'há 3 horas' },
  ];

  recentBrazilWinners = signal<WinnerFeedItem[]>(this.initialWinners);

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      this.timerInterval = setInterval(() => {
        let sec = this.countdownSeconds() - 1;
        let min = this.countdownMinutes();
        let hr = this.countdownHours();

        if (sec < 0) {
          sec = 59;
          min--;
          if (min < 0) {
            min = 59;
            hr--;
            if (hr < 0) {
              hr = 5;
            }
          }
        }
        this.countdownSeconds.set(sec);
        this.countdownMinutes.set(min);
        this.countdownHours.set(hr);
      }, 1000);
    }
  }

  ngOnDestroy(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  get isFirstPurchaseAvailable(): boolean {
    return !(this.authService.currentUser()?.hasMadeFirstPurchase);
  }

  get userWonCoupons(): string[] {
    return this.authService.currentUser()?.wonCoupons || [];
  }

  onStateChange(uf: string): void {
    this.selectedState.set(uf);
    this.loadingState.set(true);

    setTimeout(() => {
      this.loadingState.set(false);
      if (uf === 'Todos') {
        this.recentBrazilWinners.set(this.initialWinners);
      } else {
        const filtered = this.initialWinners.filter(w => w.cityState.includes(uf));
        const extraWinner: WinnerFeedItem = {
          name: 'Cliente Premiado',
          cityState: `Região de ${uf}`,
          discount: '25% OFF',
          code: `25OFF-CAPUTE-${Math.floor(1000 + Math.random() * 9000)}`,
          timeAgo: 'há 2 min'
        };
        this.recentBrazilWinners.set(filtered.length ? [extraWinner, ...filtered] : [extraWinner]);
      }
      this.toastService.info(`Servidores sincronizados para a região: ${uf}`);
    }, 450);
  }

  async participate(drawId: string): Promise<void> {
    this.participating.set(drawId);
    const res = await this.drawService.participateInDraw(drawId);
    this.participating.set(null);

    if (res.success && res.code) {
      const user = this.authService.currentUser();
      const stateName = this.selectedState() === 'Todos' ? 'Brasil' : this.selectedState();
      this.recentBrazilWinners.update(list => [
        {
          name: user?.name || 'Cliente Capute',
          cityState: `Sua Região (${stateName})`,
          discount: res.code?.includes('30') ? '30% OFF' : res.code?.includes('25') ? '25% OFF' : '15% OFF',
          code: res.code || '',
          timeAgo: 'agora mesmo'
        },
        ...list
      ]);
    }
  }

  spinRoulette(): void {
    if (this.spinningWheel()) return;
    this.spinningWheel.set(true);
    this.rouletteResult.set(null);

    setTimeout(() => {
      const discounts = ['15% OFF', '20% OFF', '25% OFF', '30% OFF'];
      const chosenDiscount = discounts[Math.floor(Math.random() * discounts.length)];
      const percentNum = chosenDiscount.replace(/[^0-9]/g, '');
      const generatedCode = `${percentNum}OFF-ROLETA-${Math.floor(1000 + Math.random() * 9000)}`;

      this.rouletteResult.set({ discount: chosenDiscount, code: generatedCode });
      this.spinningWheel.set(false);
      this.authService.addWonCoupon(generatedCode);
      this.toastService.success(`🎉 ROLETEADO COM SUCESSO! Você ganhou o cupom ${chosenDiscount}: ${generatedCode}`);
    }, 2000);
  }

  copyCode(code: string): void {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(code).catch(() => {});
    }
    this.copied.set(code);
    this.toastService.success(`Cupom ${code} copiado com sucesso!`);
    setTimeout(() => this.copied.set(null), 2000);
  }

  applyAndGoToCart(code: string): void {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(code).catch(() => {});
    }
    this.toastService.success(`Cupom ${code} copiado! Redirecionando para o carrinho...`);
    this.router.navigate(['/carrinho']);
  }
}
