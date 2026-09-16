export interface ProductVariation {
  id: string;
  name: string;
  colorName: string;
  hex: string;
  image: string;
  inStock: boolean;
  price: number;
  originalPrice: number;
  discount: number;
}

export interface GalleryVideo {
  id: string;
  url: string;
  title: string;
  duration: string;
  thumbnail: string;
  tag?: string;
  sourceUrl?: string;
  chapters?: Array<{ time: number; label: string }>;
}

export interface ReviewItem {
  id: string;
  author: string;
  date: string;
  rating: number;
  title: string;
  comment: string;
  verified: boolean;
  helpfulCount: number;
  variation: string;
}

export interface QuestionItem {
  id: string;
  question: string;
  date: string;
  answer: string;
  answerDate: string;
}

export interface RelatedProduct {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  discount?: string;
  installments: string;
  imageUrl: string;
  shipping: string;
  rating: number;
  reviewsCount: number;
  isFull: boolean;
  highlight?: string;
}

export interface KitSize {
  label: string;
  price: number;
  originalPrice: number;
  units: number;
  available: boolean;
  active?: boolean;
}

export function getKitDetails(kitLabel?: string): KitSize {
  const fallback = PRODUCT_DATA.kitSizes[0];
  if (!kitLabel) return fallback;
  const lower = kitLabel.toLowerCase();
  const match = PRODUCT_DATA.kitSizes.find(
    (k) => k.label.toLowerCase() === lower || lower.includes(k.label.toLowerCase())
  );
  if (match) return match;
  if (lower.includes('6') || lower.includes('seis')) return PRODUCT_DATA.kitSizes[3];
  if (lower.includes('3') || lower.includes('tres') || lower.includes('três')) return PRODUCT_DATA.kitSizes[2];
  if (lower.includes('2') || lower.includes('duas') || lower.includes('dois')) return PRODUCT_DATA.kitSizes[1];
  return fallback;
}

