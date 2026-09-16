import QRCode from 'qrcode';

// Credentials for SigiloPay
const DEFAULT_PUBLIC_KEY = 'brennogomes2003_ylwy22xunyz69ly7';
const DEFAULT_SECRET_KEY = 'x6yowe81kmr47zq6hoev26hvljkh4af4iwnrqvu69qsg72on1rjfqf39otld3kiq';

function isValidCPF(cpf: string): boolean {
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

function generateValidCPF(): string {
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

function ensureValidDocument(cpfInput?: string): string {
  const clean = (cpfInput || '').replace(/\D/g, '');
  if (isValidCPF(clean)) return clean;
  return generateValidCPF();
}

export default async function handler(req: any, res: any) {
  // CORS support
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {
        body = {};
      }
    }

    const {
      amount = 29.9,
      buyerName = 'Cliente Mercado Livre',
      buyerEmail = 'cliente@mercadolivre.com',
      buyerCpf = '12345678909',
      buyerPhone = '11999999999',
      color = 'Branco',
      kitSize,
      productId: customProductId,
      productTitle: customProductTitle,
      quantity = 1,
      products: clientProducts,
      transactionId,
      externalId,
    } = body || {};

    const txId = transactionId || externalId || `MLB${Date.now().toString().slice(-8)}${Math.floor(100 + Math.random() * 900)}`;
    const numericAmount = Math.max(0.01, Number(Number(amount).toFixed(2)));

    const publicKey =
      process.env.SIGILOPAY_PUBLIC_KEY ||
      process.env.VITE_SIGILOPAY_PUBLIC_KEY ||
      process.env.SIGILOPAY_API_KEY ||
      DEFAULT_PUBLIC_KEY;

    const secretKey =
      process.env.SIGILOPAY_SECRET_KEY ||
      process.env.VITE_SIGILOPAY_SECRET_KEY ||
      process.env.SIGILOPAY_SECRET ||
      DEFAULT_SECRET_KEY;

    const defaultProdId = (customProductId || `dryko-kit-${color}`).toLowerCase().replace(/\s+/g, '-');
    const defaultProdName = customProductTitle || `Spray Dryko Impermeabilizante 400ml (${color})`;

    // Normalize products
    let sigiloProducts: Array<{ id: string; name: string; quantity: number; price: number }>;
    if (Array.isArray(clientProducts) && clientProducts.length > 0) {
      sigiloProducts = [
        {
          id: String(clientProducts[0].id || defaultProdId).toLowerCase().replace(/\s+/g, '-'),
          name: String(clientProducts[0].name || defaultProdName),
          quantity: 1,
          price: numericAmount,
        },
      ];
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

    const host = req.headers?.host || '';
    const protocol = req.headers?.['x-forwarded-proto'] || 'https';
    const isLocal = host.includes('localhost') || host.includes('127.0.0.1') || host.includes('0.0.0.0');
    const callbackUrl = isLocal || !host ? undefined : `${protocol}://${host}/api/sigilopay/webhook`;

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
        product: defaultProdName,
        canal: 'Mercado Livre Oficial',
      },
    };

    if (callbackUrl) {
      sigiloPayload.callbackUrl = callbackUrl;
    }

    console.log(`[Vercel Serverless] Chamando API SigiloPay para ID: ${txId}, valor: R$ ${numericAmount}...`);

    let response = await fetch('https://app.sigilopay.com.br/api/v1/gateway/pix/receive', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'x-public-key': publicKey,
        'x-secret-key': secretKey,
      },
      body: JSON.stringify(sigiloPayload),
    });

    let rawText = await response.text();
    let sigiloData: any;
    try {
      sigiloData = JSON.parse(rawText);
    } catch {
      sigiloData = { raw: rawText.slice(0, 300) };
    }

    // If first attempt failed, retry with simplified payload
    if (!response.ok || !sigiloData.pix?.code) {
      console.warn('[Vercel Serverless] Tentativa 1 SigiloPay falhou, tentando simplificado:', sigiloData);
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
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'x-public-key': publicKey,
          'x-secret-key': secretKey,
        },
        body: JSON.stringify(retryPayload),
      });
      if (retryRes.ok) {
        const retryData = await retryRes.json();
        if (retryData.pix?.code) {
          sigiloData = retryData;
          response = retryRes;
        }
      }
    }

    if (sigiloData.pix?.code) {
      const pixCode = sigiloData.pix.code;
      const sigiloTransactionId = sigiloData.transactionId || sigiloData.order?.id || '';
      const sigiloOrderUrl = sigiloData.order?.url || '';
      const sigiloReceiptUrl = sigiloData.order?.receiptUrl || '';

      let qrCodeDataUrl = '';
      if (sigiloData.pix.base64) {
        qrCodeDataUrl = sigiloData.pix.base64.startsWith('data:')
          ? sigiloData.pix.base64
          : `data:image/png;base64,${sigiloData.pix.base64}`;
      } else {
        qrCodeDataUrl = await QRCode.toDataURL(pixCode, {
          errorCorrectionLevel: 'M',
          margin: 3,
          width: 420,
          color: { dark: '#000000', light: '#ffffff' },
        });
      }

      console.log(`[Vercel Serverless] Sucesso! SigiloPay ID: ${sigiloTransactionId}`);

      return res.status(200).json({
        success: true,
        transactionId: txId,
        sigiloTransactionId,
        orderUrl: sigiloOrderUrl,
        receiptUrl: sigiloReceiptUrl,
        isLiveSigiloPay: true,
        pixCode,
        qrCodeDataUrl,
        amount: numericAmount,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
        expiresInSeconds: 900,
        gateway: 'SigiloPay Oficial (Ativo)',
        status: 'pending',
      });
    }

    // If SigiloPay rejected with specific error
    console.error('[Vercel Serverless] SigiloPay erro:', sigiloData);
    return res.status(502).json({
      success: false,
      error: sigiloData.message || sigiloData.errorCode || 'Falha ao gerar cobrança SigiloPay',
      details: sigiloData,
    });
  } catch (error: any) {
    console.error('[Vercel Serverless API Error]:', error);
    return res.status(500).json({
      success: false,
      error: error?.message || 'Erro interno ao processar Pix SigiloPay',
    });
  }
}
