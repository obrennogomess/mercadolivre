import React from 'react';
import { ShieldCheck, HelpCircle } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-white border-t border-neutral-200 mt-14 text-neutral-600 text-xs">
      {/* Top Value Props Strip */}
      <div className="border-b border-neutral-200 bg-[#f5f5f5] py-8">
        <div className="max-w-[1200px] mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-xs mb-3 text-[#00a650]">
              ⚡
            </div>
            <h4 className="font-semibold text-neutral-900 text-sm mb-1">
              Pague com Pix e aprovação imediata
            </h4>
            <p className="text-neutral-500 text-xs max-w-xs">
              Com o gateway SigiloPay, sua compra tem 40% de desconto e aprovação em segundos.
            </p>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-xs mb-3 text-[#00a650]">
              📦
            </div>
            <h4 className="font-semibold text-neutral-900 text-sm mb-1">
              Frete grátis a partir de R$ 79
            </h4>
            <p className="text-neutral-500 text-xs max-w-xs">
              Milhares de produtos com entrega rápida no mesmo dia ou no dia seguinte com o Full.
            </p>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-xs mb-3 text-[#3483fa]">
              🛡️
            </div>
            <h4 className="font-semibold text-neutral-900 text-sm mb-1">
              Segurança, do início ao fim
            </h4>
            <p className="text-neutral-500 text-xs max-w-xs">
              Não gostou do que comprou? Devolva o produto grátis e tenha seu dinheiro de volta.
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="max-w-[1200px] mx-auto px-4 py-6">
        <div className="flex flex-wrap gap-x-6 gap-y-2 mb-4 font-normal text-neutral-700">
          <a href="#" className="hover:text-black transition-colors">
            Trabalhe conosco
          </a>
          <a href="#" className="hover:text-black transition-colors">
            Termos e condições
          </a>
          <a href="#" className="hover:text-black transition-colors">
            Como cuidamos da sua privacidade
          </a>
          <a href="#" className="hover:text-black transition-colors">
            Acessibilidade
          </a>
          <a href="#" className="hover:text-black transition-colors">
            Contato
          </a>
          <a href="#" className="hover:text-black transition-colors">
            Informações sobre seguros
          </a>
          <a href="#" className="hover:text-black transition-colors">
            Programa de Afiliados
          </a>
          <a href="#" className="hover:text-black transition-colors">
            Consumidor.gov.br
          </a>
        </div>

        {/* Legal Text */}
        <div className="text-[11px] text-neutral-400 space-y-1 leading-relaxed border-t border-neutral-100 pt-4">
          <p>
            Copyright © 1999-2026 Mercado Livre Brasil Ltda.
          </p>
          <p>
            CNPJ n.º 03.007.331/0001-41 / Av. das Nações Unidas, nº 3.003, Bonfim, Osasco/SP - CEP 06233-903 - empresa do grupo Mercado Livre.
          </p>
        </div>
      </div>
    </footer>
  );
};
