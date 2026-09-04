import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { DrawService } from '../../core/services/draw.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { CouponService } from '../../core/services/coupon.service';
import { Coupon } from '../../core/models/coupon.model';

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
  couponService = inject(CouponService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  // Controle de Abas Principais (Disponíveis vs. Em Breve)
  mainTab = signal<'disponiveis' | 'em-breve'>('disponiveis');

  copied = signal<string | null>(null);
  participating = signal<string | null>(null);
  selectedState = signal<string>('Todos');
  selectedCategory = signal<string>('todos');
  selectedNicheCategory = signal<string>('Todas');
  searchQuery = signal<string>('');
  loadingState = signal<boolean>(false);
  spinningWheel = signal<boolean>(false);
  rouletteResult = signal<{ discount: string; code: string } | null>(null);

  // Contagem regressiva ao vivo da apuração nacional
  countdownHours = signal(3);
  countdownMinutes = signal(42);
  countdownSeconds = signal(18);

  // 1. Cronômetro Regressivo para Cupom 10% (6 Horas para resgatar)
  tenPercentSeconds = signal(5 * 3600 + 48 * 60 + 35); // 5h 48m 35s restantes de 6h
  
  // 2. Cronômetro Regressivo para Cupom 25% Produtos Alto Valor (Mínimo 1h30)
  twentyFivePercentSeconds = signal(1 * 3600 + 29 * 60 + 50); // 1h 29m 50s restantes de 1h30

  // 3. Cronômetro Regressivo para Cupom 15% Em Breve (Desbloqueio às 18:00h)
  fifteenPercentSeconds = signal(4 * 3600 + 15 * 60 + 20); // Tempo restante para as 18h

  private timerInterval: any;

  readonly nicheCategories = [
    { id: 'Todas', name: '✨ Todas as Categorias' },
    { id: 'Celulares', name: '📱 Celulares' },
    { id: 'Notebooks', name: '💻 Notebooks' },
    { id: 'Fones', name: '🎧 Fones' },
    { id: 'Games', name: '🎮 Games' },
    { id: 'Monitores', name: '🖥️ Monitores' },
    { id: 'Smartwatches', name: '⌚ Smartwatches' },
    { id: 'Acessórios', name: '🔌 Acessórios' },
    { id: 'Geral', name: '👑 Cupons Globais VIP' }
  ];

  readonly brazilianStates = [
    { code: 'Todos', name: '🇧🇷 Brasil Inteiro (Todos os 27 Estados)' },
    { code: 'AC', name: 'Acre (AC)' },
    { code: 'AL', name: 'Alagoas (AL)' },
    { code: 'AP', name: 'Amapá (AP)' },
    { code: 'AM', name: 'Amazonas (AM)' },
    { code: 'BA', name: 'Bahia (BA)' },
    { code: 'CE', name: 'Ceará (CE)' },
    { code: 'DF', name: 'Distrito Federal (DF)' },
    { code: 'ES', name: 'Espírito Santo (ES)' },
    { code: 'GO', name: 'Goiás (GO)' },
    { code: 'MA', name: 'Maranhão (MA)' },
    { code: 'MT', name: 'Mato Grosso (MT)' },
    { code: 'MS', name: 'Mato Grosso do Sul (MS)' },
    { code: 'MG', name: 'Minas Gerais (MG)' },
    { code: 'PA', name: 'Pará (PA)' },
    { code: 'PB', name: 'Paraíba (PB)' },
    { code: 'PR', name: 'Paraná (PR)' },
    { code: 'PE', name: 'Pernambuco (PE)' },
    { code: 'PI', name: 'Piauí (PI)' },
    { code: 'RJ', name: 'Rio de Janeiro (RJ)' },
    { code: 'RN', name: 'Rio Grande do Norte (RN)' },
    { code: 'RS', name: 'Rio Grande do Sul (RS)' },
    { code: 'RO', name: 'Rondônia (RO)' },
    { code: 'RR', name: 'Roraima (RR)' },
    { code: 'SC', name: 'Santa Catarina (SC)' },
    { code: 'SP', name: 'São Paulo (SP)' },
    { code: 'SE', name: 'Sergipe (SE)' },
    { code: 'TO', name: 'Tocantins (TO)' },
  ];

  private readonly stateCitiesMap: Record<string, string[]> = {
    SP: ['São Paulo', 'Campinas', 'Santos', 'Ribeirão Preto', 'Sorocaba'],
    RJ: ['Rio de Janeiro', 'Niterói', 'Petrópolis', 'Volta Redonda'],
    MG: ['Belo Horizonte', 'Uberlândia', 'Juiz de Fora', 'Montes Claros'],
    RS: ['Porto Alegre', 'Caxias do Sul', 'Pelotas', 'Passo Fundo'],
    BA: ['Salvador', 'Feira de Santana', 'Vitória da Conquista'],
    PR: ['Curitiba', 'Londrina', 'Maringá', 'Cascavel'],
    SC: ['Florianópolis', 'Joinville', 'Blumenau', 'Chapecó'],
    CE: ['Fortaleza', 'Caucaia', 'Juazeiro do Norte'],
    PE: ['Recife', 'Jaboatão dos Guararapes', 'Caruaru'],
    GO: ['Goiânia', 'Aparecida de Goiânia', 'Anápolis'],
    DF: ['Brasília', 'Taguatinga', 'Ceilândia'],
    AM: ['Manaus', 'Parintins'],
    ES: ['Vitória', 'Vila Velha', 'Serra'],
    MT: ['Cuiabá', 'Várzea Grande'],
    MS: ['Campo Grande', 'Dourados'],
    PA: ['Belém', 'Ananindeua', 'Santarém'],
    MA: ['São Luís', 'Imperatriz'],
    PB: ['João Pessoa', 'Campina Grande'],
    RN: ['Natal', 'Mossoró'],
    AL: ['Maceió', 'Arapiraca'],
    PI: ['Teresina', 'Parnaíba'],
    SE: ['Aracaju', 'Nossa Senhora do Socorro'],
    RO: ['Porto Velho', 'Ji-Paraná'],
    AC: ['Rio Branco', 'Cruzeiro do Sul'],
    AP: ['Macapá', 'Santana'],
    RR: ['Boa Vista'],
    TO: ['Palmas', 'Araguaína'],
  };

  private readonly initialWinners: WinnerFeedItem[] = [
    { name: 'Carlos M.', cityState: 'São Paulo / SP', discount: '30% OFF', code: '30OFF-CAPUTE-8492', timeAgo: 'há 4 min' },
    { name: 'Mariana S.', cityState: 'Salvador / BA', discount: '15% OFF', code: '15OFF-CAPUTE-3104', timeAgo: 'há 10 min' },
    { name: 'Lucas F.', cityState: 'Porto Alegre / RS', discount: '25% OFF', code: '25OFF-CAPUTE-7193', timeAgo: 'há 22 min' },
    { name: 'Beatriz R.', cityState: 'Curitiba / PR', discount: '10% OFF', code: 'PRIMEIRA10', timeAgo: 'há 35 min' },
    { name: 'Felipe T.', cityState: 'Belo Horizonte / MG', discount: '30% OFF', code: '30OFF-CAPUTE-5241', timeAgo: 'há 50 min' },
    { name: 'Amanda C.', cityState: 'Recife / PE', discount: '15% OFF', code: '15OFF-CAPUTE-9812', timeAgo: 'há 1 hora' },
    { name: 'Gabriel K.', cityState: 'Brasília / DF', discount: '25% OFF', code: '25OFF-CAPUTE-4410', timeAgo: 'há 2 horas' },
  ];

  recentBrazilWinners = signal<WinnerFeedItem[]>(this.initialWinners);

  // Lista de Cupons Disponíveis com filtros reativos
  availableCoupons = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();
    const cat = this.selectedCategory();
    let list = this.couponService.getAvailableCoupons();

    if (cat === 'vip') {
      list = list.filter(c => c.isPremiumOnly);
    } else if (cat === '10') {
      list = list.filter(c => c.discountPercent === 10);
    } else if (cat === '25') {
      list = list.filter(c => c.discountPercent === 25);
    }

    if (query) {
      list = list.filter(c =>
        c.code.toLowerCase().includes(query) ||
        c.description.toLowerCase().includes(query) ||
        (c.category && c.category.toLowerCase().includes(query))
      );
    }
    return list;
  });

  // Lista de Cupons Em Breve
  upcomingCoupons = computed(() => {
    return this.couponService.getUpcomingCouponsList();
  });

  // Cupons VIP por Nicho
  vipCoupons = computed(() => {
    if (!this.authService.isVip()) return [];
    const cat = this.selectedNicheCategory();
    const query = this.searchQuery().trim().toLowerCase();
    let list = this.couponService.getVipCoupons(cat);

    if (query) {
      list = list.filter(c =>
        c.code.toLowerCase().includes(query) ||
        c.description.toLowerCase().includes(query) ||
        (c.category && c.category.toLowerCase().includes(query))
      );
    }
    return list;
  });

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      this.timerInterval = setInterval(() => {
        // Cronômetro da Apuração
        let sec = this.countdownSeconds() - 1;
        let min = this.countdownMinutes();
        let hr = this.countdownHours();

        if (sec < 0) {
          sec = 59;
          min--;
          if (min < 0) {
            min = 59;
            hr--;
            if (hr < 0) hr = 5;
          }
        }
        this.countdownSeconds.set(sec);
        this.countdownMinutes.set(min);
        this.countdownHours.set(hr);

        // 1. Cronômetro 10% (6 Horas)
        if (this.tenPercentSeconds() > 0) {
          this.tenPercentSeconds.update(s => s - 1);
        }

        // 2. Cronômetro 25% Alto Valor (1h30)
        if (this.twentyFivePercentSeconds() > 0) {
          this.twentyFivePercentSeconds.update(s => s - 1);
        }

        // 3. Cronômetro 15% Em Breve (Desbloqueio às 18:00h)
        if (this.fifteenPercentSeconds() > 0) {
          this.fifteenPercentSeconds.update(s => s - 1);
        }
      }, 1000);
    }
  }

  ngOnDestroy(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  formatTime(totalSec: number): string {
    const h = Math.floor(totalSec / 3600).toString().padStart(2, '0');
    const m = Math.floor((totalSec % 3600) / 60).toString().padStart(2, '0');
    const s = Math.floor(totalSec % 60).toString().padStart(2, '0');
    return `${h}h ${m}m ${s}s`;
  }

  setMainTab(tab: 'disponiveis' | 'em-breve'): void {
    this.mainTab.set(tab);
  }

  setNicheCategory(category: string): void {
    this.selectedNicheCategory.set(category);
  }

  setCategoryFilter(cat: string): void {
    this.selectedCategory.set(cat);
  }

  setSearchQuery(query: string): void {
    this.searchQuery.set(query);
  }

  get isFirstPurchaseAvailable(): boolean {
    return !(this.authService.currentUser()?.hasMadeFirstPurchase);
  }

  get userWonCoupons(): string[] {
    return this.authService.currentUser()?.wonCoupons || [];
  }

  // REDIRECIONAMENTO DIRETO PARA OS PRODUTOS COM ESTE CUPOM
  claimAndRedirect(coupon: { code: string; category?: string; minProductPrice?: number; isHighValue?: boolean; discountPercent?: number }): void {
    this.copyCode(coupon.code);
    this.couponService.setGlobalCoupon(coupon.code);

    const queryParams: Record<string, string | number> = {
      cupom: coupon.code
    };

    if (coupon.isHighValue || (coupon.minProductPrice && coupon.minProductPrice >= 2000)) {
      queryParams['minPrice'] = 2000;
      queryParams['altoValor'] = 1;
    }

    if (coupon.category && coupon.category.toLowerCase() !== 'todas' && coupon.category.toLowerCase() !== 'geral') {
      queryParams['categoria'] = coupon.category;
    }

    this.toastService.success(`🎉 Cupom ${coupon.code} ativado! Redirecionando para os produtos elegíveis...`);
    
    setTimeout(() => {
      this.router.navigate(['/produtos'], { queryParams });
    }, 400);
  }

  // AVISO DE CUPOM EM BREVE
  claimUpcomingCoupon(coupon: { code: string; discountPercent?: number; startsAt?: string }): void {
    this.toastService.info(`🔔 Cupom ${coupon.code} (${coupon.discountPercent || 15}% OFF) agendado para liberar às ${coupon.startsAt || '18:00h'}! Fique ligado.`);
  }

  onStateChange(uf: string): void {
    this.selectedState.set(uf);
    this.loadingState.set(true);

    setTimeout(() => {
      this.loadingState.set(false);
      if (uf === 'Todos') {
        this.recentBrazilWinners.set(this.initialWinners);
      } else {
        const cities = this.stateCitiesMap[uf] || ['Capital'];
        const randomCity = cities[Math.floor(Math.random() * cities.length)];
        const names = ['Eduardo C.', 'Renata M.', 'Thiago S.', 'Aline P.', 'Marcelo F.', 'Vanessa L.'];
        const randomName = names[Math.floor(Math.random() * names.length)];

        const stateSpecificWinners: WinnerFeedItem[] = [
          {
            name: randomName,
            cityState: `${randomCity} / ${uf}`,
            discount: '30% OFF',
            code: `30OFF-CAPUTE-${Math.floor(1000 + Math.random() * 9000)}`,
            timeAgo: 'há 1 min'
          },
          {
            name: 'Cliente Premiado',
            cityState: `Região de ${uf}`,
            discount: '25% OFF',
            code: `25OFF-CAPUTE-${Math.floor(1000 + Math.random() * 9000)}`,
            timeAgo: 'há 8 min'
          },
          {
            name: 'Ganhador Local',
            cityState: `${cities[0]} / ${uf}`,
            discount: '15% OFF',
            code: `15OFF-CAPUTE-${Math.floor(1000 + Math.random() * 9000)}`,
            timeAgo: 'há 24 min'
          }
        ];
        this.recentBrazilWinners.set(stateSpecificWinners);
      }
      this.toastService.info(`Servidores sincronizados para ${uf}!`);
    }, 400);
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
    }, 1800);
  }

  copyCode(code: string): void {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(code).catch(() => {});
    }
    this.couponService.setGlobalCoupon(code);
    this.copied.set(code);
    this.toastService.success(`Cupom ${code} copiado!`);
    setTimeout(() => this.copied.set(null), 2000);
  }

  applyAndGoToCart(code: string): void {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(code).catch(() => {});
    }
    this.couponService.setGlobalCoupon(code);
    this.toastService.success(`Cupom ${code} aplicado ao seu carrinho! Redirecionando...`);
    this.router.navigate(['/carrinho']);
  }
}
