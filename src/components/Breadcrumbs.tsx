import React from 'react';
import { ChevronRight, Share2, Heart } from 'lucide-react';

interface BreadcrumbsProps {
  onOpenShare: () => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  onOpenShare,
  isFavorite,
  onToggleFavorite,
}) => {
  return (
    <div className="w-full max-w-[1200px] mx-auto px-3 sm:px-4 py-3 flex flex-wrap items-center justify-between text-xs text-neutral-600 gap-2">
      {/* Left breadcrumb links */}
      <div className="flex items-center flex-wrap gap-1.5 leading-none">
        <a
          href="#"
          className="text-[#3483fa] hover:underline font-medium flex items-center gap-1 mr-1"
        >
          Voltar à lista
        </a>
        <span className="text-neutral-300 font-light">|</span>

        <a href="#" className="hover:text-[#3483fa] transition-colors">
          Construção
        </a>
        <ChevronRight size={11} className="text-neutral-400" />

        <a href="#" className="hover:text-[#3483fa] transition-colors">
          Materiais de Construção
        </a>
        <ChevronRight size={11} className="text-neutral-400" />

        <a href="#" className="hover:text-[#3483fa] transition-colors">
          Impermeabilização
        </a>
        <ChevronRight size={11} className="text-neutral-400" />

        <a href="#" className="hover:text-[#3483fa] transition-colors">
          Mantas e Tintas Asfálticas
        </a>
        <ChevronRight size={11} className="text-neutral-400" />

        <span className="text-neutral-800 font-medium">Dryko</span>
      </div>

      {/* Right actions: Compartilhar & Vender um igual & Favorito */}
      <div className="flex items-center gap-4">
        <a
          href="#"
          className="hidden sm:inline text-[#3483fa] hover:underline text-xs"
        >
          Vender um igual
        </a>

        <button
          id="share-product-btn"
          onClick={onOpenShare}
          className="text-[#3483fa] hover:text-[#2968c8] flex items-center gap-1 text-xs font-medium cursor-pointer"
          title="Compartilhar este produto"
        >
          <Share2 size={14} />
          <span>Compartilhar</span>
        </button>

        <button
          id="favorite-product-btn"
          onClick={onToggleFavorite}
          className={`flex items-center gap-1 text-xs font-medium transition-colors cursor-pointer ${
            isFavorite
              ? 'text-[#e63946]'
              : 'text-[#3483fa] hover:text-[#2968c8]'
          }`}
          title={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
        >
          <Heart
            size={14}
            className={isFavorite ? 'fill-[#e63946]' : ''}
          />
          <span>{isFavorite ? 'Salvo' : 'Favorito'}</span>
        </button>
      </div>
    </div>
  );
};
