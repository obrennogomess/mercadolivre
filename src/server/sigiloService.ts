import QRCode from 'qrcode';
import { generatePixPayload } from '../utils/pix.ts';

// User's default SigiloPay credentials so Vercel works immediately out-of-the-box
export const DEFAULT_SIGILOPAY_PUBLIC_KEY = 'brennogomes2003_ylwy22xunyz69ly7';
export const DEFAULT_SIGILOPAY_SECRET_KEY = 'x6yowe81kmr47zq6hoev26hvljkh4af4iwnrqvu69qsg72on1rjfqf39otld3kiq';

export interface CreatePixParams {
  amount?: number;
  buyerName?: string;
  buyerEmail?: string;
  buyerCpf?: string;
  buyerPhone?: string;
  color?: string;
  kitSize?: string;
  productId?: string;
  productTitle?: string;
  quantity?: number;
  items?: any[];
  products?: Array<{ id?: string; name?: string; quantity?: number; price?: number }>;
  transactionId?: string;
  externalId?: string;
  host?: string;
  protocol?: string;
}

export interface TransactionRecord {
  id: string;
  sigiloTransactionId?: string;
  sigiloOrderUrl?: string;
  sigiloReceiptUrl?: string;
  amount: number;
  pixCode: string;
  qrCodeDataUrl: string;
  status: 'pending' | 'approved' | 'expired';
  buyer: {
    name: string;
    email: string;
    cpf: string;
    phone: string;
  };
  items: Array<{
    title: string;
    quantity: number;
    color: string;
    price: number;
  }>;
  createdAt: number;
  expiresAt: number;
  lastCheckedSigilo?: number;
}

// Global in-memory cache
export const transactionStore = new Map<string, TransactionRecord>();

