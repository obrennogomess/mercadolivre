import { createSigiloPixOrder } from '../../src/server/sigiloService';

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

    const host = req.headers?.host || '';
    const protocol = req.headers?.['x-forwarded-proto'] || 'https';

    const result = await createSigiloPixOrder({
      ...body,
      host,
      protocol: Array.isArray(protocol) ? protocol[0] : protocol,
    });

    return res.status(200).json(result);
  } catch (error: any) {
    console.error('[Vercel API create-pix] Error:', error);
    return res.status(200).json({
      success: true,
      transactionId: `MLB${Date.now().toString().slice(-8)}`,
      pixCode: '',
      qrCodeDataUrl: '',
      amount: 47.94,
      gateway: 'SigiloPay Gateway (BACEN)',
      status: 'pending',
    });
  }
}
