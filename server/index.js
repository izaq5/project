const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Base de Dados em Memória do Backend
const db = {
  users: [
    {
      id: 'usr_demo_1',
      name: 'Cliente Demo',
      email: 'demo@caputestore.com',
      isVip: false,
      isPremium: false,
      hasMadeFirstPurchase: false,
      wonCoupons: []
    },
    {
      id: 'usr_vip_1',
      name: 'Carlos VIP',
      email: 'vip@caputestore.com',
      isVip: true,
      isPremium: true,
      hasMadeFirstPurchase: true,
      wonCoupons: ['25PREMIUM-VIP-101']
    }
  ],
  
  // Controle de Cotas e Ganhadores dos Sorteios
  draws: {
    raffle_15: {
      id: 'raffle_15',
      title: 'Sorteio 15% OFF (Geral)',
      discount: 15,
      totalCoupons: 25,
      claimedCount: 5,
      requiresPremium: false,
      winners: ['usr_vip_1']
    },
    raffle_25_premium: {
      id: 'raffle_25_premium',
      title: 'Sorteio Premium 25% OFF',
      discount: 25,
      totalCoupons: 15,
      claimedCount: 2,
      requiresPremium: true,
      winners: ['usr_vip_1']
    },
    raffle_30_premium: {
      id: 'raffle_30_premium',
      title: 'Sorteio Premium 30% OFF',
      discount: 30,
      totalCoupons: 10,
      claimedCount: 1,
      requiresPremium: true,
      winners: []
    }
  },

  // Cupons Gerados/Disponíveis no Sistema
  coupons: [
    {
      code: 'PRIMEIRA10',
      type: 'first_purchase',
      discountPercent: 10,
      description: '10% de desconto na sua 1ª compra',
      isFirstPurchaseOnly: true
    },
    {
      code: 'CAPUTE15',
      type: 'standard',
      discountPercent: 15,
      description: '15% de desconto para compras acima de R$ 200',
      minSubtotal: 200
    },
    {
      code: '25PREMIUM-VIP-101',
      type: 'raffle_25_premium',
      discountPercent: 25,
      description: '25% OFF exclusivo do Sorteio Premium',
      assignedUserId: 'usr_vip_1',
      isPremiumOnly: true
    }
  ],

  // Histórico de Pedidos
  orders: [],

  // Benefícios e Parcerias da Área VIP (Extensível)
  vipPartnerships: [
    {
      id: 'p_cine',
      category: 'Entretenimento & Filmes',
      partnerName: 'CineMax Pass',
      benefit: '1 Mês Grátis + 30% OFF na assinatura de ingressos',
      icon: '🎬',
      claimCode: 'CAPUTE-CINEMAX-VIP'
    },
    {
      id: 'p_stream',
      category: 'Streaming & Música',
      partnerName: 'SoundPrime',
      benefit: '2 Meses de Música Sem Anúncios',
      icon: '🎧',
      claimCode: 'CAPUTE-SOUND-VIP'
    },
    {
      id: 'p_games',
      category: 'Games & E-Sports',
      partnerName: 'GamePass Vault',
      benefit: 'Acesso VIP a Servidores Dedicados + 20% OFF em Keys',
      icon: '🎮',
      claimCode: 'CAPUTE-GAMEPASS-2025'
    },
    {
      id: 'p_edu',
      category: 'Cursos & Tecnologia',
      partnerName: 'TechAcademy Pro',
      benefit: '40% OFF em Cursos de Tecnologia & Design',
      icon: '🚀',
      claimCode: 'CAPUTE-ACADEMY-VIP'
    }
  ]
};

// ==========================================
// ROTAS DE API
// ==========================================

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'CaputeStore API Backend', timestamp: new Date() });
});