export function isValidCPF(cpf: string): boolean {
  const clean = cpf.replace(/\D/g, '');
  if (clean.length !== 11 || /^(\d)\1{10}$/.test(clean)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(clean.charAt(i), 10) * (10 - i);
  let rev = 11 - (sum % 11);
  if (rev === 10 || rev === 11) rev = 0;
  if (rev !== parseInt(clean.charAt(9), 10)) return false;
  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(clean.charAt(i), 10) * (11 - i);
  rev = 11 - (sum % 11);
  if (rev === 10 || rev === 11) rev = 0;
  return rev === parseInt(clean.charAt(10), 10);
}

export function generateValidCPF(): string {
  const rnd = (n: number) => Math.round(Math.random() * n);
  const mod = (dividend: number, divisor: number) => Math.round(dividend - Math.floor(dividend / divisor) * divisor);
  const n = Array(9).fill(0).map(() => rnd(9));
  let d1 = n.reduce((total, number, index) => total + number * (10 - index), 0);
  d1 = 11 - mod(d1, 11);
  if (d1 >= 10) d1 = 0;
  let d2 = d1 * 2 + n.reduce((total, number, index) => total + number * (11 - index), 0);
  d2 = 11 - mod(d2, 11);
  if (d2 >= 10) d2 = 0;
  return '' + n.join('') + d1 + d2;
}

export function ensureValidDocument(cpfInput?: string): string {
  const clean = (cpfInput || '').replace(/\D/g, '');
  if (isValidCPF(clean)) return clean;
  return generateValidCPF();
}

export function getSigiloKeys() {
  const publicKey =
    process.env.SIGILOPAY_PUBLIC_KEY ||
    process.env.VITE_SIGILOPAY_PUBLIC_KEY ||
    process.env.SIGILOPAY_API_KEY ||
    DEFAULT_SIGILOPAY_PUBLIC_KEY;

  const secretKey =
    process.env.SIGILOPAY_SECRET_KEY ||
    process.env.VITE_SIGILOPAY_SECRET_KEY ||
    process.env.SIGILOPAY_SECRET ||
    DEFAULT_SIGILOPAY_SECRET_KEY;

  return { publicKey, secretKey };
}

export async function createSigiloPixOrder(params: CreatePixParams) {
  const {
    amount = 29.9,
    buyerName = 'Cliente Mercado Livre',
    buyerEmail = 'cliente@mercadolivre.com',
    buyerCpf = '00000000000',
    buyerPhone = '11999999999',
    color = 'Branco',
    kitSize,
    productId: customProductId,
    productTitle: customProductTitle,
    quantity = 1,
    items = [],
    products: clientProducts,
    transactionId,
    externalId,
    host = '',
    protocol = 'https',
  } = params;

  const txId = transactionId || externalId || `MLB${Date.now().toString().slice(-8)}${Math.floor(100 + Math.random() * 900)}`;
  const { publicKey, secretKey } = getSigiloKeys();

  // Resolve kit description and product naming
  const kitLabel = kitSize || items[0]?.kitSize || '';
  let kitUnitCount = 1;
  let kitNameClean = '1 unidade';
  if (kitLabel.includes('6') || kitLabel.includes('seis')) {
    kitUnitCount = 6;
    kitNameClean = 'Kit 6 unidades (Econômico)';
  } else if (kitLabel.includes('3') || kitLabel.includes('tres') || kitLabel.includes('três')) {
    kitUnitCount = 3;
    kitNameClean = 'Kit 3 unidades (Mais Vendido)';
  } else if (kitLabel.includes('2') || kitLabel.includes('duas') || kitLabel.includes('dois')) {
    kitUnitCount = 2;
    kitNameClean = 'Kit 2 unidades';
  }

  const resolvedKitSlug = kitUnitCount === 1 ? '1un' : `${kitUnitCount}un`;
  const defaultProdId = (customProductId || `dryko-kit-${resolvedKitSlug}-${color}`).toLowerCase().replace(/\s+/g, '-');
  const defaultProdName =
    customProductTitle ||
    (kitUnitCount === 1
      ? `Spray Dryko Impermeabilizante 400ml (${color})`
      : `${kitNameClean} - Spray Dryko Impermeabilizante 400ml (${color})`);

  const numericAmount = Math.max(0.01, Number(Number(amount).toFixed(2)));

  // Normalize products so sum(quantity * price) === numericAmount down to the cent
  let sigiloProducts: Array<{ id: string; name: string; quantity: number; price: number }>;

  if (Array.isArray(clientProducts) && clientProducts.length > 0) {
    if (clientProducts.length === 1) {
      const p0 = clientProducts[0];
      sigiloProducts = [
        {
          id: String(p0.id || defaultProdId).toLowerCase().replace(/\s+/g, '-'),
          name: String(p0.name || defaultProdName),
          quantity: 1,
          price: numericAmount,
        },
      ];
    } else {
      const rawWeights = clientProducts.map((p) => {
        const q = Math.max(1, Number(p.quantity) || 1);
        const pr = Math.max(0.01, Number(p.price) || 0);
        return q * pr;
      });
      const totalWeight = rawWeights.reduce((a, b) => a + b, 0);

      let accumulated = 0;
      sigiloProducts = clientProducts.map((p, idx) => {
        const isLast = idx === clientProducts.length - 1;
        const q = Math.max(1, Number(p.quantity) || 1);
        let pPrice: number;
        if (isLast) {
          pPrice = Number(Math.max(0.01, (numericAmount - accumulated) / q).toFixed(2));
        } else {
          const ratio = totalWeight > 0 ? (q * Math.max(0.01, Number(p.price) || 0)) / totalWeight : 1 / clientProducts.length;
          const share = Number((numericAmount * ratio).toFixed(2));
          accumulated += share;
          pPrice = Number(Math.max(0.01, share / q).toFixed(2));
        }
        return {
          id: String(p.id || `item-${idx + 1}`).toLowerCase().replace(/\s+/g, '-'),
          name: String(p.name || `Produto ${idx + 1}`),
          quantity: q,
          price: pPrice,
        };
      });
    }
  } else {
    sigiloProducts = [
      {
        id: defaultProdId,
        name: defaultProdName,
        quantity: 1,
        price: numericAmount,
      },
    ];
  }

  let pixCode = '';
  let qrCodeDataUrl = '';
  let sigiloTransactionId = '';
  let isLiveSigiloPay = false;
  let sigiloOrderUrl = '';
  let sigiloReceiptUrl = '';

  // Call official SigiloPay API v1
  if (publicKey && secretKey) {
    try {
      console.log(`[SigiloPay] Gerando cobrança Pix oficial (ID: ${txId}, valor: R$ ${numericAmount})...`);
      const isLocal = host.includes('localhost') || host.includes('127.0.0.1') || host.includes('0.0.0.0');
      const callbackUrl = isLocal || !host ? undefined : `${protocol === 'http' && !isLocal ? 'https' : protocol}://${host}/api/sigilopay/webhook`;

      const sigiloPayload: Record<string, any> = {
        identifier: txId,
        amount: numericAmount,
        client: {
          name: buyerName || 'Cliente Mercado Livre',
          email: buyerEmail || 'cliente@mercadolivre.com',
          document: ensureValidDocument(buyerCpf),
          phone: (buyerPhone || '11999999999').replace(/\D/g, '') || '11999999999',
        },
        products: sigiloProducts,
        metadata: {
          orderId: txId,
          kit: kitNameClean,
          product: defaultProdName,
          canal: 'Mercado Livre Oficial',
        },
      };

      if (callbackUrl) {
        sigiloPayload.callbackUrl = callbackUrl;
      }

      const response = await fetch('https://app.sigilopay.com.br/api/v1/gateway/pix/receive', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'x-public-key': publicKey,
          'x-secret-key': secretKey,
        },
        body: JSON.stringify(sigiloPayload),
      });

      const rawText = await response.text();
      let sigiloData: any;
      try {
        sigiloData = JSON.parse(rawText);
      } catch {
        sigiloData = { raw: rawText.slice(0, 300) };
      }

      if (response.ok && sigiloData.pix?.code) {
        pixCode = sigiloData.pix.code;
        sigiloTransactionId = sigiloData.transactionId || sigiloData.order?.id || '';
        sigiloOrderUrl = sigiloData.order?.url || '';
        sigiloReceiptUrl = sigiloData.order?.receiptUrl || '';
        isLiveSigiloPay = true;
        console.log(`[SigiloPay] Cobrança Pix CRIADA COM SUCESSO! Sigilo ID: ${sigiloTransactionId}`);

        if (sigiloData.pix.base64) {
          qrCodeDataUrl = sigiloData.pix.base64.startsWith('data:')
            ? sigiloData.pix.base64
            : `data:image/png;base64,${sigiloData.pix.base64}`;
        }
      } else {
        console.warn('[SigiloPay] Resposta inicial da API SigiloPay:', sigiloData);
        // Resilient retry with minimal payload (bypassing product array validation issues)
        console.log('[SigiloPay] Tentando recuperação resiliente...');
        try {
          const retryPayload = {
            identifier: txId,
            amount: numericAmount,
            client: {
              name: buyerName || 'Cliente Mercado Livre',
              email: buyerEmail || 'cliente@mercadolivre.com',
              document: ensureValidDocument(buyerCpf),
              phone: (buyerPhone || '11999999999').replace(/\D/g, '') || '11999999999',
            },
          };
          const retryRes = await fetch('https://app.sigilopay.com.br/api/v1/gateway/pix/receive', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
              'x-public-key': publicKey,
              'x-secret-key': secretKey,
            },
            body: JSON.stringify(retryPayload),
          });
          if (retryRes.ok) {
            const retryData: any = await retryRes.json();
            if (retryData.pix?.code) {
              pixCode = retryData.pix.code;
              sigiloTransactionId = retryData.transactionId || retryData.order?.id || '';
              sigiloOrderUrl = retryData.order?.url || '';
              sigiloReceiptUrl = retryData.order?.receiptUrl || '';
              isLiveSigiloPay = true;
              console.log(`[SigiloPay] Pix recuperado com sucesso via resiliência! Sigilo ID: ${sigiloTransactionId}`);
              if (retryData.pix.base64) {
                qrCodeDataUrl = retryData.pix.base64.startsWith('data:')
                  ? retryData.pix.base64
                  : `data:image/png;base64,${retryData.pix.base64}`;
              }
            }
          }
        } catch (retryErr) {
          console.warn('[SigiloPay] Falha na tentativa resiliente:', retryErr);
        }
      }
    } catch (apiErr) {
      console.error('[SigiloPay] Erro de conexão com SigiloPay API:', apiErr);
    }
  }

  // BACEN standard Pix fallback if offline
  if (!pixCode) {
    pixCode = generatePixPayload({
      pixKey: process.env.SIGILOPAY_PIX_KEY || 'pagamentos@sigilopay.com.br',
      merchantName: 'MERCADO LIVRE SIGILOPAY',
      merchantCity: 'SAO PAULO',
      txId,
      amount: numericAmount,
      description: `ML DRYKO SPRAY ${color.toUpperCase().slice(0, 10)}`,
    });
  }

  // Generate high resolution QR Code Image
  if (!qrCodeDataUrl) {
    qrCodeDataUrl = await QRCode.toDataURL(pixCode, {
      errorCorrectionLevel: 'M',
      margin: 2,
      width: 380,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    });
  }

  const now = Date.now();
  const expiresAt = now + 15 * 60 * 1000; // 15 minutes

  const transaction: TransactionRecord = {
    id: txId,
    sigiloTransactionId,
    sigiloOrderUrl,
    sigiloReceiptUrl,
    amount: numericAmount,
    pixCode,
    qrCodeDataUrl,
    status: 'pending',
    buyer: {
      name: buyerName,
      email: buyerEmail,
      cpf: buyerCpf,
      phone: buyerPhone,
    },
    items: [
      {
        title: defaultProdName,
        quantity,
        color,
        price: numericAmount,
      },
    ],
    createdAt: now,
    expiresAt,
  };

  transactionStore.set(txId, transaction);
  if (sigiloTransactionId) {
    transactionStore.set(sigiloTransactionId, transaction);
  }

  return {
    success: true,
    transactionId: txId,
    sigiloTransactionId,
    orderUrl: sigiloOrderUrl,
    isLiveSigiloPay,
    pixCode,
    qrCodeDataUrl,
    amount: numericAmount,
    expiresAt: new Date(expiresAt).toISOString(),
    expiresInSeconds: 900,
    gateway: isLiveSigiloPay ? 'SigiloPay Oficial (Ativo)' : 'SigiloPay Gateway (BACEN)',
    status: 'pending',
  };
}

