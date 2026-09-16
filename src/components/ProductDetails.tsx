import React, { useState } from 'react';
import {
  Star,
  Check,
  Send,
  ThumbsUp,
  Award,
  ChevronDown,
  Info,
  ShieldCheck,
  Flame,
} from 'lucide-react';
import {
  PRODUCT_DATA,
  ProductVariation,
  QuestionItem,
  ReviewItem,
} from '../data/productData';

interface ProductDetailsProps {
  selectedVariation: ProductVariation;
  onSelectVariation: (variation: ProductVariation) => void;
  selectedKitSize: string;
  onSelectKitSize: (kit: string) => void;
}

export const ProductDetails: React.FC<ProductDetailsProps> = ({
  selectedVariation,
  onSelectVariation,
  selectedKitSize,
  onSelectKitSize,
}) => {
  const [questions, setQuestions] = useState<QuestionItem[]>(PRODUCT_DATA.questions);
  const [newQuestionText, setNewQuestionText] = useState('');
  const [questionSubmitting, setQuestionSubmitting] = useState(false);
  const [reviewFilter, setReviewFilter] = useState<string>('todas');
  const [helpfulReviews, setHelpfulReviews] = useState<{ [id: string]: boolean }>({});

  const handleAskQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestionText.trim()) return;

    setQuestionSubmitting(true);
    const userQ: QuestionItem = {
      id: `q_${Date.now()}`,
      question: newQuestionText.trim(),
      date: 'Hoje',
      answer:
        'Olá! Agradecemos sua pergunta. Sim, o kit de 3 sprays Dryko impermeabilizante atende perfeitamente para essa finalidade, oferecendo alta aderência e vedação flexível. Produto original com envio imediato Full. Ficamos à disposição!',
      answerDate: 'Há poucos instantes',
    };

    setTimeout(() => {
      setQuestions([userQ, ...questions]);
      setNewQuestionText('');
      setQuestionSubmitting(false);
    }, 600);
  };

  const toggleHelpful = (id: string) => {
    setHelpfulReviews((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredReviews = PRODUCT_DATA.reviews.filter((r) => {
    if (reviewFilter === 'todas') return true;
    if (reviewFilter === '5') return r.rating === 5;
    if (reviewFilter === '4') return r.rating === 4;
    return true;
  });

  return (
    <div className="flex flex-col gap-8 w-full text-neutral-800">
      {/* Best Seller Ribbon on top of variations */}
      <div className="flex items-center gap-2">
        <span className="bg-[#ff7733] text-white text-[11px] font-bold px-2 py-0.5 rounded-xs tracking-wide uppercase">
          MAIS VENDIDO
        </span>
        <a
          href="#"
          className="text-xs text-[#3483fa] hover:underline font-medium"
        >
          {PRODUCT_DATA.ranking}
        </a>
      </div>

      {/* Variation Section: Color Selector */}
      <div className="border-b border-neutral-200 pb-5">
        <div className="flex items-center gap-2 mb-2.5">
          <span className="text-sm font-semibold text-neutral-900">Cor:</span>
          <span className="text-sm text-neutral-700 font-medium capitalize">
            {selectedVariation.colorName}
          </span>
        </div>

        <div className="flex flex-wrap gap-2.5">
          {PRODUCT_DATA.variations.map((v) => {
            const isSelected = v.id === selectedVariation.id;
            return (
              <button
                key={v.id}
                type="button"
                onClick={() => onSelectVariation(v)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'border-[#3483fa] ring-1 ring-[#3483fa] bg-blue-50/20'
                    : 'border-neutral-300 hover:border-neutral-400 bg-white'
                }`}
              >
                <img
                  src={v.image}
                  alt={v.colorName}
                  className="w-8 h-8 object-contain rounded-xs border border-neutral-100"
                />
                <div className="flex flex-col text-xs leading-tight">
                  <span className="font-semibold text-neutral-800">{v.colorName}</span>
                  <span className="text-neutral-500 font-medium">
                    R$ {v.price.toFixed(2).replace('.', ',')}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Variation Section: Kit Sizes */}
      <div className="border-b border-neutral-200 pb-5">
        <div className="flex items-center gap-2 mb-2.5">
          <span className="text-sm font-semibold text-neutral-900">
            Quantidade de unidades por kit:
          </span>
          <span className="text-sm text-neutral-700 font-medium">
            {selectedKitSize}
          </span>
        </div>

        <div className="flex flex-wrap gap-2.5">
          {PRODUCT_DATA.kitSizes.map((k, idx) => {
            const isSelected = selectedKitSize === k.label;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => onSelectKitSize(k.label)}
                className={`flex flex-col items-start px-3 py-2 rounded text-xs border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-[#3483fa] bg-blue-50/40 ring-1 ring-[#3483fa]'
                    : 'border-neutral-300 text-neutral-700 hover:border-neutral-400 bg-white'
                }`}
              >
                <span className={`font-semibold ${isSelected ? 'text-[#3483fa]' : 'text-neutral-800'}`}>
                  {k.label}
                </span>
                <span className="text-[11px] text-[#00a650] font-bold mt-0.5">
                  R$ {k.price.toFixed(2).replace('.', ',')}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* O que você precisa saber sobre este produto */}
      <div className="border-b border-neutral-200 pb-6">
        <h2 className="text-lg sm:text-xl font-normal text-neutral-900 mb-4">
          O que você precisa saber sobre este produto
        </h2>
        <ul className="space-y-2.5 text-sm text-neutral-700">
          {PRODUCT_DATA.highlights.map((h, i) => (
            <li key={i} className="flex items-start gap-2.5 leading-relaxed">
              <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-neutral-600 mt-2" />
              <span>{h}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Características do produto */}
      <div className="border-b border-neutral-200 pb-6">
        <h2 className="text-lg sm:text-xl font-normal text-neutral-900 mb-4">
          Características do produto
        </h2>

        <div className="rounded-md border border-neutral-200 overflow-hidden text-sm">
          <table className="w-full text-left border-collapse">
            <tbody>
              {PRODUCT_DATA.characteristics.map((c, i) => (
                <tr
                  key={i}
                  className={`border-b border-neutral-200 last:border-0 ${
                    i % 2 === 0 ? 'bg-[#f5f5f5]' : 'bg-white'
                  }`}
                >
                  <td className="w-1/3 sm:w-2/5 px-4 py-3 font-semibold text-neutral-800">
                    {c.label}
                  </td>
                  <td className="px-4 py-3 text-neutral-700">{c.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Descrição */}
      <div className="border-b border-neutral-200 pb-6">
        <h2 className="text-lg sm:text-xl font-normal text-neutral-900 mb-4">
          Descrição
        </h2>
        <div className="text-sm text-neutral-700 leading-relaxed space-y-4 whitespace-pre-line font-normal">
          {PRODUCT_DATA.description}
        </div>
      </div>

      {/* Perguntas e respostas */}
      <div className="border-b border-neutral-200 pb-6">
        <h2 className="text-lg sm:text-xl font-normal text-neutral-900 mb-2">
          Perguntas e respostas
        </h2>
        <p className="text-xs text-neutral-500 mb-4">
          Você tem alguma dúvida sobre o produto ou aplicação? Pergunte diretamente ao vendedor oficial.
        </p>

        {/* Input Question */}
        <form onSubmit={handleAskQuestion} className="flex gap-2 mb-6">
          <input
            type="text"
            value={newQuestionText}
            onChange={(e) => setNewQuestionText(e.target.value)}
            placeholder="Escreva uma pergunta..."
            className="flex-1 px-4 py-3 text-sm bg-white border border-neutral-300 rounded focus:border-[#3483fa] focus:ring-1 focus:ring-[#3483fa] outline-none"
            aria-label="Escreva sua pergunta"
          />
          <button
            type="submit"
            disabled={questionSubmitting || !newQuestionText.trim()}
            className="px-6 py-3 bg-[#3483fa] hover:bg-[#2968c8] disabled:opacity-50 text-white text-sm font-semibold rounded transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span>{questionSubmitting ? 'Enviando...' : 'Perguntar'}</span>
            <Send size={15} />
          </button>
        </form>

        {/* List of Q&As */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-neutral-900">Últimas feitas</h3>

          {questions.map((q) => (
            <div key={q.id} className="text-sm space-y-1.5 pt-2">
              <div className="flex items-start justify-between text-neutral-800">
                <span className="font-normal">{q.question}</span>
                <span className="text-xs text-neutral-400 shrink-0 ml-3">
                  {q.date}
                </span>
              </div>
              <div className="flex items-start gap-2 pl-3 text-neutral-600 border-l-2 border-neutral-200 text-[13px]">
                <span className="font-semibold text-neutral-800 shrink-0">
                  Resposta:
                </span>
                <span>{q.answer}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Opiniões sobre o produto */}
      <div>
        <h2 className="text-lg sm:text-xl font-normal text-neutral-900 mb-5">
          Opiniões sobre o produto
        </h2>

        {/* Review Score Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center mb-6">
          <div className="md:col-span-4 flex flex-col items-center md:items-start">
            <div className="text-5xl font-bold text-[#3483fa] leading-none mb-1">
              4.8
            </div>
            <div className="flex text-[#3483fa] mb-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} size={18} className="fill-[#3483fa]" />
              ))}
            </div>
            <span className="text-xs text-neutral-500">
              {PRODUCT_DATA.reviewsCount} avaliações
            </span>
          </div>

          {/* Rating Bars */}
          <div className="md:col-span-8 space-y-1.5 text-xs text-neutral-600">
            <div className="flex items-center gap-2">
              <span className="w-8">5 estrelas</span>
              <div className="flex-1 h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                <div className="h-full bg-[#3483fa] rounded-full w-[84%]" />
              </div>
              <span className="w-8 text-right text-neutral-400">84%</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-8">4 estrelas</span>
              <div className="flex-1 h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                <div className="h-full bg-[#3483fa] rounded-full w-[12%]" />
              </div>
              <span className="w-8 text-right text-neutral-400">12%</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-8">3 estrelas</span>
              <div className="flex-1 h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                <div className="h-full bg-[#3483fa] rounded-full w-[3%]" />
              </div>
              <span className="w-8 text-right text-neutral-400">3%</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-8">2 estrelas</span>
              <div className="flex-1 h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                <div className="h-full bg-[#3483fa] rounded-full w-[0.5%]" />
              </div>
              <span className="w-8 text-right text-neutral-400">1%</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-8">1 estrela</span>
              <div className="flex-1 h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                <div className="h-full bg-[#3483fa] rounded-full w-[0.5%]" />
              </div>
              <span className="w-8 text-right text-neutral-400">0%</span>
            </div>
          </div>
        </div>

        {/* Feature Tags */}
        <div className="flex flex-wrap gap-2 mb-6 text-xs">
          <span className="px-2.5 py-1 bg-neutral-100 text-neutral-700 rounded-full font-medium">
            Fácil de aplicar (42)
          </span>
          <span className="px-2.5 py-1 bg-neutral-100 text-neutral-700 rounded-full font-medium">
            Excelente vedação (38)
          </span>
          <span className="px-2.5 py-1 bg-neutral-100 text-neutral-700 rounded-full font-medium">
            Secagem rápida (29)
          </span>
          <span className="px-2.5 py-1 bg-neutral-100 text-neutral-700 rounded-full font-medium">
            Bom custo-benefício (25)
          </span>
        </div>

        {/* Reviews List */}
        <div className="space-y-4">
          {filteredReviews.map((rev) => {
            const isLiked = !!helpfulReviews[rev.id];
            return (
              <div
                key={rev.id}
                className="pt-4 pb-4 border-t border-neutral-200 text-sm space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex text-[#3483fa]">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} size={14} className="fill-[#3483fa]" />
                    ))}
                  </div>
                  <span className="text-xs text-neutral-400">{rev.date}</span>
                </div>

                <h4 className="font-semibold text-neutral-900 text-sm">
                  {rev.title}
                </h4>

                <p className="text-neutral-700 text-[13px] leading-relaxed">
                  {rev.comment}
                </p>

                <div className="flex items-center justify-between pt-1 text-xs text-neutral-400">
                  <span className="text-[11.5px]">{rev.variation}</span>
                  <button
                    type="button"
                    onClick={() => toggleHelpful(rev.id)}
                    className={`flex items-center gap-1.5 text-xs transition-colors cursor-pointer ${
                      isLiked ? 'text-[#3483fa] font-semibold' : 'hover:text-neutral-700'
                    }`}
                  >
                    <ThumbsUp size={13} className={isLiked ? 'fill-[#3483fa]' : ''} />
                    <span>É útil ({rev.helpfulCount + (isLiked ? 1 : 0)})</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
