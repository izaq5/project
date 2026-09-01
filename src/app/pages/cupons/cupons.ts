import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { DrawService } from '../../core/services/draw.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { CouponService } from '../../core/services/coupon.service';

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
  private couponService = inject(CouponService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  copied = signal<string | null>(null);
  participating = signal<string | null>(null);
  selectedState = signal<string>('Todos');
  selectedCategory = signal<string>('todos');
  searchQuery = signal<string>('');
  loadingState = signal<boolean>(false);
  spinningWheel = signal<boolean>(false);
  rouletteResult = signal<{ discount: string; code: string } | null>(null);

  // Relógio Regressivo em Tempo Real
  countdownHours = signal(3);
  countdownMinutes = signal(42);
  countdownSeconds = signal(18);
  private timerInterval: any;

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
    SP: ['São Paulo', 'Campinas', 'Santos', 'Ribeirão Preto', 'Sorocaba', 'Bauru'],
    RJ: ['Rio de Janeiro', 'Niterói', 'Petrópolis', 'Volta Redonda', 'Macaé'],
    MG: ['Belo Horizonte', 'Uberlândia', 'Juiz de Fora', 'Montes Claros'],
    RS: ['Porto Alegre', 'Caxias do Sul', 'Pelotas', 'Canoas', 'Passo Fundo'],
    BA: ['Salvador', 'Feira de Santana', 'Vitória da Conquista', 'Ilhéus'],
    PR: ['Curitiba', 'Londrina', 'Maringá', 'Cascavel', 'Ponta Grossa'],
    SC: ['Florianópolis', 'Joinville', 'Blumenau', 'Chapecó', 'Criciúma'],
    CE: ['Fortaleza', 'Caucaia', 'Juazeiro do Norte', 'Sobral'],
    PE: ['Recife', 'Jaboatão dos Guararapes', 'Olinda', 'Caruaru'],
    GO: ['Goiânia', 'Aparecida de Goiânia', 'Anápolis', 'Rio Verde'],
    DF: ['Brasília', 'Taguatinga', 'Ceilândia', 'Águas Claras'],
    AM: ['Manaus', 'Parintins', 'Itacoatiara', 'Manacapuru'],
    ES: ['Vitória', 'Vila Velha', 'Serra', 'Cariacica'],
    MT: ['Cuiabá', 'Várzea Grande', 'Rondonópolis', 'Sinop'],
    MS: ['Campo Grande', 'Dourados', 'Três Lagoas', 'Corumbá'],
    PA: ['Belém', 'Ananindeua', 'Santarém', 'Marabá'],
    MA: ['São Luís', 'Imperatriz', 'Timon', 'Caxias'],
    PB: ['João Pessoa', 'Campina Grande', 'Santa Rita', 'Patos'],
    RN: ['Natal', 'Mossoró', 'Parnamirim', 'Caicó'],
    AL: ['Maceió', 'Arapiraca', 'Rio Largo', 'Palmeira dos Índios'],
    PI: ['Teresina', 'Parnaíba', 'Picos', 'Floriano'],
    SE: ['Aracaju', 'Nossa Senhora do Socorro', 'Lagarto', 'Itabaiana'],
    RO: ['Porto Velho', 'Ji-Paraná', 'Ariquemes', 'Vilhena'],
    AC: ['Rio Branco', 'Cruzeiro do Sul', 'Sena Madureira'],
    AP: ['Macapá', 'Santana', 'Laranjal do Jari'],
    RR: ['Boa Vista', 'Rorainópolis', 'Caracaraí'],
    TO: ['Palmas', 'Araguaína', 'Gurupi', 'Porto Nacional'],
  };

  private readonly initialWinners: WinnerFeedItem[] = [
    { name: 'Carlos M.', cityState: 'São Paulo / SP', discount: '30% OFF', code: '30OFF-CAPUTE-8492', timeAgo: 'há 4 min' },
    { name: 'Mariana S.', cityState: 'Salvador / BA', discount: '15% OFF', code: '15OFF-CAPUTE-3104', timeAgo: 'há 10 min' },
    { name: 'Lucas F.', cityState: 'Porto Alegre / RS', discount: '25% OFF', code: '25OFF-CAPUTE-7193', timeAgo: 'há 22 min' },
    { name: 'Beatriz R.', cityState: 'Curitiba / PR', discount: '10% OFF', code: 'PRIMEIRA10', timeAgo: 'há 35 min' },
    { name: 'Felipe T.', cityState: 'Belo Horizonte / MG', discount: '30% OFF', code: '30OFF-CAPUTE-5241', timeAgo: 'há 50 min' },
    { name: 'Amanda C.', cityState: 'Recife / PE', discount: '15% OFF', code: '15OFF-CAPUTE-9812', timeAgo: 'há 1 hora' },
    { name: 'Gabriel K.', cityState: 'Brasília / DF', discount: '25% OFF', code: '25OFF-CAPUTE-4410', timeAgo: 'há 2 horas' },
    { name: 'Juliana P.', cityState: 'Florianópolis / SC', discount: '30% OFF', code: '30OFF-CAPUTE-9921', timeAgo: 'há 3 horas' },
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
      this.toastService.info(`Servidores do estado (${uf}) conectados com sucesso!`);
    }, 450);
  }

  setCategoryFilter(cat: string): void {
    this.selectedCategory.set(cat);
  }

  setSearchQuery(query: string): void {
    this.searchQuery.set(query);
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
    this.couponService.setGlobalCoupon(code);
    this.copied.set(code);
    this.toastService.success(`Cupom ${code} copiado com sucesso!`);
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
