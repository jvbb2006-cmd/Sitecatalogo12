import React, { useState, useMemo } from 'react';
import { Vehicle, FilterState } from '../types';
import { VehicleCard } from './VehicleCard';
import { IconSearch, IconFilter, IconClose, IconChevron, IconCheck } from './icons';

interface CatalogSectionProps {
  vehicles: Vehicle[];
  isLoading: boolean;
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  onViewDetails: (vehicle: Vehicle) => void;
  onInterest: (vehicle: Vehicle) => void;
  whatsappNumber?: string;
  isDedicatedPage?: boolean;
}

export const CatalogSection: React.FC<CatalogSectionProps> = ({
  vehicles,
  isLoading,
  filters,
  setFilters,
  onViewDetails,
  onInterest,
  whatsappNumber,
  isDedicatedPage = true,
}) => {
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Extract unique brands and categories for dropdowns
  const availableBrands = useMemo(() => {
    const set = new Set<string>();
    vehicles.forEach((v) => {
      if (v.marca) set.add(v.marca);
    });
    return Array.from(set).sort();
  }, [vehicles]);

  const availableCategories = useMemo(() => {
    const set = new Set<string>();
    vehicles.forEach((v) => {
      if (v.categoria) set.add(v.categoria);
    });
    return Array.from(set).sort();
  }, [vehicles]);

  const handleClearFilters = () => {
    setFilters({
      search: '',
      marca: '',
      categoria: '',
      anoMin: '',
      anoMax: '',
      precoMin: '',
      precoMax: '',
      combustivel: '',
      cambio: '',
      condicao: '',
      status: 'disponivel',
      apenasOfertas: false,
      sort: '',
    });
  };

  const hasActiveFilters =
    Boolean(filters.search) ||
    Boolean(filters.marca) ||
    Boolean(filters.categoria) ||
    Boolean(filters.anoMin) ||
    Boolean(filters.anoMax) ||
    Boolean(filters.precoMin) ||
    Boolean(filters.precoMax) ||
    Boolean(filters.combustivel) ||
    Boolean(filters.cambio) ||
    Boolean(filters.condicao) ||
    filters.status !== 'disponivel' ||
    filters.apenasOfertas;

  return (
    <section
      id="catalogo"
      className={`${
        isDedicatedPage ? 'pt-28 sm:pt-32 pb-20 min-h-[85vh]' : 'py-20'
      } bg-[#0e1117] border-t border-white/5`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold mb-3">
              <span>Showroom Digital • {vehicles.length} Veículos Disponíveis</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight font-['Space_Grotesk']">
              Catálogo de Veículos
            </h1>
            <p className="mt-2 text-sm sm:text-base text-gray-400">
              Encontre o automóvel que combina perfeitamente com seu estilo de vida e necessidades.
            </p>
          </div>

          {/* Quick Search and Mobile Filter Toggle */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
              <input
                type="text"
                placeholder="Buscar por marca, modelo ou versão..."
                value={filters.search}
                onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                className="w-full bg-[#151922] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              />
              <IconSearch className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
              {filters.search && (
                <button
                  onClick={() => setFilters((prev) => ({ ...prev, search: '' }))}
                  className="absolute right-3 top-3 text-gray-500 hover:text-white"
                >
                  <IconClose className="w-4 h-4" />
                </button>
              )}
            </div>

            <button
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
              className="lg:hidden flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-semibold hover:bg-white/10"
            >
              <IconFilter className="w-4 h-4 text-amber-400" />
              <span>Filtros</span>
            </button>
          </div>
        </div>

        {/* Filter Bar (Desktop & Collapsible Mobile) */}
        <div
          className={`bg-[#151922] border border-white/10 rounded-2xl p-5 mb-8 transition-all ${
            mobileFilterOpen ? 'block' : 'hidden lg:block'
          }`}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
            {/* Marca */}
            <div>
              <label className="block text-gray-400 font-medium mb-1">Marca</label>
              <select
                value={filters.marca}
                onChange={(e) => setFilters((prev) => ({ ...prev, marca: e.target.value }))}
                className="w-full bg-[#0e1117] border border-white/10 rounded-lg px-2.5 py-2 text-white focus:outline-none focus:border-amber-500"
              >
                <option value="">Todas as marcas</option>
                {availableBrands.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            {/* Categoria */}
            <div>
              <label className="block text-gray-400 font-medium mb-1">Carroceria</label>
              <select
                value={filters.categoria}
                onChange={(e) => setFilters((prev) => ({ ...prev, categoria: e.target.value }))}
                className="w-full bg-[#0e1117] border border-white/10 rounded-lg px-2.5 py-2 text-white focus:outline-none focus:border-amber-500"
              >
                <option value="">Todas as categorias</option>
                {availableCategories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Câmbio */}
            <div>
              <label className="block text-gray-400 font-medium mb-1">Câmbio</label>
              <select
                value={filters.cambio}
                onChange={(e) => setFilters((prev) => ({ ...prev, cambio: e.target.value }))}
                className="w-full bg-[#0e1117] border border-white/10 rounded-lg px-2.5 py-2 text-white focus:outline-none focus:border-amber-500"
              >
                <option value="">Todos os câmbios</option>
                <option value="Automático">Automático</option>
                <option value="Manual">Manual</option>
                <option value="CVT">CVT</option>
              </select>
            </div>

            {/* Combustível */}
            <div>
              <label className="block text-gray-400 font-medium mb-1">Combustível</label>
              <select
                value={filters.combustivel}
                onChange={(e) => setFilters((prev) => ({ ...prev, combustivel: e.target.value }))}
                className="w-full bg-[#0e1117] border border-white/10 rounded-lg px-2.5 py-2 text-white focus:outline-none focus:border-amber-500"
              >
                <option value="">Todos</option>
                <option value="Gasolina">Gasolina</option>
                <option value="Flex">Flex</option>
                <option value="Híbrido">Híbrido</option>
                <option value="Diesel">Diesel</option>
                <option value="Elétrico">Elétrico</option>
              </select>
            </div>

            {/* Condição */}
            <div>
              <label className="block text-gray-400 font-medium mb-1">Condição</label>
              <select
                value={filters.condicao}
                onChange={(e) => setFilters((prev) => ({ ...prev, condicao: e.target.value }))}
                className="w-full bg-[#0e1117] border border-white/10 rounded-lg px-2.5 py-2 text-white focus:outline-none focus:border-amber-500"
              >
                <option value="">Novos & Seminovos</option>
                <option value="Seminovo">Seminovo</option>
                <option value="Novo">0 km (Novo)</option>
              </select>
            </div>

            {/* Preço Máximo */}
            <div>
              <label className="block text-gray-400 font-medium mb-1">Preço até</label>
              <select
                value={filters.precoMax}
                onChange={(e) => setFilters((prev) => ({ ...prev, precoMax: e.target.value }))}
                className="w-full bg-[#0e1117] border border-white/10 rounded-lg px-2.5 py-2 text-white focus:outline-none focus:border-amber-500"
              >
                <option value="">Qualquer valor</option>
                <option value="250000">Até R$ 250.000</option>
                <option value="500000">Até R$ 500.000</option>
                <option value="750000">Até R$ 750.000</option>
                <option value="1000000">Até R$ 1.000.000</option>
              </select>
            </div>
          </div>

          {/* Secondary Filter Row: Toggles & Ordering */}
          <div className="mt-4 pt-4 border-t border-white/5 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              {/* Ofertas toggle */}
              <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-medium text-gray-300">
                <input
                  type="checkbox"
                  checked={filters.apenasOfertas}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, apenasOfertas: e.target.checked }))
                  }
                  className="rounded bg-[#0e1117] border-white/20 text-amber-500 focus:ring-amber-500 focus:ring-offset-0"
                />
                <span>Apenas veículos em oferta</span>
              </label>

              {/* Status filter: Disponíveis vs Todos */}
              <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-medium text-gray-300">
                <input
                  type="checkbox"
                  checked={filters.status === 'disponivel'}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      status: e.target.checked ? 'disponivel' : 'all',
                    }))
                  }
                  className="rounded bg-[#0e1117] border-white/20 text-amber-500 focus:ring-amber-500 focus:ring-offset-0"
                />
                <span>Apenas veículos disponíveis</span>
              </label>
            </div>

            <div className="flex items-center gap-3 ml-auto">
              {/* Sorting */}
              <div className="flex items-center gap-2 text-xs">
                <span className="text-gray-400">Ordenar por:</span>
                <select
                  value={filters.sort}
                  onChange={(e) => setFilters((prev) => ({ ...prev, sort: e.target.value }))}
                  className="bg-[#0e1117] border border-white/10 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-amber-500 text-xs"
                >
                  <option value="">Padrão da concessionária</option>
                  <option value="preco_asc">Menor preço</option>
                  <option value="preco_desc">Maior preço</option>
                  <option value="km_asc">Menor quilometragem</option>
                  <option value="recentes">Mais recentes</option>
                  <option value="ano_desc">Ano mais novo</option>
                </select>
              </div>

              {/* Clear filters button */}
              {hasActiveFilters && (
                <button
                  onClick={handleClearFilters}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-amber-400 hover:text-amber-300 bg-amber-500/10 border border-amber-500/20"
                >
                  <IconClose className="w-3.5 h-3.5" />
                  <span>Limpar filtros</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Results Counter Bar */}
        <div className="flex items-center justify-between mb-6 text-xs text-gray-400">
          <div>
            <span>Exibindo </span>
            <strong className="text-white font-semibold">{vehicles.length}</strong>
            <span> {vehicles.length === 1 ? 'veículo encontrado' : 'veículos encontrados'}</span>
          </div>

          {hasActiveFilters && (
            <span className="text-amber-400/90 hidden sm:inline">
              Filtros ativos aplicados ao catálogo
            </span>
          )}
        </div>

        {/* Loading Skeleton */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div
                key={idx}
                className="bg-[#151922] border border-white/5 rounded-2xl p-5 animate-pulse"
              >
                <div className="aspect-[16/10] bg-white/5 rounded-xl mb-4" />
                <div className="h-4 bg-white/5 rounded w-1/3 mb-2" />
                <div className="h-6 bg-white/5 rounded w-2/3 mb-4" />
                <div className="grid grid-cols-2 gap-2 mb-6">
                  <div className="h-4 bg-white/5 rounded" />
                  <div className="h-4 bg-white/5 rounded" />
                </div>
                <div className="h-8 bg-white/5 rounded w-1/2" />
              </div>
            ))}
          </div>
        )}

        {/* Vehicle Grid */}
        {!isLoading && vehicles.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehicles.map((v) => (
              <VehicleCard
                key={v.id}
                vehicle={v}
                onViewDetails={onViewDetails}
                onInterest={onInterest}
                whatsappNumber={whatsappNumber}
              />
            ))}
          </div>
        )}

        {/* Empty State Message */}
        {!isLoading && vehicles.length === 0 && (
          <div className="text-center py-16 px-4 bg-[#151922] border border-white/10 rounded-2xl max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-amber-400 mb-4">
              <IconSearch className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2 font-['Space_Grotesk']">
              Nenhum veículo encontrado
            </h3>
            <p className="text-xs text-gray-400 max-w-sm mx-auto mb-6 leading-relaxed">
              Não encontramos nenhum automóvel que corresponda aos filtros selecionados. Tente
              ajustar os parâmetros ou limpe a busca.
            </p>
            <button
              onClick={handleClearFilters}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-semibold text-xs transition-colors"
            >
              <span>Limpar todos os filtros</span>
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