export const PRODUCT_DATA = {
  id: 'MLB5371256702',
  productId: 'MLB42925862',
  title: 'Spray Borracha Líquida Dryko Impermeabilizante Branco 400ml',
  condition: 'Novo',
  soldQuantity: '+10 mil vendidos',
  ranking: '1º em Mantas e Fitas Asfálticas Dryko',
  rating: 4.8,
  reviewsCount: 418,
  price: 29.90,
  originalPrice: 49.90,
  discountPercentage: 40,
  discountText: '40% OFF no Pix ou Saldo no Mercado Pago',
  installmentsText: 'em 2x R$ 14,95 sem juros',
  alternativePriceText: 'ou R$ 34,90 em outros meios',
  visaDiscountText: '10% OFF Cartão Mercado Pago Visa',
  fullShipping: true,
  freeShipping: true,
  stock: 24,
  seller: {
    name: 'Dryko Impermeabilizantes',
    isOfficialStore: true,
    level: 'MercadoLíder Platinum',
    levelDescription: 'É um dos melhores do site!',
    salesCompleted: '+50mil vendas nos últimos 60 dias',
    goodService: 'Presta bom atendimento',
    onTimeDelivery: 'Entrega os produtos dentro do prazo',
  },
  variations: [
    {
      id: 'MLB42925862',
      name: 'Branco',
      colorName: 'Branco',
      hex: '#FFFFFF',
      image: 'https://http2.mlstatic.com/D_NQ_NP_2X_684425-MLA99954571681_112025-F.webp',
      inStock: true,
      price: 29.90,
      originalPrice: 49.90,
      discount: 40,
    },
    {
      id: 'MLB43185019',
      name: 'Preto',
      colorName: 'Preto',
      hex: '#222222',
      image: 'https://http2.mlstatic.com/D_NQ_NP_2X_886774-MLA99385009224_112025-F.webp',
      inStock: true,
      price: 29.90,
      originalPrice: 49.90,
      discount: 40,
    },
    {
      id: 'MLB43203739',
      name: 'Transparente',
      colorName: 'Transparente',
      hex: '#E0E7FF',
      image: 'https://http2.mlstatic.com/D_NQ_NP_2X_711384-MLA99935868991_112025-F.webp',
      inStock: true,
      price: 29.90,
      originalPrice: 49.90,
      discount: 40,
    },
  ] as ProductVariation[],
  kitSizes: [
    { label: '1 unidade (400ml)', price: 29.90, originalPrice: 49.90, units: 1, available: true, active: true },
    { label: 'Kit 2 unidades', price: 54.90, originalPrice: 99.80, units: 2, available: true },
    { label: 'Kit 3 unidades (Mais vendido)', price: 79.90, originalPrice: 149.70, units: 3, available: true },
    { label: 'Kit 6 unidades (Econômico)', price: 149.90, originalPrice: 299.40, units: 6, available: true },
  ] as KitSize[],
  galleryImages: {
    Branco: [
      'https://http2.mlstatic.com/D_NQ_NP_2X_684425-MLA99954571681_112025-F.webp',
      '/dryko-aplicacao-telhado.webp',
    ],
    Preto: [
      'https://http2.mlstatic.com/D_NQ_NP_2X_886774-MLA99385009224_112025-F.webp',
      '/dryko-aplicacao-telhado.webp',
    ],
    Transparente: [
      'https://http2.mlstatic.com/D_NQ_NP_2X_711384-MLA99935868991_112025-F.webp',
      '/dryko-aplicacao-telhado.webp',
    ],
  },
  video: {
    id: 'video-spray-vedatudo',
    url: '/dryko-spray-vedatudo-branco-demonstracao.mp4',
    title: 'Demonstração: Aplicação Spray Borracha Líquida Dryko',
    duration: '0:59',
    thumbnail: '/thumb-spray-branco-video.jpg',
    sourceUrl: 'https://streamable.com/oiup7n',
    chapters: [
      { time: 0, label: '01. Apresentação' },
      { time: 10, label: '02. Agitação & Preparo' },
      { time: 22, label: '03. Aplicação em Superfície' },
      { time: 38, label: '04. Película Impermeável' },
      { time: 50, label: '05. Resultado Final' },
    ],
  },
  highlights: [
    'É à base de borracha líquida sintética monocomponente em aerossol.',
    'Indicado para aplicação rápida em telhas, calhas, rufos, canos PVC, fissuras e lajes.',
    'Rendimento de até 15 metros lineares em trincas por lata (até 45m no kit).',
    'Secagem ao toque entre 20 e 35 minutos. Cura total em 24 horas.',
    'Resistente a intempéries, raios UV e não resseca com o tempo.',
    'Aceita pintura com tintas acrílicas ou à base de látex após secagem.',
  ],
  characteristics: [
    { label: 'Marca', value: 'Dryko' },
    { label: 'Linha', value: 'Vedatudo' },
    { label: 'Modelo', value: 'Spray Borracha Líquida Impermeabilizante' },
    { label: 'Formato de venda', value: 'Kit' },
    { label: 'Unidades por kit', value: '3' },
    { label: 'Volume da unidade', value: '400 mL' },
    { label: 'Peso líquido', value: '300 g por unidade' },
    { label: 'Tipo de base', value: 'Borracha sintética elastomérica' },
    { label: 'Superfícies aptas', value: 'Concreto, fibrocimento, cerâmica, calhas metálicas, PVC, madeira, rufos' },
    { label: 'Tempo de secagem entre demãos', value: '20 a 35 minutos' },
    { label: 'Cura total', value: '24 horas' },
    { label: 'Rendimento linear', value: 'Até 15 metros lineares por lata' },
    { label: 'Inflamável', value: 'Sim' },
    { label: 'Resistente a UV', value: 'Sim' },
  ],
  description: `KIT 3 UNIDADES - SPRAY BORRACHA LÍQUIDA VEDATUDO DRYKO 400ML BRANCO

PRODUTO NOVO, ORIGINAL DRYKO | ENVIO RÁPIDO PELO MERCADO ENVIOS FULL | NOTA FISCAL INCLUSA

O Spray Borracha Líquida Dryko Vedatudo é uma solução de alta performance desenvolvida para vedação e impermeabilização rápida de trincas, furos, goteiras e vazamentos residenciais e industriais. Sua fórmula aerossol inovadora penetra em locais de difícil acesso, formando uma película emborrachada contínua, 100% flexível e estanque.

Após a secagem completa, o produto suporta dilatações térmicas sem trincar ou esfarelar, sendo altamente resistente a chuva, sol intenso e variações bruscas de temperatura.

VANTAGENS DO VEDATUDO SPRAY DRYKO:
• Aplicação rápida, prática e sem necessidade de ferramentas especiais;
• Alto poder de aderência em múltiplos substratos;
• Excelente resistência a intempéries e raios solares (UV);
• Não escorre em aplicações verticais;
• Aceita pintura após a cura com tintas à base de água ou látex/acrílicas;
• Produto anticorrosivo que protege contra ferrugem e umidade.

ONDE APLICAR:
- Calhas de zinco, PVC e alumínio;
- Telhas cerâmicas, de fibrocimento, metálicas e ecológicas;
- Rufos, claraboias, pingadeiras e calafetações de janelas;
- Emendas de tubulações de PVC ou metálicas pluviais;
- Fissuras em alvenaria e paredes externas;
- Lajes de pequenas dimensões e marquises.

MODO DE USAR:
1. Certifique-se de que o local esteja limpo, seco, livre de poeiras, óleos ou partes soltas.
2. Agite vigorosamente a lata por pelo menos 1 minuto antes de aplicar.
3. Posicione o bico a uma distância de 15 a 20 cm da superfície e borrife em camadas uniformes.
4. Para melhor resultado, aplique de 2 a 3 demãos cruzadas com intervalo de 20 a 30 minutos.
5. Aguarde 24 horas para o teste de estanqueidade ou aplicação de tinta decorativa.

DADOS TÉCNICOS:
- Conteúdo: 400ml / 300g por frasco (Total do kit: 1.200ml / 900g)
- Cor: Branco
- Validade: 24 meses a partir da data de fabricação.`,
  questions: [
    {
      id: 'q1',
      question: 'Pode ser aplicado em cano de PVC com água vazando no momento?',
      date: '28 de agosto',
      answer: 'Olá! Para garantir a máxima aderência e vedação perfeita, recomendamos fechar o registro e aplicar sobre a superfície limpa e seca. Após secar (24 horas) suporta água perfeitamente. Qualquer dúvida estamos à disposição! Atenciosamente, Dryko.',
      answerDate: '28 de agosto',
    },
    {
      id: 'q2',
      question: 'Consigo pintar por cima depois de seco para igualar a cor da parede?',
      date: '25 de agosto',
      answer: 'Olá! Sim, com certeza! O spray Dryko aceita muito bem tintas à base de água (látex e acrílica) após as 24 horas de cura total. Equipe Dryko.',
      answerDate: '25 de agosto',
    },
    {
      id: 'q3',
      question: 'Quantos metros rende o kit com as 3 latas?',
      date: '20 de agosto',
      answer: 'Olá! Cada lata de 400ml rende em média até 15 metros lineares em fissuras finas. O kit com 3 unidades atinge até 45 metros lineares. Aguardamos sua compra! Dryko Oficial.',
      answerDate: '20 de agosto',
    },
    {
      id: 'q4',
      question: 'Tem a pronta entrega no Full para envio imediato?',
      date: '18 de agosto',
      answer: 'Olá! Sim, temos estoque físico no galpão Full do Mercado Livre. Comprando agora é embalado e despachado imediatamente para chegar o mais rápido possível!',
      answerDate: '18 de agosto',
    },
  ] as QuestionItem[],
  reviews: [
    {
      id: 'r1',
      author: 'Carlos Alberto M.',
      date: '29 de ago. 2026',
      rating: 5,
      title: 'Excelente produto! Resolveu a goteira no telhado na hora',
      comment: 'Comprei para consertar uma fissura na calha e numa telha de fibrocimento que estava vazando no quarto. Apliquei 2 demãos e no dia seguinte choveu forte: vedação total! Secou muito rápido e o acabamento branco ficou discreto. Vale cada centavo.',
      verified: true,
      helpfulCount: 24,
      variation: 'Cor: Branco',
    },
    {
      id: 'r2',
      author: 'Juliana P. Silva',
      date: '24 de ago. 2026',
      rating: 5,
      title: 'Fácil demais de aplicar, muito prático',
      comment: 'Não faz bagunça nenhuma porque o spray direciona bem o jato. Vedei a junção da claraboia e um cano de descida de água da chuva. Recomendo muito esse kit com 3, rende bem e o preço sai bem mais em conta.',
      verified: true,
      helpfulCount: 16,
      variation: 'Cor: Branco',
    },
    {
      id: 'r3',
      author: 'Marcos Vinicius R.',
      date: '15 de ago. 2026',
      rating: 4,
      title: 'Muito bom impermeabilizante',
      comment: 'O produto é muito bom, forma uma borracha bem espessa e flexível. Dica: agitem muito bem antes de usar para sair homogêneo. Cobriu perfeitamente todas as fendas.',
      verified: true,
      helpfulCount: 9,
      variation: 'Cor: Branco',
    },
    {
      id: 'r4',
      author: 'Rodrigo Fontana',
      date: '08 de ago. 2026',
      rating: 5,
      title: 'Dryko nunca decepciona, entrega Full super rápida',
      comment: 'Chegou no dia seguinte pela manhã. Apliquei no rufo da laje e funcionou perfeitamente. Acabamento elástico que não racha no sol quente.',
      verified: true,
      helpfulCount: 11,
      variation: 'Cor: Branco',
    },
  ] as ReviewItem[],
  relatedProducts: [
    {
      id: 'MLB2663961773',
      title: 'Asfalto Pronto Tapa Buraco 25kg Ensacado - Frete Grátis',
      price: 166.22,
      originalPrice: 176.22,
      discount: '5% OFF',
      installments: 'em 10x R$ 16,62 sem juros',
      imageUrl: 'https://http2.mlstatic.com/D_Q_NP_2X_740870-MLB111181677510_052026-AB.webp',
      shipping: 'Frete grátis',
      rating: 4.8,
      reviewsCount: 128,
      isFull: true,
      highlight: 'MAIS VENDIDO',
    },
    {
      id: 'MLB513319148',
      title: 'Fita Asfáltica Autoadesiva Aluminizado 10cm X 10m Vedacit Cor Alumínio',
      price: 19.68,
      originalPrice: 24.60,
      discount: '20% OFF',
      installments: 'em 3x R$ 6,56 sem juros',
      imageUrl: 'https://http2.mlstatic.com/D_Q_NP_2X_671236-MLA99512136991_112025-AB.webp',
      shipping: 'Frete grátis',
      rating: 4.9,
      reviewsCount: 312,
      isFull: true,
      highlight: 'MAIS VENDIDO',
    },
    {
      id: 'MLB6138137906',
      title: 'Manta Líquida Flexível Contra Infiltração Resiflex 18kg',
      price: 233.90,
      originalPrice: 350.00,
      discount: '33% OFF',
      installments: 'em 12x R$ 19,49 sem juros',
      imageUrl: 'https://http2.mlstatic.com/D_Q_NP_2X_668719-MLB103365161582_012026-AB.webp',
      shipping: 'Frete grátis',
      rating: 4.7,
      reviewsCount: 94,
      isFull: true,
    },
    {
      id: 'MLB4831429739',
      title: 'Veda Trinca Pó Reparador Rachaduras Stop Trincas 700g',
      price: 83.90,
      originalPrice: 99.90,
      discount: '16% OFF',
      installments: 'em 4x R$ 20,97 sem juros',
      imageUrl: 'https://http2.mlstatic.com/D_Q_NP_2X_972600-MLB113951754463_062026-AB.webp',
      shipping: 'Frete grátis',
      rating: 4.6,
      reviewsCount: 65,
      isFull: true,
      highlight: 'OFERTA DO DIA',
    },
  ] as RelatedProduct[],
};
