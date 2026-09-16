/**
 * Native Mercado Livre Checkout & SigiloPay Gateway Integration
 * All purchases are handled directly through the native Mercado Livre checkout flow.
 */

export interface CreatePixPayload {
  amount: number;
  buyerName: string;
  buyerEmail: string;
  buyerCpf: string;
  buyerPhone: string;
  color: string;
  quantity: number;
}

export interface PixResponse {
  success: boolean;
  transactionId: string;
  pixCode: string;
  qrCodeDataUrl: string;
  amount: number;
  expiresAt: string;
  gateway: string;
}

/**
 * Creates a Pix charge through SigiloPay via backend API route
 */
export async function createSigiloPayCharge(payload: CreatePixPayload): Promise<PixResponse> {
  const response = await fetch('/api/sigilopay/create-pix', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error('Falha ao processar pagamento via SigiloPay');
  }

  return response.json();
}
