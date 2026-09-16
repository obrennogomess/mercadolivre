const DEFAULT_PUBLIC_KEY = 'brennogomes2003_ylwy22xunyz69ly7';
const DEFAULT_SECRET_KEY = 'x6yowe81kmr47zq6hoev26hvljkh4af4iwnrqvu69qsg72on1rjfqf39otld3kiq';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const id = (req.query?.id || req.url?.split('/').pop()?.split('?')[0] || '') as string;

  if (!id) {
    return res.status(400).json({ success: false, message: 'ID da transação não fornecido' });
  }

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

  try {
    const sigiloRes = await fetch(`https://app.sigilopay.com.br/api/v1/gateway/transactions?id=${id}`, {
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
      const isPaid = statusStr === 'COMPLETED' || statusStr === 'PAID';

      return res.status(200).json({
        success: true,
        transactionId: id,
        sigiloTransactionId: sigiloData.id || id,
        status: isPaid ? 'approved' : statusStr.toLowerCase() || 'pending',
        amount: sigiloData.amount,
      });
    }
  } catch (err: any) {
    console.warn('[Vercel Status Check] Erro ao consultar SigiloPay:', err);
  }

  return res.status(200).json({
    success: true,
    transactionId: id,
    status: 'pending',
  });
}
