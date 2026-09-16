import React from 'react';
import { X, QrCode, ShieldCheck, Zap, Sparkles, CheckCircle2 } from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  price: number;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  price,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 text-neutral-800 animate-in fade-in zoom-in-95 duration-150 relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-700 p-1 cursor-pointer"
        >
          <X size={20} />
        </button>

        <h3 className="text-lg font-semibold text-neutral-900 mb-1">
          Pagamento Exclusivo via Pix
        </h3>
        <p className="text-xs text-neutral-500 mb-5">
          Pague com Pix e aproveite o desconto de 40% com aprovação imediata
        </p>

        <div className="space-y-4 text-sm">
          {/* Pix Box */}
          <div className="p-4 rounded-lg border-2 border-[#00a650] bg-[#f0faf4]">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2 font-bold text-neutral-900">
                <div className="w-8 h-8 rounded-full bg-[#00a650] text-white flex items-center justify-center">
                  <Zap size={16} className="fill-white" />
                </div>
                <div>
                  <span className="text-sm">Pix Instantâneo</span>
                  <span className="block text-[10px] text-[#00a650] font-semibold uppercase">
                    Aprovação Imediata
                  </span>
                </div>
              </div>
              <span className="bg-[#00a650] text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                40% OFF
              </span>
            </div>

            <div className="mt-3 pt-3 border-t border-emerald-200/80">
              <div className="text-2xl font-black text-[#00a650]">
                R$ {price.toFixed(2).replace('.', ',')}
              </div>
              <p className="text-xs text-neutral-600 mt-1">
                Pague via <strong>QR Code</strong> ou <strong>Pix Copia e Cola</strong> no aplicativo de qualquer banco.
              </p>
            </div>
          </div>

          <div className="space-y-2 text-xs text-neutral-600">
            <div className="flex items-start gap-2">
              <CheckCircle2 size={16} className="text-[#00a650] shrink-0 mt-0.5" />
              <span><strong>Aprovação em segundos:</strong> Seu pedido entra na esteira de expedição do Full na mesma hora.</span>
            </div>
            <div className="flex items-start gap-2">
              <Sparkles size={16} className="text-[#00a650] shrink-0 mt-0.5" />
              <span><strong>Gateway SigiloPay Oficial:</strong> Transações criptografadas de ponta a ponta.</span>
            </div>
          </div>

          {/* Mercado Livre Security */}
          <div className="bg-[#f5f5f5] p-3 rounded flex items-center gap-2 text-xs text-neutral-700">
            <ShieldCheck size={18} className="text-[#00a650] shrink-0" />
            <span>
              Transação 100% segura com o Programa Compra Garantida do Mercado Livre.
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 bg-[#3483fa] hover:bg-[#2968c8] text-white text-xs font-semibold rounded cursor-pointer transition-colors"
          >
            Entendido, fechar
          </button>
        </div>
      </div>
    </div>
  );
};
