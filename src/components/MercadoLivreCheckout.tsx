import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Lock,
  Truck,
  Zap,
  Copy,
  CheckCircle2,
  ArrowLeft,
  Clock,
  QrCode,
  X,
  AlertCircle,
  HelpCircle,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import QRCode from 'qrcode';
import { ProductVariation, getKitDetails } from '../data/productData';
import { generatePixPayload } from '../utils/pix';

export interface CheckoutItem {
  variation: ProductVariation;
  quantity: number;
  kitSize?: string;
}

export const getItemPrice = (item: CheckoutItem): number => {
  const kit = getKitDetails(item.kitSize);
  const isSingle = !item.kitSize || item.kitSize.includes('1 unidade');
  if (isSingle) {
    return item.variation.price * item.quantity;
  }
  if (item.quantity === kit.units || item.quantity === 1) {
    return kit.price;
  }
  const multiplier = item.quantity > kit.units ? Math.ceil(item.quantity / kit.units) : item.quantity;
  return Number((kit.price * multiplier).toFixed(2));
};

export const getItemOriginalPrice = (item: CheckoutItem): number => {
  const kit = getKitDetails(item.kitSize);
  const isSingle = !item.kitSize || item.kitSize.includes('1 unidade');
  if (isSingle) {
    return item.variation.originalPrice * item.quantity;
  }
  if (item.quantity === kit.units || item.quantity === 1) {
    return kit.originalPrice;
  }
  const multiplier = item.quantity > kit.units ? Math.ceil(item.quantity / kit.units) : item.quantity;
  return Number((kit.originalPrice * multiplier).toFixed(2));
};

export const getItemTitle = (item: CheckoutItem): string => {
  const kit = getKitDetails(item.kitSize);
  const isSingle = !item.kitSize || item.kitSize.includes('1 unidade');
  if (isSingle) {
    return 'Spray Borracha Líquida Dryko Impermeabilizante 400ml';
  }
  return `${kit.label} - Spray Borracha Líquida Dryko 400ml`;
};

export interface MercadoLivreCheckoutProps {
  isOpen: boolean;
  onClose: () => void;
  items: CheckoutItem[];
  defaultCep?: string;
  onOrderCompleted?: (orderId: string) => void;
}