// Autenticação / Perfil
app.post('/api/auth/register', (req, res) => {
  const { name, email, password, phone, cpf, birthDate, wantVip } = req.body;
  if (!email || !name) {
    return res.status(400).json({ error: 'Nome e E-mail são obrigatórios.' });
  }

  let user = db.users.find(u => u.email === email);
  if (user) {
    return res.status(400).json({ error: 'E-mail já cadastrado.' });
  }

  if (cpf && db.users.some(u => u.cpf && u.cpf.replace(/\D/g, '') === cpf.replace(/\D/g, ''))) {
    return res.status(400).json({ error: 'CPF já cadastrado em outra conta.' });
  }

  user = {
    id: `usr_${Date.now()}`,
    name,
    email,
    phone: phone || '',
    cpf: cpf || '',
    birthDate: birthDate || '',
    isVip: !!wantVip,
    isPremium: !!wantVip,
    hasMadeFirstPurchase: false,
    wonCoupons: []
  };

  db.users.push(user);
  res.json({ message: 'Conta criada com sucesso!', user });
});

app.post('/api/auth/login', (req, res) => {
  const { email } = req.body;
  let user = db.users.find(u => u.email === email);
  
  if (!user) {
    // Cria automaticamente em ambiente demo
    user = {
      id: `usr_${Date.now()}`,
      name: email.split('@')[0],
      email,
      isVip: false,
      isPremium: false,
      hasMadeFirstPurchase: false,
      wonCoupons: []
    };
    db.users.push(user);
  }

  res.json({ message: 'Login realizado com sucesso!', user });
});

// Assinatura VIP (R$ 20,00)
app.post('/api/vip/subscribe', (req, res) => {
  const { userId, paymentMethod } = req.body;
  let user = db.users.find(u => u.id === userId);

  if (!user) {
    return res.status(404).json({ error: 'Usuário não encontrado.' });
  }

  user.isVip = true;
  user.isPremium = true;

  res.json({
    success: true,
    message: 'Parabéns! Você agora é um membro CaputeStore VIP!',
    user,
    whatsappGroupUrl: 'https://chat.whatsapp.com/CaputeStoreVIPExclusivo',
    benefits: [
      'Acesso ao Grupo Exclusivo do WhatsApp',
      'Desconto exclusivo em todas as compras',
      'Participação nos Sorteios Premium de 25% e 30%',
      'Parcerias com serviços digitais e plataformas de filmes/jogos'
    ]
  });
});

// Validação de Cupons (REGRAS DE NEGÓCIO DO BACKEND)
app.post('/api/coupons/validate', (req, res) => {
  const { code, userId, subtotal = 0 } = req.body;
  const cleanCode = (code || '').trim().toUpperCase();

  if (!cleanCode) {
    return res.status(400).json({ error: 'Código de cupom inválido.' });
  }

  const user = db.users.find(u => u.id === userId) || {
    id: userId || 'guest',
    isVip: false,
    isPremium: false,
    hasMadeFirstPurchase: false
  };

  // 1. Regra: Cupom de Primeira Compra (10% OFF)
  if (cleanCode === 'PRIMEIRA10' || cleanCode === 'BEMVINDO10') {
    if (user.hasMadeFirstPurchase) {
      return res.status(403).json({
        valid: false,
        error: 'Este cupom de 10% é válido exclusivamente para a PRIMEIRA compra do cliente. Você já realizou compras anteriormente.'
      });
    }
    return res.json({
      valid: true,
      code: cleanCode,
      discountPercent: 10,
      description: '10% OFF na Primeira Compra'
    });
  }

  // Busca o cupom na base
  const coupon = db.coupons.find(c => c.code.toUpperCase() === cleanCode);

  if (!coupon) {
    return res.status(404).json({
      valid: false,
      error: 'Cupom não encontrado ou expirado.'
    });
  }

  // 2. Regra: Se o cupom foi atrelado a um ganhador específico do sorteio
  if (coupon.assignedUserId && coupon.assignedUserId !== userId) {
    return res.status(403).json({
      valid: false,
      error: 'Este cupom individual pertence a outro participante sorteado.'
    });
  }

  // 3. Regra: Cupom Premium (25% ou 30%)
  if (coupon.isPremiumOnly && !user.isPremium && !user.isVip) {
    return res.status(403).json({
      valid: false,
      error: 'Este cupom é exclusivo para clientes com status Premium ou VIP.'
    });
  }

  // 4. Regra: Subtotal Mínimo
  if (coupon.minSubtotal && subtotal < coupon.minSubtotal) {
    return res.status(400).json({
      valid: false,
      error: `Este cupom requer um valor mínimo de R$ ${coupon.minSubtotal.toFixed(2)}.`
    });
  }

  res.json({
    valid: true,
    code: coupon.code,
    discountPercent: coupon.discountPercent,
    description: coupon.description
  });
});

