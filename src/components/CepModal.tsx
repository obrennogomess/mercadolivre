import React, { useState, useEffect } from 'react';
import { X, MapPin, Truck, Navigation, Loader2 } from 'lucide-react';
import {
  UserLocation,
  formatCep,
  fetchLocationFromViaCep,
  requestGpsLocation,
} from '../utils/location';

interface CepModalProps {
  currentCep: string;
  currentLocation?: UserLocation | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveCep: (cep: string, location?: UserLocation) => void;
}

export const CepModal: React.FC<CepModalProps> = ({
  currentCep,
  currentLocation,
  isOpen,
  onClose,
  onSaveCep,
}) => {
  const [cepInput, setCepInput] = useState(currentCep);
  const [feedback, setFeedback] = useState('');
  const [loadingGps, setLoadingGps] = useState(false);
  const [searchingViaCep, setSearchingViaCep] = useState(false);
  const [previewLocation, setPreviewLocation] = useState<UserLocation | null>(currentLocation || null);

  useEffect(() => {
    if (isOpen) {
      setCepInput(currentCep);
      setPreviewLocation(currentLocation || null);
      setFeedback('');
    }
  }, [isOpen, currentCep, currentLocation]);

  if (!isOpen) return null;

  const handleInputChange = async (val: string) => {
    const formatted = formatCep(val);
    setCepInput(formatted);

    const clean = formatted.replace(/\D/g, '');
    if (clean.length === 8) {
      setSearchingViaCep(true);
      const loc = await fetchLocationFromViaCep(clean);
      setSearchingViaCep(false);
      if (loc) {
        setPreviewLocation(loc);
        setFeedback(`${loc.city} - ${loc.stateCode}`);
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCep = cepInput.replace(/\D/g, '');
    if (cleanCep.length >= 8) {
      const formatted = formatCep(cleanCep);
      let loc = previewLocation;
      if (!loc || loc.cep !== formatted) {
        loc = await fetchLocationFromViaCep(cleanCep);
      }
      onSaveCep(formatted, loc || undefined);
      setFeedback('Região e frete atualizados com sucesso!');
      setTimeout(() => {
        setFeedback('');
        onClose();
      }, 400);
    } else {
      setFeedback('Digite um CEP válido com 8 dígitos');
    }
  };

  const handleUseGps = async () => {
    setLoadingGps(true);
    setFeedback('Detectando sua região...');
    try {
      const loc = await requestGpsLocation();
      if (loc) {
        setCepInput(loc.cep);
        setPreviewLocation(loc);
        onSaveCep(loc.cep, loc);
        setFeedback(`Localizado: ${loc.city} - ${loc.stateCode}`);
        setTimeout(() => {
          setFeedback('');
          onClose();
        }, 500);
      } else {
        setFeedback('Não foi possível obter o GPS. Digite seu CEP.');
      }
    } catch {
      setFeedback('Permissão negada ou indisponível.');
    } finally {
      setLoadingGps(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        className="bg-white rounded-lg shadow-xl max-w-md w-full p-5 text-neutral-800 animate-in fade-in zoom-in-95 duration-150 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-700 p-1 cursor-pointer"
          aria-label="Fechar"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-2 mb-2">
          <MapPin size={22} className="text-[#3483fa]" />
          <h3 className="text-lg font-semibold text-neutral-900">
            Onde você quer receber suas compras?
          </h3>
        </div>

        <p className="text-xs text-neutral-600 mb-4 leading-relaxed">
          Os prazos e opções de entrega serão calculados de acordo com a sua região.
        </p>

        {/* Botão de Localização Automática / GPS */}
        <div className="mb-4">
          <button
            type="button"
            onClick={handleUseGps}
            disabled={loadingGps}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-blue-50 hover:bg-blue-100 text-[#3483fa] border border-blue-200 rounded-md text-xs font-semibold transition-colors cursor-pointer disabled:opacity-60"
          >
            {loadingGps ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Navigation size={16} />
            )}
            <span>Usar minha localização atual</span>
          </button>
        </div>

        <div className="relative flex py-1 items-center mb-4">
          <div className="flex-grow border-t border-neutral-200" />
          <span className="shrink mx-3 text-neutral-400 text-xs">ou informe seu CEP</span>
          <div className="flex-grow border-t border-neutral-200" />
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Digite seu CEP:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={cepInput}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder="Ex: 01001-000"
                maxLength={9}
                className="flex-1 px-3 py-2 text-sm border border-neutral-300 rounded focus:border-[#3483fa] outline-none"
              />
              <button
                type="submit"
                disabled={searchingViaCep}
                className="px-4 py-2 bg-[#3483fa] hover:bg-[#2968c8] text-white text-xs font-semibold rounded cursor-pointer transition-colors disabled:opacity-60"
              >
                {searchingViaCep ? 'Buscando...' : 'Confirmar'}
              </button>
            </div>

            {/* Feedback / Location Details */}
            {previewLocation && (
              <div className="mt-2 p-2 bg-neutral-50 rounded text-xs text-neutral-700 flex items-center gap-1.5 border border-neutral-100">
                <MapPin size={13} className="text-[#3483fa] shrink-0" />
                <span className="font-medium truncate">
                  {previewLocation.city} - {previewLocation.stateCode}
                  {previewLocation.neighborhood ? ` (${previewLocation.neighborhood})` : ''}
                </span>
              </div>
            )}

            {feedback && !previewLocation && (
              <span className="text-xs text-[#00a650] font-medium block mt-1.5">
                {feedback}
              </span>
            )}
          </div>

          <div className="border-t border-neutral-100 pt-3 flex items-center gap-2 text-xs text-[#00a650] font-medium">
            <Truck size={16} />
            <span>Frete grátis FULL e envio rápido para a sua localidade!</span>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="text-xs text-neutral-500 hover:text-neutral-800 px-3 py-1.5 cursor-pointer"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
