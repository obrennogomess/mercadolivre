import { checkSigiloStatus } from '../../../src/server/sigiloService';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const id = (req.query?.id || req.url?.split('/').pop()?.split('?')[0] || '') as string;
  const force = req.query?.force === 'true';

  if (!id) {
    return res.status(400).json({ success: false, message: 'ID da transação não fornecido' });
  }

  const result = await checkSigiloStatus(id, force);
  return res.status(200).json(result);
}
