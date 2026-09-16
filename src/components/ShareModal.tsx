import React, { useState } from 'react';
import { X, Copy, Check, MessageCircle, Send } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  productTitle: string;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  productTitle,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const whatsAppUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
    `Olha este produto no Mercado Livre: ${productTitle} - ${shareUrl}`
  )}`;

  const handleCopy = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        className="bg-white rounded-lg shadow-xl max-w-sm w-full p-5 text-neutral-800 animate-in fade-in zoom-in-95 duration-150 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-700 p-1 cursor-pointer"
        >
          <X size={20} />
        </button>

        <h3 className="text-base font-semibold text-neutral-900 mb-1">
          Compartilhar este produto
        </h3>
        <p className="text-xs text-neutral-500 mb-4 line-clamp-1">
          {productTitle}
        </p>

        <div className="flex justify-around py-3 border-y border-neutral-100 mb-4">
          <a
            href={whatsAppUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-1.5 text-xs text-neutral-700 hover:text-green-600 transition-colors cursor-pointer"
          >
            <div className="w-11 h-11 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-xs">
              <MessageCircle size={22} />
            </div>
            <span>WhatsApp</span>
          </a>

          <button
            onClick={handleCopy}
            className="flex flex-col items-center gap-1.5 text-xs text-neutral-700 hover:text-[#3483fa] transition-colors cursor-pointer"
          >
            <div className="w-11 h-11 rounded-full bg-neutral-100 text-neutral-700 flex items-center justify-center shadow-xs">
              {copied ? <Check size={20} className="text-[#00a650]" /> : <Copy size={20} />}
            </div>
            <span>{copied ? 'Copiado!' : 'Copiar link'}</span>
          </button>
        </div>

        <div className="flex items-center gap-2 bg-neutral-50 p-2 rounded border border-neutral-200 text-xs">
          <span className="truncate flex-1 text-neutral-500">{shareUrl}</span>
          <button
            onClick={handleCopy}
            className="px-2.5 py-1 bg-[#3483fa] text-white text-[11px] font-semibold rounded shrink-0 cursor-pointer"
          >
            {copied ? 'Copiado!' : 'Copiar'}
          </button>
        </div>
      </div>
    </div>
  );
};
