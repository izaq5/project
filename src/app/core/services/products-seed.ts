import { Product } from '../models/product.model';

function img(seed: string, n: number): string[] {
  return Array.from({ length: n }, (_, i) => `https://picsum.photos/seed/${seed}-${i}/700/700`);
}

const commonFaq = [
  { question: 'Qual o prazo de entrega?', answer: 'Entrega rápida de 2 a 5 dias úteis para todo o Brasil com rastreamento em tempo real.' },
  { question: 'Posso trocar ou devolver o produto?', answer: 'Sim, você tem até 7 dias corridos após o recebimento para solicitar troca ou devolução sem custo.' },
  { question: 'O produto tem garantia?', answer: 'Sim, todos os produtos possuem garantia de 12 meses direto com a CaputeStore.' },
];

export const PRODUCTS_SEED: Product[] = [
  {
    id: 'smartphone-galaxy-s24',
    name: 'Smartphone Galaxy S24 256GB',
    category: 'Celulares',
    price: 4299.00,
    originalPrice: 4899.00,
    images: img('galaxy-s24', 4),
    description: 'Smartphone de última geração com Galaxy AI, tela Dynamic AMOLED 2X, câmera tripla de alta resolução com Nightography e bateria para o dia todo.',
    features: [
      'Recursos Avançados Galaxy AI',
      'Tela Dynamic AMOLED 2X 120Hz',
      'Câmera de 50MP com Zoom Óptico',
      'Processador Octa-Core de Alta Performance',
      'Resistência à água IP68'
    ],
    specs: [
      { label: 'Armazenamento', value: '256GB' },
      { label: 'Memória RAM', value: '8GB' },
      { label: 'Tela', value: '6.2" FHD+' },
      { label: 'Garantia', value: '12 meses CaputeStore' }
    ],
    rating: 4.9,
    reviewsCount: 128,
    reviews: [
      { id: 'r1', author: 'Lucas M.', rating: 5, comment: 'Câmera fantástica e entrega super rápida da CaputeStore!', date: '2026-06-02' }
    ],
    stock: 25,
    badge: 'mais-vendido',
    exclusive: false,
    faq: commonFaq,
    soldBy: 'CaputeStore',
    freeShipping: true
  },
  {
    id: 'notebook-dell-inspiron-15',
    name: 'Notebook Dell Inspiron 15 i5 8GB 512GB SSD',
    category: 'Notebooks',
    price: 3299.00,
    originalPrice: 3799.00,
    images: img('dell-inspiron', 4),
    description: 'Notebook de alta eficiência com processador Intel Core i5, SSD NVMe ultrarrápido, tela Full HD de 15.6" com bordas finas e acabamento elegante.',
    features: [
      'Processador Intel Core i5 de 12ª Geração',
      'SSD NVMe de 512GB de Altíssima Velocidade',
      'Tela 15.6" Full HD Anti-reflexo',
      'Teclado Ergonômico com Numérico',
      'Bateria de Longa Duração'
    ],
    specs: [
      { label: 'Processador', value: 'Intel Core i5' },
      { label: 'Memória', value: '8GB DDR4' },
      { label: 'SSD', value: '512GB NVMe' }
    ],
    rating: 4.8,
    reviewsCount: 96,
    reviews: [
      { id: 'r1', author: 'Fernanda O.', rating: 5, comment: 'Excelente para trabalho e estudos. Liga em segundos!', date: '2026-05-14' }
    ],
    stock: 18,
    badge: 'mais-vendido',
    exclusive: false,
    faq: commonFaq,
    soldBy: 'CaputeStore',
    freeShipping: true
  },
  {
    id: 'fone-bluetooth-sony-wh-ch720n',
    name: 'Fone Bluetooth Sony WH-CH720N ANC',
    category: 'Fones',
    price: 599.00,
    originalPrice: 749.00,
    images: img('sony-headphone', 4),
    description: 'Headphone wireless com cancelamento de ruído ativo (ANC), tecnologia V1 integrada, leveza extrema de apenas 192g e autonomia de até 35 horas.',
    features: [
      'Cancelamento de Ruído Ativo Dual Sensor',
      'Bateria de até 35 horas com Carga Rápida',
      'Apenas 192g para Máximo Conforto',
      'Conexão Multiponto (Dois dispositivos)'
    ],
    specs: [
      { label: 'Driver', value: '30mm' },
      { label: 'Autonomia', value: '35 horas' },
      { label: 'Conexão', value: 'Bluetooth 5.2' }
    ],
    rating: 4.7,
    reviewsCount: 84,
    reviews: [
      { id: 'r1', author: 'Rafael T.', rating: 5, comment: 'Isola muito bem os ruídos e a bateria dura a semana toda.', date: '2026-04-28' }
    ],
    stock: 30,
    badge: 'novo',
    exclusive: false,
    faq: commonFaq,
    soldBy: 'CaputeStore',
    freeShipping: true
  },
  {
    id: 'smartwatch-xiaomi-mi-band-8',
    name: 'Smartwatch Xiaomi Mi Band 8 Active',
    category: 'Smartwatches',
    price: 239.00,
    originalPrice: 299.00,
    images: img('mi-band-8', 4),
    description: 'Pulseira inteligente com tela AMOLED de 1.62", taxa de atualização de 60Hz, mais de 150 modos de treino e monitoramento contínuo de SpO2 e frequência cardíaca.',
    features: [
      'Tela AMOLED 1.62" 60Hz',
      'Mais de 150 Modos de Esporte',
      'Monitoramento 24h de Frequência Cardíaca e O2',
      'Resistência à água 5ATM',
      'Bateria para até 16 dias de uso'
    ],
    specs: [
      { label: 'Tela', value: 'AMOLED 1.62"' },
      { label: 'Bateria', value: '190mAh (Até 16 dias)' },
      { label: 'Resistência', value: '50 metros (5ATM)' }
    ],
    rating: 4.6,
    reviewsCount: 52,
    reviews: [
      { id: 'r1', author: 'Bruno C.', rating: 5, comment: 'Pelo preço é imbatível! Entrega super pontual.', date: '2026-05-20' }
    ],
    stock: 50,
    badge: 'mais-vendido',
    exclusive: false,
    faq: commonFaq,
    soldBy: 'CaputeStore',
    freeShipping: false
  },
  {
    id: 'mouse-gamer-logitech-g-pro-x',
    name: 'Mouse Gamer Logitech G Pro X Superlight',
    category: 'Acessórios',
    price: 629.00,
    originalPrice: 799.00,
    images: img('logitech-superlight', 4),
    description: 'Um dos mouses sem fio mais leves do mundo (menos de 63g). Desenvolvido em colaboração com os principais profissionais de eSports.',
    features: [
      'Peso Ultraleve Inferior a 63 Gramas',
      'Tecnologia Sem Fio Lightspeed sem Latência',
      'Sensor Hero 25K de Alta Precisão',
      'Pés em PTFE Sem Aditivos para Deslize Suave'
    ],
    specs: [
      { label: 'Sensor', value: 'Hero 25K (25.600 DPI)' },
      { label: 'Peso', value: '63g' },
      { label: 'Conexão', value: 'Lightspeed 2.4GHz' }
    ],
    rating: 4.9,
    reviewsCount: 71,
    reviews: [
      { id: 'r1', author: 'Gabriel P.', rating: 5, comment: 'Simplesmente o melhor mouse para competitivos.', date: '2026-06-10' }
    ],
    stock: 20,
    badge: 'exclusivo',
    exclusive: true,
    faq: commonFaq,
    soldBy: 'CaputeStore',
    freeShipping: true
  },
  {
    id: 'headset-gamer-pro-capute',
    name: 'Headset Capute Pro Wireless 7.1',
    category: 'Fones',
    price: 349.90,
    originalPrice: 429.00,
    images: img('headset-pro-capute', 4),
    description: 'Headset gamer profissional de alta fidelidade sonora, almofadas de espuma com memória de forma e iluminação de neon amarela exclusiva.',
    features: [
      'Áudio Surround 7.1 Imersivo',
      'Bateria de 24h sem Fio',
      'Almofadas de Veludo e Couro Sintético',
      'Microfone Removível com Filtro Pop'
    ],
    specs: [
      { label: 'Drivers', value: '50mm Neodímio' },
      { label: 'Peso', value: '280g' }
    ],
    rating: 4.8,
    reviewsCount: 44,
    reviews: [
      { id: 'r1', author: 'Mariana K.', rating: 5, comment: 'Design lindo demais com o detalhe em amarelo!', date: '2026-05-19' }
    ],
    stock: 35,
    badge: 'exclusivo',
    exclusive: true,
    faq: commonFaq,
    soldBy: 'CaputeStore',
    freeShipping: true
  }
];
