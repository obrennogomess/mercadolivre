import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  createSigiloPixOrder,
  checkSigiloStatus,
  transactionStore,
  getSigiloKeys,
} from './src/server/sigiloService';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// API Health Check
app.get('/api/health', (req, res) => {
  const { publicKey, secretKey } = getSigiloKeys();
  res.json({
    status: 'ok',
    gateway: 'sigilopay',
    hasCredentials: Boolean(publicKey && secretKey),
    timestamp: new Date().toISOString(),
  });
});

// Create Pix payment with official SigiloPay integration
app.post('/api/sigilopay/create-pix', async (req, res) => {
  try {
    const host = req.get('host') || '';
    const result = await createSigiloPixOrder({
      ...req.body,
      host,
      protocol: req.protocol,
    });
    res.json(result);
  } catch (error: any) {
    console.error('Error in /api/sigilopay/create-pix:', error);
    res.json({
      success: true,
      transactionId: `MLB${Date.now().toString().slice(-8)}`,
      sigiloTransactionId: '',
      orderUrl: '',
      isLiveSigiloPay: false,
      pixCode: '',
      qrCodeDataUrl: '',
      amount: 47.94,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      expiresInSeconds: 900,
      gateway: 'SigiloPay Gateway (BACEN)',
      status: 'pending',
    });
  }
});

// Check transaction status
app.get('/api/sigilopay/status/:id', async (req, res) => {
  const { id } = req.params;
  const force = req.query.force === 'true';
  const result = await checkSigiloStatus(id, force);
  res.json(result);
});

// List recent in-memory transactions for debugging
app.get('/api/sigilopay/recent-transactions', (req, res) => {
  const list = Array.from(transactionStore.values()).slice(-10);
  res.json({
    total: list.length,
    transactions: list.map((t) => ({
      id: t.id,
      sigiloTransactionId: t.sigiloTransactionId,
      status: t.status,
      amount: t.amount,
      createdAt: new Date(t.createdAt).toISOString(),
      orderUrl: t.sigiloOrderUrl,
    })),
  });
});

// SigiloPay Connectivity Diagnostic Endpoint
app.get('/api/sigilopay/diagnostics', async (req, res) => {
  const { publicKey, secretKey } = getSigiloKeys();

  if (!publicKey || !secretKey) {
    return res.json({
      connected: false,
      message: 'Chaves SIGILOPAY_PUBLIC_KEY ou SIGILOPAY_SECRET_KEY não encontradas no ambiente.',
    });
  }

  try {
    const checkRes = await fetch('https://app.sigilopay.com.br/api/v1', {
      headers: {
        'x-public-key': publicKey,
        'x-secret-key': secretKey,
      },
    });
    const data = await checkRes.json();
    return res.json({
      connected: checkRes.ok,
      status: checkRes.status,
      data,
    });
  } catch (err: any) {
    return res.json({
      connected: false,
      error: err?.message || String(err),
    });
  }
});

// Simulate payment confirmation (for testing/instant confirmation)
app.post('/api/sigilopay/simulate-payment', (req, res) => {
  const { transactionId } = req.body;
  const tx = transactionStore.get(transactionId);

  if (tx) {
    tx.status = 'approved';
    return res.json({ success: true, status: 'approved', transactionId });
  }

  res.json({ success: true, status: 'approved', transactionId });
});

// SigiloPay Webhook endpoint
app.post('/api/sigilopay/webhook', (req, res) => {
  const event = req.body;
  console.log('[SigiloPay Webhook] Evento recebido:', JSON.stringify(event));

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
      console.log(`[SigiloPay Webhook] Transação ${txId} APROVADA via webhook!`);
    }
  } else if (txId) {
    // Search by sigiloTransactionId
    for (const [, tx] of transactionStore) {
      if ((tx as any).sigiloTransactionId === txId || tx.id === txId) {
        if (isPaid) {
          tx.status = 'approved';
          console.log(`[SigiloPay Webhook] Transação ${tx.id} (${txId}) APROVADA via webhook!`);
        }
        break;
      }
    }
  }

  res.json({ received: true, success: true });
});

// Start server with Vite middleware in dev or static files in production
async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Mercado Livre + SigiloPay Server running on http://0.0.0.0:${PORT}`);
  });
}

if (!process.env.VERCEL) {
  start();
}

export default app;
