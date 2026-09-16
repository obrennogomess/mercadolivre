import React from 'react';
import { X, Trash2, Plus, Minus, ArrowRight, Zap, CheckCircle2 } from 'lucide-react';
import { ProductVariation, getKitDetails } from '../data/productData';

export interface CartItem {
  variation: ProductVariation;
  quantity: number;
  kitSize: string;
}

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (index: number, newQty: number) => void;
  onRemoveItem: (index: number) => void;
  onCheckout: (quantity?: number, color?: string, kitSize?: string) => void;
  cep?: string;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
  cep,
}) => {
  if (!isOpen) return null;

  const getItemPrice = (item: CartItem) => {
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

  const subtotal = items.reduce(
    (acc, item) => acc + getItemPrice(item),
    0
  );
  const totalQuantity = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className="relative w-full max-w-md bg-white h-full shadow-2xl z-10 flex flex-col justify-between text-neutral-800 animate-in slide-in-from-right duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-neutral-900">
              Meu carrinho
            </h2>
            <span className="text-xs text-neutral-500">
              ({items.reduce((s, i) => s + i.quantity, 0)} itens)
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-neutral-500 hover:text-black rounded transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Items List */}
        <div className="p-4 flex-1 overflow-y-auto space-y-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-neutral-500">
              <span className="text-4xl mb-2">🛒</span>
              <p className="font-semibold text-neutral-800">Seu carrinho está vazio</p>
              <p className="text-xs mt-1">Adicione produtos para aproveitar o frete grátis Full!</p>
            </div>
          ) : (
            items.map((item, index) => (
              <div
                key={index}
                className="flex gap-3 pb-4 border-b border-neutral-100 last:border-0"
              >
                <img
                  src={item.variation.image}
                  alt={item.variation.name}
                  className="w-16 h-16 object-contain rounded border border-neutral-200 p-1 shrink-0 bg-white"
                />
                <div className="flex-1 flex flex-col justify-between text-xs">
                  <div>
                    <h3 className="font-medium text-neutral-900 line-clamp-2">
                      Spray Borracha Líquida Dryko 400ml - {item.variation.colorName} ({item.kitSize})
                    </h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-neutral-500">
                        Cor: {item.variation.colorName}
                      </span>
                      <span className="text-neutral-300">•</span>
                      <span className="text-[#00a650] font-semibold flex items-center gap-0.5">
                        <Zap size={10} className="fill-[#00a650]" />
                        FULL
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    {/* Quantity controls */}
                    <div className="flex items-center border border-neutral-300 rounded overflow-hidden">
                      <button
                        onClick={() => onUpdateQuantity(index, item.quantity - 1)}
                        className="px-2 py-1 text-neutral-600 hover:bg-neutral-100"
                        title="Diminuir quantidade"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="px-2 font-semibold text-neutral-800">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(index, item.quantity + 1)}
                        className="px-2 py-1 text-neutral-600 hover:bg-neutral-100"
                        title="Aumentar quantidade"
                      >
                        <Plus size={12} />
                      </button>
                    </div>

                    {/* Price and remove */}
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-sm text-neutral-900">
                        R$ {getItemPrice(item).toFixed(2).replace('.', ',')}
                      </span>
                      <button
                        onClick={() => onRemoveItem(index)}
                        className="text-neutral-400 hover:text-red-500 p-1 transition-colors"
                        title="Remover produto"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-neutral-100">
                    <button
                      type="button"
                      onClick={() => onCheckout(item.quantity, item.variation.colorName, item.kitSize)}
                      className="text-xs font-semibold text-[#3483fa] hover:text-[#2968c8] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>Comprar agora</span>
                      <ArrowRight size={12} />
                    </button>
                    <span className="text-[11px] text-[#00a650] font-medium">
                      Frete grátis Full
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Summary */}
        {items.length > 0 && (
          <div className="p-4 border-t border-neutral-200 bg-neutral-50 space-y-3">
            <div className="flex items-center justify-between text-xs text-neutral-600">
              <span>Envio</span>
              <span className="text-[#00a650] font-semibold">Grátis pelo Full</span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-neutral-800">Total com descontos:</span>
              <span className="text-xl font-bold text-neutral-900">
                R$ {subtotal.toFixed(2).replace('.', ',')}
              </span>
            </div>

            <button
              id="cart-buy-now-btn"
              type="button"
              onClick={() => {
                const primaryItem = items[0];
                onCheckout(primaryItem?.quantity || 1, primaryItem?.variation.colorName, primaryItem?.kitSize);
              }}
              className="w-full py-3.5 bg-[#3483fa] hover:bg-[#2968c8] text-white text-sm font-bold rounded-md shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-colors block text-center"
            >
              <span>Comprar agora</span>
              <ArrowRight size={17} className="inline-block" />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-1.5 text-xs text-center font-medium text-neutral-600 hover:text-[#3483fa] cursor-pointer transition-colors"
            >
              Continuar comprando
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
