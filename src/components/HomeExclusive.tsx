import React, { useState, useMemo } from 'react';
import { CompanyConfig, Vehicle, FilterState } from '../types';
import {
  IconStar,
  IconArrow,
  IconWhatsApp,
  IconShield,
  IconSearch,
  IconCar,
  IconTransmission,
  IconFuel,
  IconMileage,
  IconCheck,
} from './icons';
import { formatCurrency, formatKm, getWhatsAppLink } from '../utils/formatters';

interface HomeExclusiveProps {
  config: CompanyConfig | null;
  vehicles: Vehicle[];
  onNavigate: (
    tab: 'inicio' | 'catalogo' | 'sobre' | 'servicos' | 'contato',
    filterPreset?: Partial<FilterState>
  ) => void;
  onViewVehicleDetails: (vehicle: Vehicle) => void;
  onOpenCustomOrderModal: () => void;
  onOpenVisitModal: () => void;
}

export const HomeExclusive: React.FC<HomeExclusiveProps> = ({
  config,
  vehicles,
  onNavigate,
  onViewVehicleDetails,
  onOpenCustomOrderModal,
  onOpenVisitModal,
}) => {
  // Quick vehicle search bar state
  const [quickBrand, setQuickBrand] = useState('');
  const [quickCategory, setQuickCategory] = useState('');
  const [quickSearchTerm, setQuickSearchTerm] = useState('');

  // Extract unique brands and categories for quick search
  const availableBrands = useMemo(() => {
    const set = new Set(vehicles.map((v) => v.marca).filter(Boolean));
    return Array.from(set).sort();
  }, [vehicles]);

  const availableCategories = useMemo(() => {
    const set = new Set(vehicles.map((v) => v.categoria).filter(Boolean));
    return Array.from(set).sort();
  }, [vehicles]);

  // Featured Spotlight Vehicle (defaults to first featured or first available)
  const spotlightList = useMemo(() => {
    const high = vehicles.filter((v) => v.destaque === 1 && v.status === 'disponivel');
    if (high.length > 0) return high.slice(0, 4);
    return vehicles.filter((v) => v.status === 'disponivel').slice(0, 4);
  }, [vehicles]);

  const [spotlightIndex, setSpotlightIndex] = useState(0);
  const activeSpotlight = spotlightList[spotlightIndex] || vehicles[0] || null;

  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onNavigate('catalogo', {
      search: quickSearchTerm,
      marca: quickBrand,
      categoria: quickCategory,
    });
  };

  const whatsAppLink = getWhatsAppLink(
    config?.whatsapp || '5511999998888',
    'Olá! Estive na página inicial da AutoPrime e gostaria de atendimento exclusivo com um consultor.'
  );

  const heroImage =
    config?.banner_imagem ||
    'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1920&q=80';

  return (
    <div className="space-y-0 text-white selection:bg-amber-400 selection:text-black">
      {/* 1. CINEMATIC HERO COM BUSCA RÁPIDA INTEGRADA */}
      <section className="relative pt-32 pb-24 md:pt-40 md:pb-32 overflow-hidden min-h-[90vh] flex flex-col justify-center">
        {/* Background Image with Deep Luxury Gradient */}
        <div className="absolute inset-0 z-0">
          <img
            src={heroImage}
            alt="Showroom conceitual"
            className="w-full h-full object-cover object-center filter brightness-[0.42] contrast-110"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b0e14] via-[#0b0e14]/75 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0b0e14] via-[#0b0e14]/80 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-3xl">
            {/* Exclusive Badge */}
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold mb-6 backdrop-blur-md shadow-lg shadow-amber-500/5">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span className="uppercase tracking-wider">Concessionária Conceito Premium</span>
            </div>

            {/* Main Manifesto / Title */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.08] font-['Space_Grotesk']">
              {config?.banner_titulo || 'A arte de dirigir o extraordinário.'}
            </h1>

            {/* Subtitle */}
            <p className="mt-6 text-base sm:text-lg md:text-xl text-gray-300 leading-relaxed max-w-2xl font-normal">
              {config?.banner_subtitulo ||
                'Uma experiência sob medida para quem exige procedência absoluta, laudo cautelar 100% aprovado e atendimento com transparência exemplar.'}
            </p>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <button
                onClick={() => onNavigate('catalogo')}
                className="flex items-center gap-3 px-7 py-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black font-extrabold text-sm sm:text-base shadow-xl shadow-amber-500/25 transition-all hover:scale-105 active:scale-95"
              >
                <span>Explorar Showroom ({vehicles.length} Veículos)</span>
                <IconArrow className="w-4 h-4 text-black" direction="right" />
              </button>

              <button
                onClick={onOpenVisitModal}
                className="flex items-center gap-2.5 px-6 py-4 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-sm sm:text-base border border-white/20 backdrop-blur-md transition-all hover:border-amber-400/50"
              >
                <span>Agendar Visita VIP</span>
              </button>
            </div>
          </div>

          {/* QUICK CAR FINDER BAR (Exclusive on Home) */}
          <div className="mt-14 max-w-5xl">
            <div className="p-4 sm:p-5 rounded-2xl bg-[#121620]/90 backdrop-blur-xl border border-white/15 shadow-2xl">
              <form
                onSubmit={handleQuickSearch}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-center"
              >
                {/* Search Term Input */}
                <div>
                  <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5 ml-1">
                    Modelo ou Palavra-Chave
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Ex: 911, M3, Cayenne, Hilux..."
                      value={quickSearchTerm}
                      onChange={(e) => setQuickSearchTerm(e.target.value)}
                      className="w-full bg-[#1b202c] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                    />
                  </div>
                </div>

                {/* Brand Selector */}
                <div>
                  <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5 ml-1">
                    Marca
                  </label>
                  <select
                    value={quickBrand}
                    onChange={(e) => setQuickBrand(e.target.value)}
                    className="w-full bg-[#1b202c] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                  >
                    <option value="">Todas as Marcas</option>
                    {availableBrands.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Category Selector */}
                <div>
                  <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5 ml-1">
                    Carroceria / Categoria
                  </label>
                  <select
                    value={quickCategory}
                    onChange={(e) => setQuickCategory(e.target.value)}
                    className="w-full bg-[#1b202c] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                  >
                    <option value="">Todas as Categorias</option>
                    {availableCategories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Submit button */}
                <div className="sm:col-span-2 lg:col-span-1 pt-1 sm:pt-6">
                  <button
                    type="submit"
                    className="w-full h-11 flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-300 text-black font-bold text-sm rounded-xl transition-all shadow-md shadow-amber-400/20 active:scale-98"
                  >
                    <IconSearch className="w-4 h-4 text-black" />
                    <span>Localizar Veículos</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* 2. VITRINE CONCEITO / SPOTLIGHT EXCLUSIVO DA SEMANA */}
      {activeSpotlight && (
        <section className="py-20 bg-[#0e1117] border-t border-white/5 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold mb-2">
                  <IconStar className="w-3.5 h-3.5" />
                  <span>Vitrine Conceito AutoPrime</span>
                </div>
                <h2 className="text-2xl sm:text-4xl font-extrabold text-white font-['Space_Grotesk'] tracking-tight">
                  Máquina em Destaque
                </h2>
                <p className="text-sm text-gray-400 mt-1">
                  Um vislumbre da curadoria de alto nível disponível em nosso showroom.
                </p>
              </div>

              {/* Spotlight selector pills if multiple */}
              {spotlightList.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
                  {spotlightList.map((item, idx) => (
                    <button
                      key={item.id}
                      onClick={() => setSpotlightIndex(idx)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                        spotlightIndex === idx
                          ? 'bg-amber-400 text-black font-bold shadow-md'
                          : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      {item.marca} {item.modelo}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Spotlight Showcase Hero Card */}
            <div className="relative rounded-3xl bg-gradient-to-br from-[#161a24] to-[#0f121a] border border-white/10 overflow-hidden shadow-2xl">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
                {/* Large Panoramic Vehicle Image (7 cols) */}
                <div className="lg:col-span-7 relative h-72 sm:h-96 lg:h-[500px] overflow-hidden bg-black/40">
                  <img
                    src={activeSpotlight.cover_image}
                    alt={`${activeSpotlight.marca} ${activeSpotlight.modelo}`}
                    className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute top-4 left-4 flex gap-2">
                    <span className="px-3 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-white text-xs font-semibold">
                      {activeSpotlight.ano_modelo}
                    </span>
                    {activeSpotlight.em_oferta === 1 && (
                      <span className="px-3 py-1 rounded-full bg-red-500/90 text-white text-xs font-bold shadow-lg">
                        Condição Especial
                      </span>
                    )}
                  </div>
                </div>

                {/* Vehicle Specs & Action (5 cols) */}
                <div className="lg:col-span-5 p-6 sm:p-10 flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
                      {activeSpotlight.marca} • {activeSpotlight.categoria}
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-extrabold text-white mt-1 font-['Space_Grotesk']">
                      {activeSpotlight.modelo}
                    </h3>
                    <p className="text-sm text-gray-400 mt-1">{activeSpotlight.versao}</p>

                    {/* Price Tag */}
                    <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/10">
                      <span className="text-xs text-gray-400 block mb-0.5">Valor à Vista</span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-black text-amber-400 font-['Space_Grotesk']">
                          {formatCurrency(
                            activeSpotlight.em_oferta === 1 && activeSpotlight.preco_promocional > 0
                              ? activeSpotlight.preco_promocional
                              : activeSpotlight.preco
                          )}
                        </span>
                        {activeSpotlight.em_oferta === 1 && activeSpotlight.preco_promocional > 0 && (
                          <span className="text-sm text-gray-500 line-through">
                            {formatCurrency(activeSpotlight.preco)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Performance / Spec Grid */}
                    <div className="grid grid-cols-2 gap-3 mt-6">
                      <div className="p-3 rounded-lg bg-white/5 border border-white/5">
                        <span className="text-[11px] text-gray-400 block flex items-center gap-1.5">
                          <IconMileage className="w-3.5 h-3.5 text-amber-400" />
                          Quilometragem
                        </span>
                        <span className="text-sm font-semibold text-white mt-1 block">
                          {formatKm(activeSpotlight.km)}
                        </span>
                      </div>

                      <div className="p-3 rounded-lg bg-white/5 border border-white/5">
                        <span className="text-[11px] text-gray-400 block flex items-center gap-1.5">
                          <IconTransmission className="w-3.5 h-3.5 text-amber-400" />
                          Câmbio
                        </span>
                        <span className="text-sm font-semibold text-white mt-1 block">
                          {activeSpotlight.cambio}
                        </span>
                      </div>

                      <div className="p-3 rounded-lg bg-white/5 border border-white/5">
                        <span className="text-[11px] text-gray-400 block flex items-center gap-1.5">
                          <IconFuel className="w-3.5 h-3.5 text-amber-400" />
                          Combustível
                        </span>
                        <span className="text-sm font-semibold text-white mt-1 block">
                          {activeSpotlight.combustivel}
                        </span>
                      </div>

                      <div className="p-3 rounded-lg bg-white/5 border border-white/5">
                        <span className="text-[11px] text-gray-400 block flex items-center gap-1.5">
                          <IconShield className="w-3.5 h-3.5 text-emerald-400" />
                          Laudo Cautelar
                        </span>
                        <span className="text-sm font-semibold text-emerald-400 mt-1 block">
                          100% Aprovado
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => onViewVehicleDetails(activeSpotlight)}
                      className="flex-1 py-3.5 px-5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-sm transition-all text-center"
                    >
                      Ver Ficha Técnica Completa
                    </button>

                    <a
                      href={getWhatsAppLink(
                        config?.whatsapp || '5511999998888',
                        `Olá! Vi o destaque de ${activeSpotlight.marca} ${activeSpotlight.modelo} na página inicial e gostaria de mais informações.`
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-3.5 px-5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-sm border border-white/15 flex items-center justify-center gap-2 transition-all"
                    >
                      <IconWhatsApp className="w-4 h-4 text-emerald-400" />
                      <span>Proposta</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 3. CAR HUNTER VIP - VEÍCULO SOB ENCOMENDA (EXCLUSIVO DA PÁGINA INICIAL) */}
      <section className="py-20 bg-[#0b0e14] border-t border-white/5 relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-1/2 left-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-[#141824] via-[#161c2b] to-[#141824] border border-amber-500/20 shadow-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold mb-4">
                  <IconCar className="w-3.5 h-3.5" />
                  <span>Serviço Exclusivo de Concierge</span>
                </div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white font-['Space_Grotesk'] leading-tight">
                  Procurando um Modelo Específico? <br className="hidden sm:inline" />
                  <span className="text-amber-400">Nós Localizamos Para Você.</span>
                </h2>
                <p className="mt-4 text-sm sm:text-base text-gray-300 leading-relaxed max-w-2xl">
                  Se o automóvel dos seus sonhos não estiver em nosso catálogo hoje, acione nosso time
                  de <strong>Personal Car Shopper</strong>. Mapeamos nossa rede confidencial de
                  colecionadores, frotas homologadas e parceiros em todo o Brasil para entregar o carro na
                  configuração e quilometragem que você exigir.
                </p>

                <div className="mt-6 flex flex-wrap items-center gap-4 text-xs sm:text-sm text-gray-300">
                  <div className="flex items-center gap-2">
                    <IconCheck className="w-4 h-4 text-amber-400" />
                    <span>Perícia presencial in-loco</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <IconCheck className="w-4 h-4 text-amber-400" />
                    <span>Negociação segura e transporte fechado</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <IconCheck className="w-4 h-4 text-amber-400" />
                    <span>Garantia AutoPrime inclusa</span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-4 flex flex-col gap-3">
                <button
                  onClick={onOpenCustomOrderModal}
                  className="w-full py-4 px-6 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-extrabold text-sm sm:text-base shadow-xl shadow-amber-400/20 transition-all hover:scale-102"
                >
                  Solicitar Veículo sob Encomenda
                </button>

                <a
                  href={getWhatsAppLink(
                    config?.whatsapp || '5511999998888',
                    'Olá! Gostaria de encomendar um veículo específico que não encontrei no site da AutoPrime.'
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 px-6 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-sm border border-white/10 flex items-center justify-center gap-2 transition-all"
                >
                  <IconWhatsApp className="w-4 h-4 text-emerald-400" />
                  <span>Falar com o Car Hunter no WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. A EXPERIÊNCIA DO SHOWROOM FÍSICO (ATENDIMENTO VIP) */}
      <section className="py-20 bg-[#0e1117] border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold mb-3">
              <span>Showroom Experience</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-['Space_Grotesk']">
              Uma Visita Diferenciada aos Seus Sentidos
            </h2>
            <p className="mt-3 text-sm sm:text-base text-gray-400 leading-relaxed">
              Desenvolvemos um espaço onde a paixão automotiva e o conforto se encontram. Cada
              visita é tratada com total privacidade e sem qualquer pressão comercial.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Box 1 */}
            <div className="p-7 rounded-2xl bg-[#141822] border border-white/10 hover:border-amber-400/40 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-amber-400/10 text-amber-400 flex items-center justify-center mb-5 text-xl font-bold group-hover:scale-110 transition-transform">
                ☕
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Lounge Privativo com Barista</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Salas privativas com café especial para você analisar propostas, fichas técnicas e
                laudos cautelares com discrição total.
              </p>
            </div>

            {/* Box 2 */}
            <div className="p-7 rounded-2xl bg-[#141822] border border-white/10 hover:border-amber-400/40 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-amber-400/10 text-amber-400 flex items-center justify-center mb-5 text-xl font-bold group-hover:scale-110 transition-transform">
                🏎️
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Test-Drive Personalizado</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Roteiro planejado previamente com nossa equipe técnica para você sentir a dinâmica,
                frenagem e conforto antes de qualquer decisão.
              </p>
            </div>

            {/* Box 3 */}
            <div className="p-7 rounded-2xl bg-[#141822] border border-white/10 hover:border-amber-400/40 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-amber-400/10 text-amber-400 flex items-center justify-center mb-5 text-xl font-bold group-hover:scale-110 transition-transform">
                🍾
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Cerimonial de Entrega Técnica</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Apresentação minuciosa de cada função do seu novo automóvel em nosso espaço de entrega
                comemorativo com brinde exclusivo.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. HUB DE PORTAIS EXCLUSIVOS (PORTAS DE ENTRADA PARA AS OUTRAS ABAS) */}
      <section className="py-20 bg-[#080a0f] border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-['Space_Grotesk']">
              O Que Você Gostaria de Acessar Agora?
            </h2>
            <p className="mt-2 text-sm text-gray-400">
              Escolha uma de nossas áreas especializadas para continuar sua jornada na AutoPrime.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Portal 1: Catálogo */}
            <div
              onClick={() => onNavigate('catalogo')}
              className="p-6 rounded-2xl bg-[#121620] border border-white/10 hover:border-amber-400 hover:bg-[#161c28] transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <span className="text-amber-400 font-bold text-xs uppercase tracking-wider block mb-2">
                  Aba 01
                </span>
                <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors">
                  Catálogo Completo
                </h3>
                <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                  Confira todos os veículos com filtros detalhados de ano, preço, opcionais e fotos em
                  alta definição.
                </p>
              </div>
              <div className="mt-6 flex items-center gap-2 text-xs font-bold text-amber-400">
                <span>Abrir Catálogo</span>
                <IconArrow className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" direction="right" />
              </div>
            </div>

            {/* Portal 2: Sobre */}
            <div
              onClick={() => onNavigate('sobre')}
              className="p-6 rounded-2xl bg-[#121620] border border-white/10 hover:border-amber-400 hover:bg-[#161c28] transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <span className="text-amber-400 font-bold text-xs uppercase tracking-wider block mb-2">
                  Aba 02
                </span>
                <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors">
                  Sobre a Concessionária
                </h3>
                <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                  Conheça nossa fundação, diretrizes de integridade, histórico no setor e depoimentos de
                  clientes.
                </p>
              </div>
              <div className="mt-6 flex items-center gap-2 text-xs font-bold text-amber-400">
                <span>Conhecer História</span>
                <IconArrow className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" direction="right" />
              </div>
            </div>

            {/* Portal 3: Serviços */}
            <div
              onClick={() => onNavigate('servicos')}
              className="p-6 rounded-2xl bg-[#121620] border border-white/10 hover:border-amber-400 hover:bg-[#161c28] transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <span className="text-amber-400 font-bold text-xs uppercase tracking-wider block mb-2">
                  Aba 03
                </span>
                <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors">
                  Serviços & Finanças
                </h3>
                <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                  Simulação de crédito bancário com taxas especiais, avaliação do seu usado e
                  consignação premium.
                </p>
              </div>
              <div className="mt-6 flex items-center gap-2 text-xs font-bold text-amber-400">
                <span>Ver Serviços</span>
                <IconArrow className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" direction="right" />
              </div>
            </div>

            {/* Portal 4: Contato */}
            <div
              onClick={() => onNavigate('contato')}
              className="p-6 rounded-2xl bg-[#121620] border border-white/10 hover:border-amber-400 hover:bg-[#161c28] transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <span className="text-amber-400 font-bold text-xs uppercase tracking-wider block mb-2">
                  Aba 04
                </span>
                <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors">
                  Contato & Showroom
                </h3>
                <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                  Endereço exato com mapa, telefones diretos, horários de funcionamento e formulário de
                  atendimento.
                </p>
              </div>
              <div className="mt-6 flex items-center gap-2 text-xs font-bold text-amber-400">
                <span>Fale Conosco</span>
                <IconArrow className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" direction="right" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