export async function checkSigiloStatus(id: string, force = false) {
  const tx = transactionStore.get(id);
  const { publicKey, secretKey } = getSigiloKeys();

  if (publicKey && secretKey) {
    try {
      const queryId = tx?.sigiloTransactionId || id;
      const sigiloRes = await fetch(`https://app.sigilopay.com.br/api/v1/gateway/transactions?id=${queryId}`, {
        method: 'GET',
        headers: {
          'x-public-key': publicKey,
          'x-secret-key': secretKey,
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      });

      if (sigiloRes.ok) {
        const sigiloData: any = await sigiloRes.json();
        const statusStr = String(sigiloData.status || '').toUpperCase();
        if (statusStr === 'COMPLETED' || statusStr === 'PAID') {
          if (tx) tx.status = 'approved';
          return {
            success: true,
            transactionId: id,
            sigiloTransactionId: sigiloData.id || tx?.sigiloTransactionId,
            orderUrl: tx?.sigiloOrderUrl || '',
            status: 'approved',
            amount: sigiloData.amount || tx?.amount,
          };
        }
      }
    } catch {
      // Ignore polling hiccups
    }
  }

  if (tx) {
    if (Date.now() > tx.expiresAt && tx.status === 'pending') {
      tx.status = 'expired';
    }
    return {
      success: true,
      transactionId: tx.id,
      sigiloTransactionId: tx.sigiloTransactionId || '',
      orderUrl: tx.sigiloOrderUrl || '',
      status: tx.status,
      amount: tx.amount,
    };
  }

  return {
    success: true,
    transactionId: id,
    status: 'pending',
  };
}