// Sorteios (Raffles)
app.get('/api/draws', (req, res) => {
  const { userId } = req.query;
  const user = db.users.find(u => u.id === userId);

  const list = Object.values(db.draws).map(draw => ({
    ...draw,
    hasParticipated: draw.winners.includes(userId),
    canParticipate: draw.requiresPremium ? (user && (user.isPremium || user.isVip)) : true
  }));

  res.json({ draws: list });
});

app.post('/api/draws/participate', (req, res) => {
  const { drawId, userId } = req.body;
  const draw = db.draws[drawId];
  const user = db.users.find(u => u.id === userId);

  if (!draw) {
    return res.status(404).json({ error: 'Sorteio não encontrado.' });
  }

  if (!user) {
    return res.status(401).json({ error: 'É necessário estar conectado para participar.' });
  }

  // Validação Backend do Status Premium/VIP
  if (draw.requiresPremium && !user.isPremium && !user.isVip) {
    return res.status(403).json({
      error: 'Acesso negado: Este sorteio de cupons é exclusivo para membros Premium e VIP. Faça o upgrade por R$ 20,00 para desbloquear!'
    });
  }

  // Validação de Limite de Cotas do Sorteio
  if (draw.claimedCount >= draw.totalCoupons) {
    return res.status(400).json({ error: 'Os cupons deste sorteio já se esgotaram!' });
  }

  // Validação de Duplicidade
  if (draw.winners.includes(userId)) {
    return res.status(400).json({ error: 'Você já participou e resgatou seu prêmio neste sorteio.' });
  }

  // Executa o sorteio e gera cupom individual único
  const winnerCode = `${draw.discount}OFF-CAPUTE-${Math.floor(1000 + Math.random() * 9000)}`;

  const newCoupon = {
    code: winnerCode,
    type: draw.id,
    discountPercent: draw.discount,
    description: `Cupom de ${draw.discount}% OFF sorteado na CaputeStore`,
    assignedUserId: userId,
    isPremiumOnly: draw.requiresPremium
  };

  db.coupons.push(newCoupon);
  draw.claimedCount += 1;
  draw.winners.push(userId);
  user.wonCoupons.push(winnerCode);

  res.json({
    success: true,
    message: `Parabéns! Você foi contemplado no ${draw.title}!`,
    coupon: newCoupon,
    code: winnerCode
  });
});

// Parcerias VIP (Plataformas parceiras, Filmes, Games, Cursos)
app.get('/api/vip/benefits', (req, res) => {
  res.json({
    whatsappUrl: 'https://chat.whatsapp.com/CaputeStoreVIPExclusivo',
    partnerships: db.vipPartnerships
  });
});

// Finalização de Pedidos
app.post('/api/orders', (req, res) => {
  const { userId, items, subtotal, discount, total, address, paymentMethod, couponCode } = req.body;
  let user = db.users.find(u => u.id === userId);

  if (user) {
    user.hasMadeFirstPurchase = true;
  }

  const order = {
    id: `ORD-${Date.now()}`,
    userId,
    items,
    subtotal,
    discount,
    total,
    address,
    paymentMethod,
    couponCode,
    status: 'Aprovado',
    date: new Date().toISOString()
  };

  db.orders.push(order);

  res.json({
    success: true,
    message: 'Pedido realizado com sucesso!',
    orderId: order.id
  });
});

app.listen(PORT, () => {
  console.log(`=================================================`);
  console.log(`🚀 CaputeStore Backend API ativo na porta ${PORT}`);
  console.log(`=================================================`);
});
