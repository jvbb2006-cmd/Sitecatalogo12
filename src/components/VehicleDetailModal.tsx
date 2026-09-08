import React, { useState, useEffect } from 'react';
import { Vehicle } from '../types';
import {
  IconClose,
  IconCalendar,
  IconMileage,
  IconFuel,
  IconTransmission,
  IconCheck,
  IconWhatsApp,
  IconFinance,
  IconTestDrive,
  IconShare,
  IconSold,
  IconArrow,
  IconShield,
} from './icons';
import { formatCurrency, formatKm, getWhatsAppLink } from '../utils/formatters';

interface VehicleDetailModalProps {
  vehicle: Vehicle;
  onClose: () => void;
  onOpenLeadModal: (type: 'contato' | 'financiamento' | 'agendamento_visita', vehicle: Vehicle) => void;
  onSelectSimilarVehicle: (vehicle: Vehicle) => void;
  whatsappNumber?: string;
}

export const VehicleDetailModal: React.FC<VehicleDetailModalProps> = ({
  vehicle,
  onClose,
  onOpenLeadModal,
  onSelectSimilarVehicle,
  whatsappNumber = '5511999998888',
}) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [copiedShare, setCopiedShare] = useState(false);

  // Financing Simulator State
  const [showSimulator, setShowSimulator] = useState(false);
  const isSold = vehicle.status === 'vendido';
  const isReserved = vehicle.status === 'reservado';
  const currentPrice =
    vehicle.preco_promocional > 0 && vehicle.preco_promocional < vehicle.preco
      ? vehicle.preco_promocional
      : vehicle.preco;

  const [entryPercent, setEntryPercent] = useState(30); // 30% default entry
  const [installments, setInstallments] = useState(48);

  const entryValue = Math.round((currentPrice * entryPercent) / 100);
  const financedAmount = Math.max(0, currentPrice - entryValue);
  // Realistic financial formula with 1.49% a.m. tax
  const monthlyRate = 0.0149;
  const monthlyPayment =
    installments > 0
      ? Math.round((financedAmount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -installments)))
      : 0;

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const imagesList =
    vehicle.images && vehicle.images.length > 0
      ? vehicle.images
      : [vehicle.cover_image || 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80'];

  const whatsAppLink = getWhatsAppLink(
    whatsappNumber,
    `Olá! Vi o ${vehicle.marca} ${vehicle.modelo} no site da concessionária e gostaria de receber mais informações.`
  );

  const handleShare = async () => {
    const shareData = {
      title: `${vehicle.marca} ${vehicle.modelo} - AutoPrime`,
      text: `Confira este ${vehicle.marca} ${vehicle.modelo} (${vehicle.ano_modelo}) por ${formatCurrency(currentPrice)} na AutoPrime!`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err) {
        // Fallback to clipboard
      }
    }

    navigator.clipboard.writeText(window.location.href);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
      <div className="relative bg-[#11151d] border border-white/10 rounded-3xl w-full max-w-5xl max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col">
        {/* Modal Sticky Header with Title and Close Button */}
        <div className="sticky top-0 z-30 bg-[#11151d]/95 backdrop-blur-md px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20">
              {vehicle.marca}
            </span>
            <h2 className="text-lg font-bold text-white tracking-tight truncate font-['Space_Grotesk']">
              {vehicle.modelo} <span className="font-normal text-gray-400">{vehicle.versao}</span>
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-2 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 text-xs flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-amber-500"
              title="Compartilhar veículo"
            >
              <IconShare className="w-4 h-4" />
              <span className="hidden sm:inline">{copiedShare ? 'Copiado!' : 'Compartilhar'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500"
              aria-label="Fechar janela"
            >
              <IconClose className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-8">
          {/* Top Section: Gallery and Main Info */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Gallery Column (7 cols) */}
            <div className="lg:col-span-7 flex flex-col gap-3">
              {/* Main Photo */}
              <div className="relative aspect-[16/10] bg-black/60 rounded-2xl overflow-hidden border border-white/10 shadow-lg group">
                <img
                  src={imagesList[activeImageIndex]}
                  alt={`${vehicle.marca} ${vehicle.modelo}`}
                  className="w-full h-full object-cover transition-all duration-300"
                />

                {/* Status Badges on Image */}
                <div className="absolute top-3 left-3 flex gap-2">
                  {isSold ? (
                    <span className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-md bg-rose-600 text-white shadow-lg">
                      <IconSold className="w-4 h-4" />
                      Vendido
                    </span>
                  ) : isReserved ? (
                    <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-md bg-amber-600 text-white shadow-lg">
                      Reservado
                    </span>
                  ) : (
                    <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-md bg-emerald-600 text-white shadow-lg">
                      Disponível
                    </span>
                  )}
                  {vehicle.condicao && (
                    <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-md bg-white/20 backdrop-blur-md text-white shadow-lg">
                      {vehicle.condicao}
                    </span>
                  )}
                </div>

                {/* Image Navigation Arrows */}
                {imagesList.length > 1 && (
                  <>
                    <button
                      onClick={() =>
                        setActiveImageIndex((prev) =>
                          prev === 0 ? imagesList.length - 1 : prev - 1
                        )
                      }
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-white flex items-center justify-center hover:bg-black/90 transition-all opacity-0 group-hover:opacity-100"
                      aria-label="Foto anterior"
                    >
                      <IconArrow className="w-4 h-4" direction="left" />
                    </button>
                    <button
                      onClick={() =>
                        setActiveImageIndex((prev) =>
                          prev === imagesList.length - 1 ? 0 : prev + 1
                        )
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-white flex items-center justify-center hover:bg-black/90 transition-all opacity-0 group-hover:opacity-100"
                      aria-label="Próxima foto"
                    >
                      <IconArrow className="w-4 h-4" direction="right" />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnails Row */}
              {imagesList.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
                  {imagesList.map((url, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative w-20 aspect-[16/10] rounded-lg overflow-hidden shrink-0 border-2 transition-all ${
                        activeImageIndex === idx
                          ? 'border-amber-400 scale-102 shadow-md'
                          : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={url} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Specs & Purchase Column (5 cols) */}
            <div className="lg:col-span-5 flex flex-col justify-between bg-[#161a24] border border-white/10 rounded-2xl p-6">
              <div>
                {/* Price Display */}
                <div className="pb-4 border-b border-white/10">
                  <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">
                    Preço à vista
                  </div>
                  {vehicle.preco_promocional > 0 &&
                  vehicle.preco_promocional < vehicle.preco ? (
                    <div>
                      <span className="text-sm text-gray-500 line-through">
                        {formatCurrency(vehicle.preco)}
                      </span>
                      <div className="text-3xl sm:text-4xl font-black text-emerald-400 font-['Space_Grotesk']">
                        {formatCurrency(vehicle.preco_promocional)}
                      </div>
                      <span className="inline-block mt-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                        Economia de {formatCurrency(vehicle.preco - vehicle.preco_promocional)}
                      </span>
                    </div>
                  ) : (
                    <div className="text-3xl sm:text-4xl font-black text-white font-['Space_Grotesk']">
                      {formatCurrency(vehicle.preco)}
                    </div>
                  )}
                </div>

                {/* Main Specs Grid */}
                <div className="grid grid-cols-2 gap-3 my-5 text-xs text-gray-300">
                  <div className="bg-[#11141c] p-2.5 rounded-xl border border-white/5">
                    <span className="text-gray-500 block mb-0.5">Ano Fabricação/Modelo</span>
                    <strong className="text-white text-sm">
                      {vehicle.ano_fabricacao} / {vehicle.ano_modelo}
                    </strong>
                  </div>

                  <div className="bg-[#11141c] p-2.5 rounded-xl border border-white/5">
                    <span className="text-gray-500 block mb-0.5">Quilometragem</span>
                    <strong className="text-white text-sm">{formatKm(vehicle.km)}</strong>
                  </div>

                  <div className="bg-[#11141c] p-2.5 rounded-xl border border-white/5">
                    <span className="text-gray-500 block mb-0.5">Câmbio</span>
                    <strong className="text-white text-sm">{vehicle.cambio}</strong>
                  </div>

                  <div className="bg-[#11141c] p-2.5 rounded-xl border border-white/5">
                    <span className="text-gray-500 block mb-0.5">Combustível</span>
                    <strong className="text-white text-sm">{vehicle.combustivel}</strong>
                  </div>

                  <div className="bg-[#11141c] p-2.5 rounded-xl border border-white/5">
                    <span className="text-gray-500 block mb-0.5">Cor</span>
                    <strong className="text-white text-sm">{vehicle.cor}</strong>
                  </div>

                  <div className="bg-[#11141c] p-2.5 rounded-xl border border-white/5">
                    <span className="text-gray-500 block mb-0.5">Portas / Final Placa</span>
                    <strong className="text-white text-sm">
                      {vehicle.portas} portas {vehicle.placa_final ? `(Final ${vehicle.placa_final})` : ''}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Action Buttons Column */}
              <div className="pt-4 border-t border-white/10 flex flex-col gap-2.5">
                <a
                  href={whatsAppLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-black bg-emerald-400 hover:bg-emerald-300 shadow-lg shadow-emerald-500/20 text-sm transition-transform hover:scale-102"
                >
                  <IconWhatsApp className="w-5 h-5" />
                  <span>Falar no WhatsApp</span>
                </a>

                {isSold ? (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-center text-xs text-rose-300 font-medium">
                    Este veículo já foi vendido. Confira abaixo nossos modelos semelhantes em estoque!
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => onOpenLeadModal('contato', vehicle)}
                      className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-black bg-amber-400 hover:bg-amber-300 text-sm transition-colors"
                    >
                      <span>Tenho interesse neste veículo</span>
                    </button>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setShowSimulator(!showSimulator)}
                        className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-semibold text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                      >
                        <IconFinance className="w-4 h-4 text-amber-400" />
                        <span>Simular parcelas</span>
                      </button>

                      <button
                        onClick={() => onOpenLeadModal('agendamento_visita', vehicle)}
                        className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-semibold text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                      >
                        <IconTestDrive className="w-4 h-4 text-amber-400" />
                        <span>Agendar visita</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Interactive Financing Simulator Section */}
          {showSimulator && !isSold && (
            <div className="bg-[#161a24] border border-amber-500/30 rounded-2xl p-6 relative">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400">
                    <IconFinance className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white font-['Space_Grotesk']">
                      Simulador de Financiamento
                    </h3>
                    <p className="text-xs text-gray-400">
                      Cálculo prévio estimado com taxas a partir de 1,49% a.m.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setShowSimulator(false)}
                  className="text-gray-400 hover:text-white text-xs"
                >
                  Fechar
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                {/* Entry Slider */}
                <div>
                  <div className="flex justify-between text-xs text-gray-300 mb-1">
                    <span>Entrada ({entryPercent}%):</span>
                    <strong className="text-amber-400">{formatCurrency(entryValue)}</strong>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="80"
                    step="5"
                    value={entryPercent}
                    onChange={(e) => setEntryPercent(Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-gray-500 mt-1">
                    <span>10% min</span>
                    <span>50%</span>
                    <span>80% max</span>
                  </div>
                </div>

                {/* Installments selector */}
                <div>
                  <label className="block text-xs text-gray-300 mb-1 font-medium">
                    Prazo de Financiamento
                  </label>
                  <select
                    value={installments}
                    onChange={(e) => setInstallments(Number(e.target.value))}
                    className="w-full bg-[#11141c] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="12">12 parcelas</option>
                    <option value="24">24 parcelas</option>
                    <option value="36">36 parcelas</option>
                    <option value="48">48 parcelas (Recomendado)</option>
                    <option value="60">60 parcelas</option>
                  </select>
                </div>

                {/* Calculated Result */}
                <div className="bg-[#11141c] p-4 rounded-xl border border-white/10 flex flex-col justify-center">
                  <span className="text-[11px] text-gray-400">Parcela mensal estimada:</span>
                  <div className="text-2xl font-black text-amber-400 font-['Space_Grotesk']">
                    {installments}x de {formatCurrency(monthlyPayment)}
                  </div>
                  <button
                    onClick={() => onOpenLeadModal('financiamento', vehicle)}
                    className="mt-2 text-xs font-semibold text-white bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 py-1.5 px-3 rounded-lg text-center"
                  >
                    Solicitar aprovação formal
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Description & Optionals */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-4 border-t border-white/10">
            {/* Description */}
            <div className="lg:col-span-7">
              <h3 className="text-lg font-bold text-white mb-3 font-['Space_Grotesk']">
                Descrição do Veículo
              </h3>
              <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line bg-[#151922] border border-white/5 p-5 rounded-2xl">
                {vehicle.descricao ||
                  'Veículo em excelente estado de conservação, periciado e com laudo cautelar 100% aprovado. Revisões em dia e documentação liberada para transferência imediata.'}
              </p>
            </div>

            {/* Features / Optionals List */}
            <div className="lg:col-span-5">
              <h3 className="text-lg font-bold text-white mb-3 font-['Space_Grotesk']">
                Itens de Série e Opcionais
              </h3>
              {vehicle.features && vehicle.features.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {vehicle.features.map((feat, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 p-2.5 rounded-xl bg-[#151922] border border-white/5 text-xs text-gray-300"
                    >
                      <IconCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="truncate">{feat}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-500 italic">
                  Itens completos disponíveis para consulta com o consultor.
                </p>
              )}
            </div>
          </div>

          {/* Similar Vehicles Carousel / Section */}
          {vehicle.similar && vehicle.similar.length > 0 && (
            <div className="pt-8 border-t border-white/10">
              <h3 className="text-lg font-bold text-white mb-4 font-['Space_Grotesk']">
                Veículos Semelhantes em Estoque
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {vehicle.similar.map((sim) => (
                  <div
                    key={sim.id}
                    onClick={() => onSelectSimilarVehicle(sim)}
                    className="group cursor-pointer bg-[#151922] border border-white/10 hover:border-amber-500/50 rounded-xl overflow-hidden p-3 transition-all hover:-translate-y-1"
                  >
                    <div className="aspect-[16/10] bg-black/40 rounded-lg overflow-hidden mb-2">
                      <img
                        src={sim.cover_image}
                        alt={`${sim.marca} ${sim.modelo}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <span className="text-[10px] text-gray-400 uppercase font-semibold">
                      {sim.marca}
                    </span>
                    <h4 className="text-sm font-bold text-white truncate group-hover:text-amber-400">
                      {sim.modelo}
                    </h4>
                    <div className="text-sm font-black text-white mt-1">
                      {formatCurrency(sim.preco_promocional > 0 ? sim.preco_promocional : sim.preco)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
