import { transactionStore } from '../../src/server/sigiloService';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    let event = req.body;
    if (typeof event === 'string') {
      try {
        event = JSON.parse(event);
      } catch {
        event = {};
      }
    }

    console.log('[Vercel SigiloPay Webhook] Evento recebido:', JSON.stringify(event));

    const txId =
      event.transaction?.clientIdentifier ||
      event.transaction?.id ||
      event.clientIdentifier ||
      event.external_id ||
      event.transaction_id ||
      event.id;

    const isPaid =
      event.event === 'TRANSACTION_PAID' ||
      event.transaction?.status === 'COMPLETED' ||
      event.status === 'COMPLETED' ||
      event.status === 'paid' ||
      event.status === 'approved';

    if (txId && transactionStore.has(txId)) {
      const tx = transactionStore.get(txId)!;
      if (isPaid) {
        tx.status = 'approved';
        console.log(`[Vercel Webhook] Transação ${txId} APROVADA!`);
      }
    }

    return res.status(200).json({ received: true, success: true });
  } catch (error) {
    console.error('[Vercel Webhook Error]:', error);
    return res.status(200).json({ received: true });
  }
}
