import React, { useState } from 'react';
import { Search, MapPin, ChevronDown, ShoppingCart, Bell, Menu, X } from 'lucide-react';

interface HeaderProps {
  cartCount: number;
  onOpenCart: () => void;
  cep: string;
  userCity?: string;
  onOpenCepModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  cartCount,
  onOpenCart,
  cep,
  userCity,
  onOpenCepModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('spray borracha liquida dryko');
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);

  const searchSuggestions = [
    'spray borracha liquida dryko',
    'spray borracha liquida dryko branco',
    'spray impermeabilizante vedatudo 400ml',
    'manta liquida spray dryko kit',
    'fita asfaltica vedacit adesiva',
    'cimento autonivelante artfix',
  ];

  const categories = [
    'Construção e Ferramentas',
    'Impermeabilizantes e Tintas',
    'Eletrodomésticos',
    'Informática e Celulares',
    'Casa, Móveis e Decoração',
    'Moda e Acessórios',
    'Supermercado',
    'Automotivo',
  ];

  return (
    <header className="w-full bg-[#fff159] text-gray-800 border-b border-gray-200 shadow-xs relative z-40">
      <div className="max-w-[1200px] mx-auto px-3 sm:px-4 py-2 sm:py-2.5">
        {/* Top Row: Logo, Search Bar, Banner Promo */}
        <div className="flex items-center justify-between gap-3 sm:gap-6">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <button
              id="mobile-menu-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 text-neutral-800 hover:bg-black/5 rounded"
              aria-label="Abrir menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <a
              href="#"
              className="flex items-center select-none transition-transform active:scale-95"
              title="Mercado Livre Brasil"
            >
              <img
                src="/mercado-livre-logo.png"
                alt="Mercado Livre"
                className="h-8 sm:h-9 md:h-10 w-auto object-contain shrink-0"
                referrerPolicy="no-referrer"
              />
            </a>
          </div>

          {/* Search Box */}
          <div className="flex-1 max-w-[600px] relative">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setShowSearchSuggestions(false);
              }}
              className="flex items-center w-full bg-white rounded-[2px] shadow-sm border border-transparent focus-within:border-[#3483fa] transition-all"
            >
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => setShowSearchSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSearchSuggestions(false), 200)}
                placeholder="Buscar produtos, marcas e muito mais…"
                className="w-full px-4 py-2.5 text-[15px] text-neutral-800 placeholder-neutral-400 outline-none bg-transparent"
                aria-label="Buscar produtos"
              />
              <span className="h-6 w-[1px] bg-neutral-200" />
              <button
                type="submit"
                id="search-btn"
                className="px-3.5 py-2.5 text-neutral-500 hover:text-neutral-800 transition-colors"
                title="Buscar"
              >
                <Search size={19} strokeWidth={2.2} />
              </button>
            </form>

            {/* Suggestions Dropdown */}
            {showSearchSuggestions && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-b shadow-lg border border-neutral-200 overflow-hidden z-50">
                <div className="px-3 py-1.5 text-xs text-neutral-400 font-medium">
                  Buscas populares
                </div>
                {searchSuggestions.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onMouseDown={() => {
                      setSearchTerm(item);
                      setShowSearchSuggestions(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-[#f5f5f5] flex items-center gap-2.5 transition-colors"
                  >
                    <Search size={14} className="text-neutral-400" />
                    <span>{item}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Banner / Meli+ Promo */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href="#"
              className="flex items-center gap-2 bg-transparent hover:opacity-90 transition-opacity"
              title="Assine o Meli+ com Disney+ incluso"
            >
              <img
                src="https://http2.mlstatic.com/D_NQ_988245-MLA114606762646_082026-OO.webp"
                alt="Promoção Plano Meli+ Disney+"
                className="h-9 w-auto object-contain rounded"
              />
            </a>
          </div>
        </div>

        {/* Bottom Row: Location CEP, Categories, Navigation Links, User Auth */}
        <div className="flex items-center justify-between mt-2 pt-1 text-[13px] text-neutral-700">
          {/* Left: Location Pin */}
          <button
            id="cep-btn"
            onClick={onOpenCepModal}
            className="flex items-center gap-1.5 px-2 py-1 -ml-2 rounded border border-transparent hover:border-black/20 hover:bg-black/5 transition-all text-left group"
          >
            <MapPin size={16} className="text-neutral-600 group-hover:text-black shrink-0" />
            <div className="leading-tight">
              <span className="block text-[10.5px] text-neutral-500">
                {userCity ? `Enviar para ${userCity}` : 'Enviar para'}
              </span>
              <span className="font-semibold text-[12.5px] text-neutral-800">
                CEP {cep}
              </span>
            </div>
          </button>

          {/* Middle: Links / Categories */}
          <nav className="hidden lg:flex items-center gap-5 text-neutral-700 font-normal">
            {/* Categories dropdown */}
            <div className="relative">
              <button
                id="categories-btn"
                onClick={() => setCategoriesOpen(!categoriesOpen)}
                className="flex items-center gap-1 hover:text-neutral-900 transition-colors py-1"
              >
                <span>Categorias</span>
                <ChevronDown size={14} className="text-neutral-500" />
              </button>

              {categoriesOpen && (
                <div
                  onMouseLeave={() => setCategoriesOpen(false)}
                  className="absolute top-full left-0 mt-1 w-64 bg-[#333333] text-white rounded shadow-xl py-2 z-50 text-sm"
                >
                  {categories.map((cat, i) => (
                    <a
                      key={i}
                      href="#"
                      className="block px-4 py-2 hover:bg-[#3483fa] hover:text-white transition-colors"
                      onClick={() => setCategoriesOpen(false)}
                    >
                      {cat}
                    </a>
                  ))}
                </div>
              )}
            </div>

            <a href="#" className="hover:text-neutral-900 transition-colors">
              Ofertas do dia
            </a>
            <a href="#" className="hover:text-neutral-900 transition-colors">
              Histórico
            </a>
            <a href="#" className="hover:text-neutral-900 transition-colors">
              Supermercado
            </a>
            <a href="#" className="hover:text-neutral-900 transition-colors">
              Moda
            </a>
            <a href="#" className="hover:text-neutral-900 transition-colors">
              Vender
            </a>
            <a href="#" className="hover:text-neutral-900 transition-colors">
              Contato
            </a>
          </nav>

          {/* Right: Auth, Orders, Cart */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-3">
              <a href="#" className="hover:text-neutral-900 transition-colors">
                Crie a sua conta
              </a>
              <a href="#" className="hover:text-neutral-900 transition-colors font-medium">
                Entre
              </a>
              <a href="#" className="hover:text-neutral-900 transition-colors">
                Minhas compras
              </a>
            </div>

            <button
              id="header-cart-btn"
              onClick={onOpenCart}
              className="relative p-1 text-neutral-800 hover:opacity-80 transition-opacity"
              aria-label={`Carrinho com ${cartCount} produtos`}
            >
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-2 min-w-4 h-4 px-1 bg-[#d93f3f] text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-4/5 max-w-xs bg-white h-full shadow-2xl p-5 overflow-y-auto flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
                <span className="font-bold text-lg text-[#2d3277]">Mercado Livre</span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 text-neutral-500 hover:text-black"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="py-4 border-b border-neutral-200">
                <p className="text-sm font-semibold text-neutral-800">Olá! Entre na sua conta</p>
                <div className="mt-3 flex gap-2">
                  <button className="flex-1 py-2 bg-[#3483fa] text-white text-xs font-semibold rounded">
                    Entrar
                  </button>
                  <button className="flex-1 py-2 border border-[#3483fa] text-[#3483fa] text-xs font-semibold rounded">
                    Criar conta
                  </button>
                </div>
              </div>

              <nav className="py-4 space-y-3 text-sm text-neutral-700">
                <a href="#" className="block hover:text-[#3483fa]">
                  Início
                </a>
                <a href="#" className="block hover:text-[#3483fa]">
                  Notificações
                </a>
                <a href="#" className="block hover:text-[#3483fa]">
                  Minhas compras
                </a>
                <a href="#" className="block hover:text-[#3483fa]">
                  Favoritos
                </a>
                <a href="#" className="block hover:text-[#3483fa]">
                  Ofertas do dia
                </a>
                <a href="#" className="block hover:text-[#3483fa]">
                  Meli+
                </a>
                <a href="#" className="block hover:text-[#3483fa]">
                  Mercado Play
                </a>
              </nav>
            </div>

            <div className="pt-4 border-t border-neutral-200 text-xs text-neutral-500">
              Versão web réplica exata
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