export const MercadoLivreCheckout: React.FC<MercadoLivreCheckoutProps> = ({
  isOpen,
  onClose,
  items,
  defaultCep = '01001-000',
  onOrderCompleted,
}) => {
  // Step navigation: 1 = Envio (Endereço), 2 = Pagamento, 3 = Pix / Confirmação
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Address and customer data
  const [cep, setCep] = useState<string>(defaultCep || '01001-000');
  const [street, setStreet] = useState<string>('Praça da Sé');
  const [number, setNumber] = useState<string>('100');
  const [complement, setComplement] = useState<string>('');
  const [neighborhood, setNeighborhood] = useState<string>('Sé');
  const [city, setCity] = useState<string>('São Paulo');
  const [stateCode, setStateCode] = useState<string>('SP');
  const [receiverName, setReceiverName] = useState<string>('Consumidor Mercado Livre');
  const [cpf, setCpf] = useState<string>('123.456.789-00');
  const [phone, setPhone] = useState<string>('(11) 98765-4321');
  const [email, setEmail] = useState<string>('comprador@gmail.com');
  const [deliveryOption, setDeliveryOption] = useState<'full' | 'pickup'>('full');
  const [loadingCep, setLoadingCep] = useState<boolean>(false);

  // Payment method (Pix only as requested)
  const paymentMethod = 'pix' as const;

  // Pix state (SigiloPay)
  const [pixLoading, setPixLoading] = useState<boolean>(false);
  const [pixCode, setPixCode] = useState<string>('');
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [orderId, setOrderId] = useState<string>('');
  const [sigiloTxId, setSigiloTxId] = useState<string>('');
  const [orderUrl, setOrderUrl] = useState<string>('');
  const [gatewayLabel, setGatewayLabel] = useState<string>('SigiloPay Gateway');
  const [isLiveSigilo, setIsLiveSigilo] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [secondsLeft, setSecondsLeft] = useState<number>(900); // 15 minutes
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'approved'>('pending');

  // Local mutable items for checkout so unit & quantity adjustments update totals in real-time
  const [checkoutItems, setCheckoutItems] = useState<CheckoutItem[]>(items);

  useEffect(() => {
    setCheckoutItems(items);
  }, [items]);

  const handleUpdateItemQuantity = (index: number, delta: number) => {
    setCheckoutItems((prev) => {
      const updated = [...prev];
      const current = updated[index];
      if (!current) return prev;
      const newQty = Math.max(1, current.quantity + delta);
      // Auto-synchronize kit if single or standard units
      let newKit = current.kitSize;
      if (newQty === 1) newKit = '1 unidade (400ml)';
      else if (newQty === 2) newKit = 'Kit 2 unidades';
      else if (newQty === 3) newKit = 'Kit 3 unidades (Mais vendido)';
      else if (newQty === 6) newKit = 'Kit 6 unidades (Econômico)';
      updated[index] = { ...current, quantity: newQty, kitSize: newKit };
      return updated;
    });
  };

  const handleSetItemKit = (index: number, kitLabel: string) => {
    setCheckoutItems((prev) => {
      const updated = [...prev];
      const current = updated[index];
      if (!current) return prev;
      let newQty = 1;
      if (kitLabel.includes('2')) newQty = 2;
      else if (kitLabel.includes('3')) newQty = 3;
      else if (kitLabel.includes('6')) newQty = 6;
      else newQty = 1;
      updated[index] = { ...current, kitSize: kitLabel, quantity: newQty };
      return updated;
    });
  };

  // Calculate totals using kit-aware pricing
  const subtotal = checkoutItems.reduce(
    (acc, item) => acc + getItemPrice(item),
    0
  );
  const originalSubtotal = checkoutItems.reduce(
    (acc, item) => acc + getItemOriginalPrice(item),
    0
  );
  const totalItemsCount = checkoutItems.reduce((acc, item) => {
    const kit = getKitDetails(item.kitSize);
    return acc + (item.kitSize?.includes('1 unidade') ? item.quantity : kit.units);
  }, 0);

  // Discount: 40% on Pix is already in unit price (R$ 29,90 vs R$ 49,90)
  const savings = Math.max(0, originalSubtotal - subtotal);
  const finalPrice = subtotal;

  // Initialize CEP and address lookup
  useEffect(() => {
    if (defaultCep && defaultCep.length >= 8) {
      handleLookupCep(defaultCep);
    }
  }, [defaultCep]);

  // Timer countdown for Pix
  useEffect(() => {
    let timer: any = null;
    if (step === 3 && paymentStatus === 'pending' && secondsLeft > 0) {
      timer = setInterval(() => {
        setSecondsLeft((prev) => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [step, paymentStatus, secondsLeft]);

  // Automatic real-time status check for SigiloPay
  useEffect(() => {
    let pollInterval: any = null;
    if (step === 3 && paymentStatus === 'pending' && orderId) {
      pollInterval = setInterval(async () => {
        try {
          const res = await fetch(`/api/sigilopay/status/${orderId}`);
          if (res.ok) {
            const data = await res.json();
            if (data.status === 'approved') {
              setPaymentStatus('approved');
              if (onOrderCompleted) {
                onOrderCompleted(orderId);
              }
            }
          }
        } catch {
          // ignore network polling hiccups
        }
      }, 3000);
    }

    return () => {
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [step, paymentStatus, orderId, onOrderCompleted]);

  // Cep auto-lookup via ViaCEP
  const handleLookupCep = async (targetCep: string) => {
    const clean = targetCep.replace(/\D/g, '');
    if (clean.length === 8) {
      setLoadingCep(true);
      try {
        const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
        const data = await res.json();
        if (!data.erro) {
          setStreet(data.logradouro || street);
          setNeighborhood(data.bairro || neighborhood);
          setCity(data.localidade || city);
          setStateCode(data.uf || stateCode);
        }
      } catch {
        // Fallback gracefully
      } finally {
        setLoadingCep(false);
      }
    }
  };

  // Generate Pix order with SigiloPay
  const handleGeneratePixPayment = async () => {
    setPixLoading(true);
    const newOrderId = `MLB${Date.now().toString().slice(-8)}${Math.floor(100 + Math.random() * 900)}`;
    setOrderId(newOrderId);

    try {
      const primaryItem = checkoutItems[0];
      const primaryKit = getKitDetails(primaryItem?.kitSize);
      const primaryColor = primaryItem?.variation.colorName || 'Branco';
      const isSingle = !primaryItem?.kitSize || primaryItem.kitSize.includes('1 unidade');
      const kitSlug = primaryKit.units === 1 ? '1un' : `${primaryKit.units}un`;
      const primaryProdId = `dryko-kit-${kitSlug}-${primaryColor}`.toLowerCase().replace(/\s+/g, '-');
      const primaryProdTitle = isSingle
        ? (primaryItem.quantity > 1
            ? `${primaryItem.quantity}x Spray Dryko Impermeabilizante 400ml (${primaryColor})`
            : `Spray Dryko Impermeabilizante 400ml (${primaryColor})`)
        : `${primaryKit.label} - Spray Dryko Impermeabilizante 400ml (${primaryColor})`;

      // Call server backend for SigiloPay
      const normalizedAmount = Number(finalPrice.toFixed(2));
      const res = await fetch('/api/sigilopay/create-pix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: normalizedAmount,
          buyerName: receiverName,
          buyerEmail: email,
          buyerCpf: cpf,
          buyerPhone: phone,
          color: primaryColor,
          kitSize: primaryItem?.kitSize || '1 unidade (400ml)',
          productId: primaryProdId,
          productTitle: primaryProdTitle,
          quantity: primaryItem?.quantity || 1,
          transactionId: newOrderId,
          products: checkoutItems.map((i) => {
            const iKit = getKitDetails(i.kitSize);
            const iColor = i.variation.colorName || 'Branco';
            const iIsSingle = !i.kitSize || i.kitSize.includes('1 unidade');
            const iSlug = iKit.units === 1 ? '1un' : `${iKit.units}un`;
            const iId = `dryko-kit-${iSlug}-${iColor}`.toLowerCase().replace(/\s+/g, '-');
            const iName = iIsSingle
              ? (i.quantity > 1 ? `${i.quantity}x Spray Dryko Impermeabilizante 400ml (${iColor})` : `Spray Dryko Impermeabilizante 400ml (${iColor})`)
              : `${iKit.label} - Spray Dryko Impermeabilizante 400ml (${iColor})`;
            const singleItemPrice = Number(getItemPrice(i).toFixed(2));
            const discountedItemPrice = paymentMethod === 'pix' ? Number((singleItemPrice * 0.6).toFixed(2)) : singleItemPrice;
            return {
              id: iId,
              name: iName,
              quantity: 1,
              price: discountedItemPrice,
            };
          }),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.pixCode) {
          if (data.transactionId) {
            setOrderId(data.transactionId);
          }
          if (data.sigiloTransactionId) {
            setSigiloTxId(data.sigiloTransactionId);
          }
          if (data.orderUrl) {
            setOrderUrl(data.orderUrl);
          }
          if (data.gateway) {
            setGatewayLabel(data.gateway);
          }
          if (data.isLiveSigiloPay !== undefined) {
            setIsLiveSigilo(Boolean(data.isLiveSigiloPay));
          }
          setPixCode(data.pixCode);
          setQrCodeUrl(data.qrCodeDataUrl);
          setStep(3);
          setPixLoading(false);
          return;
        }
      }
    } catch (e) {
      console.warn('Backend /api/sigilopay call fallback to client generation:', e);
    }

    // Client-side fallback: generates compliant BACEN Pix string & QR Code
    const clientPix = generatePixPayload({
      pixKey: 'pagamentos@sigilopay.com.br',
      merchantName: 'MERCADO LIVRE SIGILOPAY',
      merchantCity: 'SAO PAULO',
      txId: newOrderId,
      amount: finalPrice,
      description: `ML DRYKO ${checkoutItems[0]?.variation.colorName || 'SPRAY'}`,
    });

    try {
      const qrDataUrl = await QRCode.toDataURL(clientPix, {
        errorCorrectionLevel: 'M',
        margin: 2,
        width: 320,
        color: { dark: '#000000', light: '#ffffff' },
      });
      setPixCode(clientPix);
      setQrCodeUrl(qrDataUrl);
    } catch {
      setPixCode(clientPix);
    }

    setStep(3);
    setPixLoading(false);
  };

  // Copy Pix Code to clipboard
  const handleCopyPix = () => {
    if (pixCode) {
      navigator.clipboard.writeText(pixCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  // Simulate payment confirmation check
  const handleVerifyPayment = async () => {
    try {
      if (orderId) {
        await fetch('/api/sigilopay/simulate-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ transactionId: orderId }),
        });
      }
    } catch {
      // ignore
    }
    setPaymentStatus('approved');
    if (onOrderCompleted) {
      onOrderCompleted(orderId || 'MLB-82938192');
    }
  };

  if (!isOpen) return null;

  const minutes = Math.floor(secondsLeft / 60)
    .toString()
    .padStart(2, '0');
  const seconds = (secondsLeft % 60).toString().padStart(2, '0');

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-[#ededed] min-h-screen sm:min-h-0 sm:max-h-[92vh] sm:rounded-lg shadow-2xl w-full max-w-5xl flex flex-col overflow-hidden text-neutral-800">
        {/* Mercado Livre Official Header */}
        <header className="bg-[#ffe600] px-4 py-3 border-b border-[#eed600] flex items-center justify-between shrink-0 shadow-xs">
          <div className="flex items-center gap-2 sm:gap-3">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep((prev) => (prev === 3 ? 2 : 1))}
                className="flex items-center gap-1 text-xs font-semibold text-neutral-800 hover:text-neutral-950 bg-black/5 hover:bg-black/10 px-2 py-1 rounded transition-colors cursor-pointer mr-0.5"
                title="Voltar para a etapa anterior"
              >
                <ArrowLeft size={16} />
                <span className="hidden sm:inline">Voltar</span>
              </button>
            )}
            <img
              src="/mercado-livre-logo.png"
              alt="Mercado Livre"
              className="h-7 sm:h-8 object-contain"
            />
            <span className="hidden sm:inline-block text-xs font-semibold text-neutral-700 border-l border-neutral-400/40 pl-3">
              Checkout Seguro
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium text-neutral-800">
            <div className="flex items-center gap-1 text-[#00a650] font-semibold bg-white/70 px-2.5 py-1 rounded-full text-[11px] sm:text-xs">
              <ShieldCheck size={14} className="text-[#00a650]" />
              <span>Compra Garantida</span>
            </div>
            <div className="hidden sm:flex items-center gap-1 text-neutral-700">
              <Lock size={13} />
              <span>Ambiente Seguro</span>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-black/10 transition-colors text-neutral-700 cursor-pointer"
              title="Voltar para o produto"
            >
              <X size={20} />
            </button>
          </div>
        </header>

        {/* Checkout Progress Bar - All previous steps are clickable/selectable to go back */}
        <div className="bg-white border-b border-neutral-200 px-4 py-2.5 flex items-center justify-center gap-2 sm:gap-6 text-xs font-medium">
          <button
            type="button"
            onClick={() => setStep(1)}
            className={`flex items-center gap-1.5 transition-all group ${
              step === 1
                ? 'text-[#3483fa] font-bold cursor-default'
                : 'text-neutral-600 hover:text-[#3483fa] cursor-pointer'
            }`}
            title="Clique para voltar para o passo 1: Envio"
          >
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] transition-transform ${
                step > 1
                  ? 'bg-[#00a650] text-white group-hover:scale-110'
                  : step === 1
                  ? 'bg-[#3483fa] text-white font-bold'
                  : 'bg-neutral-200 text-neutral-600'
              }`}
            >
              {step > 1 ? '✓' : '1'}
            </span>
            <span className={step > 1 ? 'group-hover:underline' : ''}>Envio</span>
            {step > 1 && (
              <span className="text-[10px] text-[#3483fa] opacity-0 group-hover:opacity-100 transition-opacity hidden md:inline">
                (voltar)
              </span>
            )}
          </button>

          <ChevronRight size={14} className="text-neutral-300" />

          <button
            type="button"
            onClick={() => {
              if (step >= 2) setStep(2);
            }}
            disabled={step < 2}
            className={`flex items-center gap-1.5 transition-all group ${
              step === 2
                ? 'text-[#3483fa] font-bold cursor-default'
                : step > 2
                ? 'text-neutral-600 hover:text-[#3483fa] cursor-pointer'
                : 'text-neutral-400 cursor-default opacity-60'
            }`}
            title={step > 2 ? 'Clique para voltar para o passo 2: Pagamento' : 'Passo 2: Pagamento'}
          >
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] transition-transform ${
                step > 2
                  ? 'bg-[#00a650] text-white group-hover:scale-110'
                  : step === 2
                  ? 'bg-[#3483fa] text-white font-bold'
                  : 'bg-neutral-200 text-neutral-600'
              }`}
            >
              {step > 2 ? '✓' : '2'}
            </span>
            <span className={step > 2 ? 'group-hover:underline' : ''}>Pagamento</span>
            {step > 2 && (
              <span className="text-[10px] text-[#3483fa] opacity-0 group-hover:opacity-100 transition-opacity hidden md:inline">
                (voltar)
              </span>
            )}
          </button>

          <ChevronRight size={14} className="text-neutral-300" />

          <button
            type="button"
            onClick={() => {
              if (pixCode) setStep(3);
            }}
            disabled={!pixCode && step !== 3}
            className={`flex items-center gap-1.5 transition-colors ${
              step === 3
                ? 'text-[#3483fa] font-bold cursor-default'
                : pixCode
                ? 'text-neutral-600 hover:text-[#3483fa] cursor-pointer'
                : 'text-neutral-400 cursor-default'
            }`}
            title="Passo 3: Confirmação Pix"
          >
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${
                step === 3
                  ? 'bg-[#3483fa] text-white font-bold'
                  : 'bg-neutral-200 text-neutral-600'
              }`}
            >
              3
            </span>
            <span>Confirmação Pix</span>
          </button>
        </div>

        {/* Content Body: Two columns layout on desktop */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 max-w-5xl mx-auto">
            {/* Left Main Form Column */}
            <div className="lg:col-span-8 space-y-4">
              {/* STEP 1: ENDEREÇO & FRETE FULL */}
              {step === 1 && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  {/* Shipping option card */}
                  <div className="bg-white rounded-lg p-4 sm:p-5 shadow-xs border border-neutral-200/80">
                    <h2 className="text-base font-semibold text-neutral-900 mb-3 flex items-center gap-2">
                      <Truck size={18} className="text-[#00a650]" />
                      <span>Como você quer receber sua compra?</span>
                    </h2>

                    <div className="space-y-2.5">
                      <label
                        onClick={() => setDeliveryOption('full')}
                        className={`flex items-start gap-3 p-3.5 rounded-lg border-2 cursor-pointer transition-all ${
                          deliveryOption === 'full'
                            ? 'border-[#3483fa] bg-[#f2f7fe]'
                            : 'border-neutral-200 hover:border-neutral-300 bg-white'
                        }`}
                      >
                        <input
                          type="radio"
                          name="delivery"
                          checked={deliveryOption === 'full'}
                          onChange={() => setDeliveryOption('full')}
                          className="mt-1 text-[#3483fa] focus:ring-[#3483fa]"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-[#00a650] text-sm">
                              Chegará grátis amanhã
                            </span>
                            <span className="inline-flex items-center gap-0.5 bg-[#00a650] text-white text-[10px] font-black italic px-1.5 py-0.5 rounded">
                              <Zap size={10} className="fill-white" />
                              FULL
                            </span>
                          </div>
                          <p className="text-xs text-neutral-500 mt-0.5">
                            O envio mais rápido do Brasil direto do centro de distribuição do Mercado Livre
                          </p>
                        </div>
                        <span className="text-xs font-bold text-[#00a650] uppercase">
                          Grátis
                        </span>
                      </label>

                      <label
                        onClick={() => setDeliveryOption('pickup')}
                        className={`flex items-start gap-3 p-3.5 rounded-lg border-2 cursor-pointer transition-all ${
                          deliveryOption === 'pickup'
                            ? 'border-[#3483fa] bg-[#f2f7fe]'
                            : 'border-neutral-200 hover:border-neutral-300 bg-white'
                        }`}
                      >
                        <input
                          type="radio"
                          name="delivery"
                          checked={deliveryOption === 'pickup'}
                          onChange={() => setDeliveryOption('pickup')}
                          className="mt-1 text-[#3483fa] focus:ring-[#3483fa]"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-neutral-800 text-sm">
                              Retirar em uma agência do Mercado Livre
                            </span>
                          </div>
                          <p className="text-xs text-neutral-500 mt-0.5">
                            Disponível a partir de amanhã no ponto mais próximo de você
                          </p>
                        </div>
                        <span className="text-xs font-bold text-[#00a650] uppercase">
                          Grátis
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Address & Customer Form */}
                  <div className="bg-white rounded-lg p-4 sm:p-5 shadow-xs border border-neutral-200/80">
                    <h2 className="text-base font-semibold text-neutral-900 mb-1">
                      Endereço de entrega
                    </h2>
                    <p className="text-xs text-neutral-500 mb-4">
                      Preencha os dados do destinatário para envio e nota fiscal
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {/* CEP */}
                      <div>
                        <label className="block text-xs font-medium text-neutral-700 mb-1">
                          CEP
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={cep}
                            maxLength={9}
                            onChange={(e) => {
                              const val = e.target.value;
                              setCep(val);
                              if (val.replace(/\D/g, '').length === 8) {
                                handleLookupCep(val);
                              }
                            }}
                            className="w-full text-xs sm:text-sm px-3 py-2 border border-neutral-300 rounded focus:border-[#3483fa] focus:ring-1 focus:ring-[#3483fa] outline-none"
                            placeholder="00000-000"
                          />
                          {loadingCep && (
                            <span className="absolute right-2.5 top-2.5 text-[10px] text-[#3483fa] font-medium">
                              Buscando...
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Nome do Destinatário */}
                      <div>
                        <label className="block text-xs font-medium text-neutral-700 mb-1">
                          Nome completo de quem vai receber
                        </label>
                        <input
                          type="text"
                          value={receiverName}
                          onChange={(e) => setReceiverName(e.target.value)}
                          className="w-full text-xs sm:text-sm px-3 py-2 border border-neutral-300 rounded focus:border-[#3483fa] focus:ring-1 focus:ring-[#3483fa] outline-none"
                          placeholder="Ex: João da Silva"
                        />
                      </div>

                      {/* Rua */}
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-medium text-neutral-700 mb-1">
                          Rua / Avenida / Logradouro
                        </label>
                        <input
                          type="text"
                          value={street}
                          onChange={(e) => setStreet(e.target.value)}
                          className="w-full text-xs sm:text-sm px-3 py-2 border border-neutral-300 rounded focus:border-[#3483fa] focus:ring-1 focus:ring-[#3483fa] outline-none"
                          placeholder="Ex: Av. Paulista"
                        />
                      </div>

                      {/* Número */}
                      <div>
                        <label className="block text-xs font-medium text-neutral-700 mb-1">
                          Número
                        </label>
                        <input
                          type="text"
                          value={number}
                          onChange={(e) => setNumber(e.target.value)}
                          className="w-full text-xs sm:text-sm px-3 py-2 border border-neutral-300 rounded focus:border-[#3483fa] focus:ring-1 focus:ring-[#3483fa] outline-none"
                          placeholder="Ex: 123"
                        />
                      </div>

                      {/* Complemento */}
                      <div>
                        <label className="block text-xs font-medium text-neutral-700 mb-1">
                          Complemento (opcional)
                        </label>
                        <input
                          type="text"
                          value={complement}
                          onChange={(e) => setComplement(e.target.value)}
                          className="w-full text-xs sm:text-sm px-3 py-2 border border-neutral-300 rounded focus:border-[#3483fa] focus:ring-1 focus:ring-[#3483fa] outline-none"
                          placeholder="Ex: Apto 42, Bloco B"
                        />
                      </div>

                      {/* Bairro */}
                      <div>
                        <label className="block text-xs font-medium text-neutral-700 mb-1">
                          Bairro
                        </label>
                        <input
                          type="text"
                          value={neighborhood}
                          onChange={(e) => setNeighborhood(e.target.value)}
                          className="w-full text-xs sm:text-sm px-3 py-2 border border-neutral-300 rounded focus:border-[#3483fa] focus:ring-1 focus:ring-[#3483fa] outline-none"
                        />
                      </div>

                      {/* Cidade / UF */}
                      <div>
                        <label className="block text-xs font-medium text-neutral-700 mb-1">
                          Cidade e Estado
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            className="flex-1 text-xs sm:text-sm px-3 py-2 border border-neutral-300 rounded focus:border-[#3483fa] focus:ring-1 focus:ring-[#3483fa] outline-none"
                          />
                          <input
                            type="text"
                            value={stateCode}
                            maxLength={2}
                            onChange={(e) => setStateCode(e.target.value.toUpperCase())}
                            className="w-14 text-center uppercase text-xs sm:text-sm px-2 py-2 border border-neutral-300 rounded focus:border-[#3483fa] focus:ring-1 focus:ring-[#3483fa] outline-none"
                          />
                        </div>
                      </div>

                      {/* CPF */}
                      <div>
                        <label className="block text-xs font-medium text-neutral-700 mb-1">
                          CPF do destinatário (para Nota Fiscal)
                        </label>
                        <input
                          type="text"
                          value={cpf}
                          onChange={(e) => setCpf(e.target.value)}
                          className="w-full text-xs sm:text-sm px-3 py-2 border border-neutral-300 rounded focus:border-[#3483fa] focus:ring-1 focus:ring-[#3483fa] outline-none"
                          placeholder="000.000.000-00"
                        />
                      </div>

                      {/* Telefone */}
                      <div>
                        <label className="block text-xs font-medium text-neutral-700 mb-1">
                          Telefone / WhatsApp
                        </label>
                        <input
                          type="text"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full text-xs sm:text-sm px-3 py-2 border border-neutral-300 rounded focus:border-[#3483fa] focus:ring-1 focus:ring-[#3483fa] outline-none"
                          placeholder="(11) 98888-8888"
                        />
                      </div>
                    </div>

                    <div className="mt-5 pt-3 border-t border-neutral-100 flex justify-end">
                      <button
                        type="button"
                        onClick={() => setStep(2)}
                        className="w-full sm:w-auto px-6 py-3 bg-[#3483fa] hover:bg-[#2968c8] text-white font-bold text-sm rounded shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <span>Continuar para o pagamento</span>
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: FORMA DE PAGAMENTO EXCLUSIVA PIX */}
              {step === 2 && (
                <div className="bg-white rounded-lg p-4 sm:p-6 shadow-xs border border-neutral-200/80 space-y-5 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                    <div>
                      <h2 className="text-base font-semibold text-neutral-900">
                        Pagamento com Pix
                      </h2>
                      <p className="text-xs text-neutral-500">
                        Aprovação instantânea e 40% de desconto via gateway oficial SigiloPay
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="text-xs text-[#3483fa] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <ArrowLeft size={13} />
                      <span>Alterar endereço</span>
                    </button>
                  </div>

                  {/* Pix Exclusive Card */}
                  <div className="p-4 sm:p-5 rounded-lg border-2 border-[#00a650] bg-[#f0faf4] ring-1 ring-[#00a650] space-y-4">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#00a650] text-white flex items-center justify-center shrink-0 shadow-xs">
                          <Zap size={20} className="fill-white" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-neutral-900 text-base">
                              Pix (Pagamento Exclusivo)
                            </span>
                            <span className="bg-[#00a650] text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                              Aprovação Imediata
                            </span>
                            <span className="bg-emerald-200 text-emerald-900 text-[10px] font-bold px-2 py-0.5 rounded">
                              40% OFF APLICADO
                            </span>
                          </div>
                          <p className="text-xs text-neutral-700 mt-1.5 leading-relaxed">
                            Pague com <strong>QR Code</strong> ou <strong>Pix Copia e Cola</strong> através de qualquer banco ou carteira digital.
                            Assim que o pagamento for identificado, seu pedido é despachado imediatamente pelo <strong>Mercado Envios FULL</strong>.
                          </p>
                        </div>
                      </div>

                      <div className="text-right sm:self-center shrink-0 pl-13 sm:pl-0">
                        <span className="block text-xl font-extrabold text-[#00a650]">
                          R$ {finalPrice.toFixed(2).replace('.', ',')}
                        </span>
                        <span className="block text-xs text-neutral-400 line-through">
                          R$ {originalSubtotal.toFixed(2).replace('.', ',')}
                        </span>
                        <span className="text-[11px] text-emerald-700 font-semibold">
                          Economia de R$ {(originalSubtotal - finalPrice).toFixed(2).replace('.', ',')}
                        </span>
                      </div>
                    </div>

                    {/* Pix Features Grid */}
                    <div className="pt-3 border-t border-emerald-200/70 grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs text-neutral-700">
                      <div className="flex items-center gap-2 bg-white/70 p-2 rounded">
                        <Sparkles size={15} className="text-[#00a650] shrink-0" />
                        <span><strong>Gateway SigiloPay</strong> homologado</span>
                      </div>
                      <div className="flex items-center gap-2 bg-white/70 p-2 rounded">
                        <Truck size={15} className="text-[#00a650] shrink-0" />
                        <span><strong>Envio Full</strong> prioritário</span>
                      </div>
                      <div className="flex items-center gap-2 bg-white/70 p-2 rounded">
                        <ShieldCheck size={15} className="text-[#00a650] shrink-0" />
                        <span><strong>Compra Garantida</strong> ML</span>
                      </div>
                    </div>
                  </div>

                  {/* Instruções de como pagar */}
                  <div className="bg-[#f8f9fa] rounded-lg p-3.5 border border-neutral-200 text-xs text-neutral-600 space-y-1.5">
                    <p className="font-semibold text-neutral-800">
                      Como funciona o pagamento:
                    </p>
                    <ol className="list-decimal list-inside space-y-1 text-neutral-600">
                      <li>Clique no botão abaixo para gerar o código Pix exclusivo do seu pedido.</li>
                      <li>Abra o aplicativo do seu banco e escolha <strong>Pix &gt; Ler QR code</strong> ou <strong>Pix Copia e Cola</strong>.</li>
                      <li>Confirme o valor e conclua a transferência. A confirmação é instantânea!</li>
                    </ol>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-3 border-t border-neutral-100 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="text-xs text-neutral-600 hover:text-neutral-900 flex items-center gap-1 font-medium cursor-pointer"
                    >
                      <ArrowLeft size={14} />
                      <span>Voltar para endereço</span>
                    </button>

                    <button
                      type="button"
                      disabled={pixLoading}
                      onClick={handleGeneratePixPayment}
                      className="px-6 py-3.5 bg-[#00a650] hover:bg-[#008f45] text-white font-bold text-sm rounded shadow-xs transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-60"
                    >
                      {pixLoading ? (
                        <span>Gerando Pix SigiloPay...</span>
                      ) : (
                        <>
                          <Zap size={16} className="fill-white" />
                          <span>Pagar com Pix (R$ {finalPrice.toFixed(2).replace('.', ',')})</span>
                          <ChevronRight size={16} />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: TELA DE PAGAMENTO PIX IDÊNTICA AO MERCADO PAGO / SIGILOPAY */}
              {step === 3 && (
                <div className="bg-white rounded-lg p-5 sm:p-7 shadow-xs border border-neutral-200/80 space-y-6 animate-in fade-in duration-200">
                  {/* Status Banner */}
                  {paymentStatus === 'pending' ? (
                    <>
                      {/* Navigation bar to easily go back from confirmation stage */}
                      <div className="flex items-center justify-between border-b border-neutral-200/80 pb-3 flex-wrap gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <button
                            type="button"
                            onClick={() => setStep(2)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold rounded transition-colors cursor-pointer border border-neutral-300"
                            title="Voltar para a etapa anterior (Forma de pagamento)"
                          >
                            <ArrowLeft size={14} />
                            <span>Voltar para Pagamento</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setStep(1)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs text-[#3483fa] hover:text-[#2968c8] hover:bg-blue-50 rounded font-medium cursor-pointer"
                            title="Voltar para a etapa 1 para alterar dados ou endereço de entrega"
                          >
                            <span>Alterar endereço</span>
                          </button>
                        </div>
                        <span className="text-[11px] text-neutral-500 font-medium">
                          Etapa 3 de 3 • Confirmação Pix
                        </span>
                      </div>

                      <div className="bg-[#fff9e6] border border-[#ffe600] rounded-lg p-3 sm:p-4 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <Clock size={20} className="text-[#b37400] shrink-0" />
                          <div>
                            <h3 className="text-xs sm:text-sm font-bold text-[#b37400]">
                              Falta pouco! Pague via Pix para garantir seu pedido
                            </h3>
                            <p className="text-[11px] sm:text-xs text-neutral-600">
                              Seu pedido no Mercado Livre está reservado. Conclua o pagamento antes do prazo.
                            </p>
                          </div>
                        </div>

                        <div className="text-right shrink-0 bg-white px-3 py-1.5 rounded-md border border-neutral-200">
                          <span className="text-[10px] text-neutral-500 uppercase font-bold block">
                            Expira em
                          </span>
                          <span className="text-base font-mono font-bold text-[#b37400]">
                            {minutes}:{seconds}
                          </span>
                        </div>
                      </div>

                      {/* Main Pix QR & Copy Section */}
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                        {/* QR Code Container */}
                        <div className="md:col-span-5 flex flex-col items-center justify-center p-4 bg-neutral-50 rounded-lg border border-neutral-200 text-center">
                          <div className="bg-white p-2.5 rounded-md shadow-xs border border-neutral-200 mb-2">
                            {qrCodeUrl ? (
                              <img
                                src={qrCodeUrl}
                                alt="QR Code Pix SigiloPay"
                                className="w-48 h-48 sm:w-52 sm:h-52 object-contain"
                              />
                            ) : (
                              <div className="w-48 h-48 flex items-center justify-center text-neutral-400">
                                <QrCode size={64} />
                              </div>
                            )}
                          </div>
                          <span className="text-[11px] text-neutral-500 font-medium">
                            Aponte a câmera do seu banco para o QR Code
                          </span>
                        </div>

                        {/* Copy Paste Code & Steps */}
                        <div className="md:col-span-7 space-y-4">
                          <div>
                            <label className="block text-xs font-bold text-neutral-800 mb-1.5">
                              Pix Copia e Cola
                            </label>
                            <div className="relative">
                              <textarea
                                readOnly
                                value={pixCode}
                                rows={3}
                                className="w-full text-xs font-mono p-2.5 bg-neutral-50 border border-neutral-300 rounded text-neutral-700 resize-none outline-none select-all"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={handleCopyPix}
                              className={`w-full mt-2 py-3 rounded-md font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs ${
                                copied
                                  ? 'bg-[#00a650] text-white'
                                  : 'bg-[#3483fa] hover:bg-[#2968c8] text-white'
                              }`}
                            >
                              {copied ? (
                                <>
                                  <CheckCircle2 size={18} />
                                  <span>Código Pix copiado!</span>
                                </>
                              ) : (
                                <>
                                  <Copy size={17} />
                                  <span>Copiar código Pix</span>
                                </>
                              )}
                            </button>
                          </div>

                          {/* Steps instructions */}
                          <div className="bg-neutral-50 rounded-lg p-3.5 border border-neutral-200/70 space-y-2 text-xs text-neutral-700">
                            <span className="font-bold text-neutral-900 block text-[11px] uppercase tracking-wide">
                              Como pagar com Pix:
                            </span>
                            <ol className="space-y-1.5 list-decimal list-inside text-[11px] leading-relaxed">
                              <li>Abra o aplicativo do seu banco no celular</li>
                              <li>Escolha a opção <strong>Pix &gt; Copia e Cola</strong></li>
                              <li>Cole o código copiado acima e confirme o pagamento</li>
                              <li>Sua aprovação será confirmada automaticamente</li>
                            </ol>
                          </div>

                          {/* Gateway details */}
                          <div className="flex flex-col gap-1.5 border-t border-neutral-100 pt-2 text-[11px] text-neutral-500">
                            <div className="flex items-center justify-between">
                              <span className="flex items-center gap-1.5">
                                Processado por: <strong>{gatewayLabel}</strong>
                                {isLiveSigilo && (
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    SigiloPay Oficial
                                  </span>
                                )}
                              </span>
                              <span>Beneficiário: <strong>Mercado Livre</strong></span>
                            </div>

                            {sigiloTxId && (
                              <div className="flex items-center justify-between bg-neutral-100/80 px-2.5 py-1.5 rounded text-[11px] text-neutral-700 border border-neutral-200/60">
                                <span className="text-neutral-500 font-medium">
                                  ID SigiloPay (Gateway &gt; Transações):
                                </span>
                                <span className="font-mono font-bold text-neutral-900 select-all">
                                  {sigiloTxId}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Live verification button and back buttons */}
                      <div className="border-t border-neutral-100 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 w-full sm:w-auto flex-wrap">
                          <button
                            type="button"
                            onClick={() => setStep(2)}
                            className="w-full sm:w-auto px-4 py-2 border border-neutral-300 hover:border-neutral-400 bg-white hover:bg-neutral-50 text-neutral-700 text-xs font-semibold rounded shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                            title="Voltar para a etapa anterior (Forma de pagamento)"
                          >
                            <ArrowLeft size={14} />
                            <span>Voltar para pagamento</span>
                          </button>

                          <div className="flex items-center gap-2 text-xs text-neutral-600">
                            <span className="w-2 h-2 rounded-full bg-[#00a650] animate-pulse" />
                            <span className="text-[11px] sm:text-xs">Aguardando confirmação automática...</span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={handleVerifyPayment}
                          className="w-full sm:w-auto px-5 py-2.5 bg-[#00a650] hover:bg-[#008f45] text-white text-xs font-bold rounded shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <CheckCircle2 size={16} />
                          <span>Já fiz o pagamento</span>
                        </button>
                      </div>
                    </>
                  ) : (
                    /* PAYMENT SUCCESS STATE */
                    <div className="text-center py-6 space-y-4 animate-in zoom-in-95 duration-200">
                      <div className="w-16 h-16 rounded-full bg-[#00a650]/15 text-[#00a650] flex items-center justify-center mx-auto">
                        <CheckCircle2 size={36} />
                      </div>

                      <div>
                        <span className="inline-block bg-[#00a650] text-white text-[11px] font-black italic px-2 py-0.5 rounded mb-2">
                          PAGAMENTO CONFIRMADO
                        </span>
                        <h2 className="text-xl sm:text-2xl font-bold text-neutral-900">
                          Pedido confirmado com sucesso!
                        </h2>
                        <p className="text-xs sm:text-sm text-neutral-600 mt-1 max-w-md mx-auto">
                          Seu pagamento via Pix SigiloPay foi aprovado instantaneamente. Seu pacote já está sendo embalado no centro de distribuição <strong>FULL</strong> do Mercado Livre.
                        </p>
                      </div>

                      {/* Order info card */}
                      <div className="max-w-md mx-auto bg-neutral-50 rounded-lg border border-neutral-200 p-4 text-xs space-y-2 text-left">
                        <div className="flex justify-between text-neutral-600">
                          <span>Código do Pedido:</span>
                          <span className="font-mono font-bold text-neutral-800">
                            {orderId || 'MLB-91823910'}
                          </span>
                        </div>
                        <div className="flex justify-between text-neutral-600">
                          <span>Rastreamento Mercado Envios:</span>
                          <span className="font-mono font-bold text-[#00a650]">
                            BRML928174920FULL
                          </span>
                        </div>
                        <div className="flex justify-between text-neutral-600">
                          <span>Previsão de Entrega:</span>
                          <span className="font-bold text-[#00a650]">Amanhã</span>
                        </div>
                        <div className="flex justify-between text-neutral-600">
                          <span>Destino:</span>
                          <span className="font-medium text-neutral-800">
                            {street}, {number} - {city}/{stateCode}
                          </span>
                        </div>
                        <div className="flex justify-between text-neutral-600 border-t border-neutral-200 pt-2 font-bold">
                          <span>Total Pago via Pix:</span>
                          <span className="text-sm text-neutral-900">
                            R$ {finalPrice.toFixed(2).replace('.', ',')}
                          </span>
                        </div>
                      </div>

                      <div className="pt-2 flex justify-center">
                        <button
                          type="button"
                          onClick={onClose}
                          className="px-8 py-3 bg-[#3483fa] hover:bg-[#2968c8] text-white font-bold text-sm rounded shadow-xs transition-colors cursor-pointer"
                        >
                          Voltar para a página do produto
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right Sidebar: Resumo do Pedido (Mercado Livre Style) */}
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-white rounded-lg p-4 sm:p-5 shadow-xs border border-neutral-200/80 space-y-4">
                <h3 className="text-sm font-bold text-neutral-900 border-b border-neutral-100 pb-2.5">
                  Resumo da compra
                </h3>

                {/* Products List */}
                <div className="space-y-3">
                  {checkoutItems.map((item, idx) => (
                    <div key={idx} className="flex gap-3 text-xs bg-neutral-50/70 p-2.5 rounded-md border border-neutral-100">
                      <img
                        src={item.variation.image}
                        alt={item.variation.name}
                        className="w-14 h-14 object-contain rounded border border-neutral-200 bg-white shrink-0 self-start"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-semibold text-neutral-800 line-clamp-2 leading-snug">
                          {getItemTitle(item)}
                        </h4>
                        <div className="text-[11px] text-neutral-500 mt-1 flex items-center gap-1.5 flex-wrap">
                          <span>Cor: <strong>{item.variation.colorName}</strong></span>
                        </div>

                        {/* Unit / Kit Quick Selector */}
                        <div className="mt-1.5 flex items-center gap-1">
                          <label className="text-[10px] text-neutral-500 font-medium shrink-0">Opção:</label>
                          <select
                            id={`checkout-kit-select-${idx}`}
                            value={item.kitSize || '1 unidade (400ml)'}
                            onChange={(e) => handleSetItemKit(idx, e.target.value)}
                            className="text-[11px] font-semibold text-neutral-800 bg-white border border-neutral-300 rounded px-1.5 py-0.5 outline-none focus:border-[#3483fa] cursor-pointer truncate max-w-[190px]"
                          >
                            <option value="1 unidade (400ml)">1 unidade (R$ 29,90)</option>
                            <option value="Kit 2 unidades">Kit 2 unidades (R$ 54,90)</option>
                            <option value="Kit 3 unidades (Mais vendido)">Kit 3 unidades (R$ 79,90)</option>
                            <option value="Kit 6 unidades (Econômico)">Kit 6 unidades (R$ 149,90)</option>
                          </select>
                        </div>

                        {/* Quantity Counter & Total Price */}
                        <div className="flex items-center justify-between mt-2 pt-1 border-t border-neutral-200/60">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] text-neutral-500">Qtd:</span>
                            <div className="inline-flex items-center border border-neutral-300 rounded bg-white overflow-hidden shadow-2xs">
                              <button
                                type="button"
                                onClick={() => handleUpdateItemQuantity(idx, -1)}
                                className="px-1.5 py-0.5 text-neutral-600 hover:bg-neutral-100 font-bold text-xs disabled:opacity-40 cursor-pointer"
                                disabled={item.quantity <= 1}
                              >
                                -
                              </button>
                              <span className="px-2 text-xs font-semibold text-neutral-800 min-w-5 text-center">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleUpdateItemQuantity(idx, 1)}
                                className="px-1.5 py-0.5 text-neutral-600 hover:bg-neutral-100 font-bold text-xs cursor-pointer"
                              >
                                +
                              </button>
                            </div>
                          </div>
                          <span className="font-bold text-neutral-900 text-sm">
                            R$ {getItemPrice(item).toFixed(2).replace('.', ',')}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Price Breakdown */}
                <div className="border-t border-neutral-100 pt-3 space-y-2 text-xs">
                  <div className="flex justify-between text-neutral-600">
                    <span>Produtos ({totalItemsCount})</span>
                    <span>R$ {subtotal.toFixed(2).replace('.', ',')}</span>
                  </div>

                  <div className="flex justify-between text-[#00a650] font-medium">
                    <span className="flex items-center gap-1">
                      <span>Envio FULL</span>
                      <Zap size={11} className="fill-[#00a650]" />
                    </span>
                    <span className="uppercase font-bold">Grátis</span>
                  </div>

                  {savings > 0 && (
                    <div className="flex justify-between text-[#00a650] font-medium">
                      <span>Desconto aplicado (40%)</span>
                      <span>- R$ {savings.toFixed(2).replace('.', ',')}</span>
                    </div>
                  )}

                  <div className="border-t border-neutral-200 pt-2 flex justify-between items-baseline">
                    <span className="text-sm font-bold text-neutral-900">Você pagará:</span>
                    <div className="text-right">
                      <span className="text-lg font-black text-neutral-900">
                        R$ {finalPrice.toFixed(2).replace('.', ',')}
                      </span>
                      {paymentMethod === 'pix' && (
                        <span className="block text-[10px] text-[#00a650] font-semibold">
                          com Pix à vista
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Delivery details with change button */}
                <div className="bg-[#f8f9fa] rounded-md p-2.5 border border-neutral-200 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-neutral-700 flex items-center gap-1.5 text-[11px]">
                      <Truck size={13} className="text-[#00a650]" />
                      <span>Endereço de entrega</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="text-[11px] text-[#3483fa] hover:underline font-semibold cursor-pointer"
                      title="Voltar para a etapa 1 para editar o endereço"
                    >
                      Alterar
                    </button>
                  </div>
                  <p className="text-neutral-600 truncate text-[11px]">
                    {street}, {number} - {city}/{stateCode}
                  </p>
                </div>

                {/* Trust & Guarantee Box */}
                <div className="bg-neutral-50 rounded-lg p-3 border border-neutral-200/80 space-y-2 text-[11px] text-neutral-600">
                  <div className="flex items-start gap-2">
                    <ShieldCheck size={15} className="text-[#00a650] shrink-0 mt-0.5" />
                    <span>
                      <strong>Compra Garantida:</strong> Receba o produto que está esperando ou devolvemos seu dinheiro.
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Lock size={14} className="text-[#3483fa] shrink-0 mt-0.5" />
                    <span>
                      Pagamento protegido e criptografado com a tecnologia <strong>SigiloPay</strong>.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
