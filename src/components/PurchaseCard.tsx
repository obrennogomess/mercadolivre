import React, { useState } from 'react';
import {
  Star,
  Zap,
  Truck,
  RotateCcw,
  ShieldCheck,
  Trophy,
  Award,
  ChevronDown,
  CreditCard,
  CheckCircle2,
  Heart,
  Share2,
} from 'lucide-react';
import { PRODUCT_DATA, ProductVariation, getKitDetails } from '../data/productData';

interface PurchaseCardProps {
  variation: ProductVariation;
  onSelectVariation?: (variation: ProductVariation) => void;
  selectedKitSize: string;
  onSelectKitSize?: (kit: string) => void;
  quantity: number;
  onQuantityChange: (qty: number) => void;
  onAddToCart: () => void;
  onBuyNow: () => void;
  cep: string;
  userLocationLabel?: string;
  onOpenCepModal: () => void;
  onOpenPaymentModal: () => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onOpenShare: () => void;
}

export const PurchaseCard: React.FC<PurchaseCardProps> = ({
  variation,
  onSelectVariation,
  selectedKitSize,
  onSelectKitSize,
  quantity,
  onQuantityChange,
  onAddToCart,
  onBuyNow,
  cep,
  userLocationLabel,
  onOpenCepModal,
  onOpenPaymentModal,
  isFavorite,
  onToggleFavorite,
  onOpenShare,
}) => {
  const [addedAnimation, setAddedAnimation] = useState(false);

  const handleAdd = () => {
    onAddToCart();
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1500);
  };

  const kitInfo = getKitDetails(selectedKitSize);
  const isSingleUnit = !selectedKitSize || selectedKitSize.includes('1 unidade');

  // Dynamic price calculation that strictly updates when changing unit / quantity / kit
  let totalPrice: number;
  let originalTotalPrice: number;

  if (isSingleUnit) {
    totalPrice = variation.price * quantity;
    originalTotalPrice = variation.originalPrice * quantity;
  } else {
    if (quantity === kitInfo.units || quantity === 1) {
      totalPrice = kitInfo.price;
      originalTotalPrice = kitInfo.originalPrice;
    } else {
      const kitMultiplier = quantity > kitInfo.units ? Math.ceil(quantity / kitInfo.units) : quantity;
      totalPrice = Number((kitInfo.price * kitMultiplier).toFixed(2));
      originalTotalPrice = Number((kitInfo.originalPrice * kitMultiplier).toFixed(2));
    }
  }

  const discountPercent = Math.round(((originalTotalPrice - totalPrice) / originalTotalPrice) * 100);
  const [totalInt, totalDec] = totalPrice.toFixed(2).split('.');

  return (
    <div className="w-full bg-white rounded-lg border border-gray-200 p-4 sm:p-5 shadow-sm text-gray-800 flex flex-col gap-4 sticky top-4">
      {/* Top condition & sold count */}
      <div className="flex items-center justify-between text-xs text-neutral-500">
        <span>
          {PRODUCT_DATA.condition} | {PRODUCT_DATA.soldQuantity}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleFavorite}
            className={`p-1 rounded hover:bg-neutral-100 transition-colors ${
              isFavorite ? 'text-[#e63946]' : 'text-neutral-400 hover:text-neutral-600'
            }`}
            title="Favoritar"
          >
            <Heart size={18} className={isFavorite ? 'fill-[#e63946]' : ''} />
          </button>
          <button
            onClick={onOpenShare}
            className="p-1 rounded hover:bg-neutral-100 text-neutral-400 hover:text-neutral-600 transition-colors"
            title="Compartilhar"
          >
            <Share2 size={18} />
          </button>
        </div>
      </div>

      {/* Title */}
      <h1 className="text-lg sm:text-xl font-semibold text-neutral-900 leading-snug">
        {!isSingleUnit ? `${selectedKitSize} - ` : ''}
        Spray Borracha Líquida Dryko Impermeabilizante {variation.colorName} 400ml
      </h1>

      {/* Ratings */}
      <div className="flex items-center gap-2 text-xs">
        <span className="font-semibold text-neutral-800">4.8</span>
        <div className="flex text-[#3483fa]">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star key={s} size={14} className="fill-[#3483fa]" />
          ))}
        </div>
        <a href="#opinioes" className="text-[#3483fa] hover:underline">
          ({PRODUCT_DATA.reviewsCount} avaliações)
        </a>
      </div>

      {/* Price block */}
      <div className="border-t border-neutral-100 pt-2.5 flex flex-col">
        {/* Previous strike price */}
        <span className="text-xs text-neutral-400 line-through">
          R$ {originalTotalPrice.toFixed(2).replace('.', ',')}
        </span>

        {/* Current price with currency symbol and big fraction */}
        <div className="flex items-baseline gap-2">
          <div className="flex items-baseline text-neutral-900 font-light text-3xl">
            <span className="text-lg mr-1 font-normal">R$</span>
            <span className="font-semibold">{totalInt}</span>
            <span className="text-base font-normal">
              ,{totalDec}
            </span>
          </div>
          <span className="text-sm font-semibold text-[#00a650]">
            {discountPercent}% OFF
          </span>
        </div>

        <div className="flex items-center justify-between mt-1">
          <span className="text-xs text-neutral-800 font-medium">
            no <span className="text-[#00a650] font-bold">Pix</span> com aprovação imediata
          </span>
          <button
            type="button"
            onClick={onOpenPaymentModal}
            className="text-xs text-[#3483fa] hover:underline font-medium cursor-pointer"
          >
            Ver pagamento Pix
          </button>
        </div>
      </div>

      {/* Selos de Confiança: Devolução grátis, Compra garantida, Mercado Pontos */}
      <div id="trust-badges-block" className="bg-[#f8f9fa] border border-neutral-200/90 rounded-lg p-2.5 my-1">
        <div className="grid grid-cols-3 divide-x divide-neutral-200 text-center">
          <div className="flex flex-col items-center px-1">
            <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center text-[#3483fa] mb-1">
              <RotateCcw size={13} />
            </div>
            <span className="text-[11px] font-semibold text-neutral-800 leading-tight">
              Devolução grátis
            </span>
            <span className="text-[10px] text-neutral-500 mt-0.5">30 dias</span>
          </div>

          <div className="flex flex-col items-center px-1">
            <div className="w-6 h-6 rounded-full bg-emerald-50 flex items-center justify-center text-[#00a650] mb-1">
              <ShieldCheck size={13} />
            </div>
            <span className="text-[11px] font-semibold text-neutral-800 leading-tight">
              Compra garantida
            </span>
            <span className="text-[10px] text-neutral-500 mt-0.5">100% protegida</span>
          </div>

          <div className="flex flex-col items-center px-1">
            <div className="w-6 h-6 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 mb-1">
              <Award size={13} />
            </div>
            <span className="text-[11px] font-semibold text-neutral-800 leading-tight">
              Mercado Pontos
            </span>
            <span className="text-[10px] text-neutral-500 mt-0.5">+ Pontos Meli</span>
          </div>
        </div>
      </div>

      {/* Kit Size Section */}
      {onSelectKitSize && (
        <div className="border-t border-neutral-100 pt-2.5">
          <div className="flex items-center justify-between mb-1.5 text-xs">
            <span className="font-semibold text-neutral-800">Opção de Kit:</span>
            <span className="text-neutral-600 font-medium text-[11px] truncate">{selectedKitSize}</span>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {PRODUCT_DATA.kitSizes.map((k, idx) => {
              const isSelected = selectedKitSize === k.label;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onSelectKitSize(k.label)}
                  className={`px-2.5 py-1.5 rounded text-[11px] font-medium border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-[#3483fa] text-[#3483fa] bg-blue-50/40 font-semibold ring-1 ring-[#3483fa]'
                      : 'border-neutral-200 text-neutral-700 hover:border-neutral-300 bg-white'
                  }`}
                >
                  <span className="truncate block font-medium">{k.label}</span>
                  <span className="text-[10px] text-[#00a650] font-bold mt-0.5">
                    R$ {k.price.toFixed(2).replace('.', ',')}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Variation Section: Color Selector (Compact) */}
      {onSelectVariation && (
        <div className="border-t border-neutral-100 pt-2.5">
          <div className="flex items-center gap-1.5 mb-2 text-xs">
            <span className="font-semibold text-neutral-800">Cor:</span>
            <span className="text-neutral-600 font-medium capitalize">{variation.colorName}</span>
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {PRODUCT_DATA.variations.map((v) => {
              const isSelected = v.id === variation.id;
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => onSelectVariation(v)}
                  className={`flex flex-col items-center p-1 rounded border text-center transition-all cursor-pointer ${
                    isSelected
                      ? 'border-[#3483fa] ring-1.5 ring-[#3483fa] bg-blue-50/30'
                      : 'border-neutral-200 hover:border-neutral-400 bg-white'
                  }`}
                  title={v.colorName}
                >
                  <img
                    src={v.image}
                    alt={v.colorName}
                    className="w-7 h-7 object-contain rounded-xs"
                  />
                  <span className="text-[10px] font-medium text-neutral-700 truncate w-full mt-0.5 capitalize">
                    {v.colorName}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Shipping Box (Compact) */}
      <div className="border-t border-neutral-100 pt-2.5 space-y-1.5">
        <div className="flex items-start gap-2">
          <div className="p-0.5 rounded text-[#00a650] mt-0.5">
            <Truck size={17} />
          </div>
          <div className="flex flex-col text-xs leading-tight">
            <div className="flex items-center gap-1.5">
              <span className="text-[#00a650] font-bold text-sm">Frete grátis</span>
              <span className="inline-flex items-center gap-0.5 bg-[#00a650] text-white text-[10px] font-black px-1.5 py-0.2 rounded-xs">
                <Zap size={10} className="fill-white" />
                FULL
              </span>
            </div>
            <span className="text-neutral-700 font-medium mt-0.5">
              Chegará amanhã na sua casa
            </span>
          </div>
        </div>

        {/* Location selector */}
        <div className="pl-6 text-xs flex items-center justify-between">
          <span className="text-neutral-500 truncate">
            {userLocationLabel ? `Enviar para ${userLocationLabel}` : 'Enviar para sua região'}
          </span>
          <button
            type="button"
            onClick={onOpenCepModal}
            className="text-[#3483fa] hover:underline font-medium cursor-pointer shrink-0 ml-1"
          >
            CEP {cep}
          </button>
        </div>
      </div>

      {/* Stock & Quantity Picker (Inline) */}
      <div className="border-t border-neutral-100 pt-2.5 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-xs font-semibold text-neutral-800">
            Estoque disponível
          </span>
          <span className="text-[11px] text-neutral-400 font-normal">
            (+{PRODUCT_DATA.stock} disponíveis)
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-xs text-neutral-600">Qtd:</span>
          <select
            id="product-quantity-select"
            value={quantity}
            onChange={(e) => onQuantityChange(Number(e.target.value))}
            className="text-xs font-semibold px-2.5 py-1.5 border border-neutral-300 rounded bg-white text-neutral-800 outline-none focus:border-[#3483fa] cursor-pointer"
            aria-label="Selecionar quantidade"
          >
            {[1, 2, 3, 4, 5, 6, 10].map((num) => (
              <option key={num} value={num}>
                {num} {num === 1 ? 'unidade' : 'unidades'}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* CTAs - COMPRAR AGORA & ADICIONAR AO CARRINHO (HIGHER UP) */}
      <div className="space-y-2 pt-1">
        <button
          id="buy-now-btn"
          type="button"
          onClick={onBuyNow}
          className="w-full py-3 bg-[#3483fa] hover:bg-[#2968c8] active:scale-[0.99] text-white text-sm font-semibold rounded-md transition-all shadow-xs cursor-pointer text-center block"
        >
          Comprar agora
        </button>

        <button
          type="button"
          onClick={handleAdd}
          className={`w-full py-3 text-sm font-semibold rounded-md transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            addedAnimation
              ? 'bg-[#00a650] text-white'
              : 'bg-[#d9e7fb] text-[#3483fa] hover:bg-[#cbe0f8]'
          }`}
        >
          {addedAnimation ? (
            <>
              <CheckCircle2 size={16} />
              <span>Adicionado ao carrinho!</span>
            </>
          ) : (
            <span>Adicionar ao carrinho</span>
          )}
        </button>
      </div>

      {/* Trust & Guarantee Info */}
      <div className="border-t border-neutral-100 pt-3 space-y-2.5 text-xs text-neutral-600">
        <div className="flex items-start gap-2">
          <RotateCcw size={15} className="text-[#3483fa] shrink-0 mt-0.5" />
          <span>
            <a href="#" className="text-[#3483fa] hover:underline font-medium">
              Devolução grátis.
            </a>{' '}
            Você tem 30 dias a partir da data de recebimento.
          </span>
        </div>

        <div className="flex items-start gap-2">
          <ShieldCheck size={15} className="text-[#3483fa] shrink-0 mt-0.5" />
          <span>
            <a href="#" className="text-[#3483fa] hover:underline font-medium">
              Compra Garantida
            </a>
            , receba o produto que está esperando ou devolvemos o dinheiro.
          </span>
        </div>

        <div className="flex items-start gap-2">
          <Trophy size={15} className="text-[#3483fa] shrink-0 mt-0.5" />
          <span>
            12 meses de garantia de fábrica Dryko.
          </span>
        </div>
      </div>

      {/* Official Seller Card */}
      <div className="border-t border-neutral-100 pt-3 text-xs space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-neutral-500 font-normal">Vendido por</span>
          <span className="text-[#3483fa] font-semibold">{PRODUCT_DATA.seller.name}</span>
        </div>

        <div className="bg-[#f5f5f5] p-2.5 rounded text-neutral-700 space-y-1.5">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-[#00a650] text-[11px] uppercase tracking-wide">
              {PRODUCT_DATA.seller.level}
            </span>
          </div>
          <p className="text-[11px] text-neutral-500">
            {PRODUCT_DATA.seller.levelDescription}
          </p>

          {/* 5-bar reputation indicator */}
          <div className="grid grid-cols-5 gap-1 pt-1">
            <div className="h-1 bg-[#fff159] rounded-xs" />
            <div className="h-1 bg-[#fff159] rounded-xs" />
            <div className="h-1 bg-[#a6e3a1] rounded-xs" />
            <div className="h-1 bg-[#00a650] rounded-xs" />
            <div className="h-1.5 -mt-0.5 bg-[#00a650] rounded-xs shadow-xs" />
          </div>

          <div className="grid grid-cols-3 gap-1 pt-2 text-[10px] text-center text-neutral-600">
            <div className="border-r border-neutral-200 pr-1">
              <span className="font-bold text-neutral-800 block">+50mil</span>
              <span>vendas concluídas</span>
            </div>
            <div className="border-r border-neutral-200 px-1">
              <span className="font-bold text-[#00a650] block">Bom</span>
              <span>atendimento</span>
            </div>
            <div className="pl-1">
              <span className="font-bold text-[#00a650] block">No prazo</span>
              <span>entregas</span>
            </div>
          </div>
        </div>

        <a
          href="#"
          className="block text-center text-xs text-[#3483fa] hover:underline font-medium pt-1"
        >
          Ver mais dados deste vendedor
        </a>
      </div>
    </div>
  );
};
