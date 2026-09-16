import { getSigiloKeys } from '../src/server/sigiloService';

export default function handler(req: any, res: any) {
  const { publicKey, secretKey } = getSigiloKeys();
  return res.status(200).json({
    status: 'ok',
    platform: 'vercel',
    gateway: 'sigilopay',
    hasCredentials: Boolean(publicKey && secretKey),
    timestamp: new Date().toISOString(),
  });
}
