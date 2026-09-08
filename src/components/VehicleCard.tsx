import React from 'react';
import { Vehicle } from '../types';
import {
  IconCalendar,
  IconMileage,
  IconFuel,
  IconTransmission,
  IconWhatsApp,
  IconEye,
  IconSold,
} from './icons';
import { formatCurrency, formatKm, getWhatsAppLink } from '../utils/formatters';

interface VehicleCardProps {
  vehicle: Vehicle;
  onViewDetails: (vehicle: Vehicle) => void;
  onInterest: (vehicle: Vehicle) => void;
  whatsappNumber?: string;
}

export const VehicleCard: React.FC<VehicleCardProps> = ({
  vehicle,
  onViewDetails,
  onInterest,
  whatsappNumber = '5511999998888',
}) => {
  const isSold = vehicle.status === 'vendido';
  const isReserved = vehicle.status === 'reservado';
  const hasPromo = vehicle.preco_promocional > 0 && vehicle.preco_promocional < vehicle.preco;
  const currentPrice = hasPromo ? vehicle.preco_promocional : vehicle.preco;

  const whatsAppLink = getWhatsAppLink(
    whatsappNumber,
    `Olá! Vi o ${vehicle.marca} ${vehicle.modelo} (${vehicle.versao}) no valor de ${formatCurrency(
      currentPrice
    )} no site e gostaria de saber se ainda está disponível.`
  );

  return (
    <div
      className={`group relative bg-[#151922] border rounded-2xl overflow-hidden transition-all duration-300 flex flex-col ${
        isSold
          ? 'border-gray-800 opacity-75'
          : 'border-white/10 hover:border-amber-500/50 hover:shadow-2xl hover:shadow-amber-500/10 hover:-translate-y-1'
      }`}
    >
      {/* Vehicle Image Container */}
      <div className="relative aspect-[16/10] overflow-hidden bg-black/40">
        <img
          src={vehicle.cover_image}
          alt={`${vehicle.marca} ${vehicle.modelo} ${vehicle.versao}`}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#151922] via-transparent to-black/20" />

        {/* Badges Overlay */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
          {isSold ? (
            <span className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-rose-600 text-white shadow-md">
              <IconSold className="w-3.5 h-3.5" />
              Vendido
            </span>
          ) : isReserved ? (
            <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-amber-600 text-white shadow-md">
              Reservado
            </span>
          ) : (
            <>
              <span
                className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md shadow-md ${
                  vehicle.condicao === 'Novo'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white/15 backdrop-blur-md text-gray-200 border border-white/10'
                }`}
              >
                {vehicle.condicao}
              </span>
              {vehicle.em_oferta === 1 && (
                <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-emerald-600 text-white shadow-md animate-pulse">
                  Oferta
                </span>
              )}
              {vehicle.destaque === 1 && (
                <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-amber-500 text-black shadow-md">
                  Destaque
                </span>
              )}
            </>
          )}
        </div>

        {/* Total Images Badge */}
        {vehicle.images && vehicle.images.length > 1 && (
          <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[11px] font-medium text-gray-300 border border-white/10 flex items-center gap-1">
            <span>{vehicle.images.length} fotos</span>
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Brand & Category */}
          <div className="flex items-center justify-between text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">
            <span>{vehicle.marca}</span>
            <span className="text-gray-500">{vehicle.categoria}</span>
          </div>

          {/* Model & Version */}
          <h3 className="text-xl font-bold text-white tracking-tight group-hover:text-amber-400 transition-colors line-clamp-1 font-['Space_Grotesk']">
            {vehicle.modelo}
          </h3>
          <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{vehicle.versao || 'Versão Padrão'}</p>

          {/* Specs Grid */}
          <div className="mt-4 pt-3 border-t border-white/5 grid grid-cols-2 gap-2 text-xs text-gray-300">
            <div className="flex items-center gap-2" title="Ano de Fabricação / Modelo">
              <IconCalendar className="w-4 h-4 text-amber-500/80 shrink-0" />
              <span>
                {vehicle.ano_fabricacao}/{vehicle.ano_modelo}
              </span>
            </div>

            <div className="flex items-center gap-2" title="Quilometragem">
              <IconMileage className="w-4 h-4 text-amber-500/80 shrink-0" />
              <span>{formatKm(vehicle.km)}</span>
            </div>

            <div className="flex items-center gap-2" title="Tipo de Combustível">
              <IconFuel className="w-4 h-4 text-amber-500/80 shrink-0" />
              <span className="truncate">{vehicle.combustivel}</span>
            </div>

            <div className="flex items-center gap-2" title="Tipo de Câmbio">
              <IconTransmission className="w-4 h-4 text-amber-500/80 shrink-0" />
              <span className="truncate">{vehicle.cambio}</span>
            </div>
          </div>
        </div>

        {/* Pricing & Actions */}
        <div className="mt-5 pt-4 border-t border-white/10">
          <div className="mb-3">
            {hasPromo ? (
              <div>
                <span className="text-xs text-gray-500 line-through mr-2">
                  {formatCurrency(vehicle.preco)}
                </span>
                <div className="text-2xl font-black text-emerald-400 font-['Space_Grotesk']">
                  {formatCurrency(vehicle.preco_promocional)}
                </div>
              </div>
            ) : (
              <div className="text-2xl font-black text-white font-['Space_Grotesk']">
                {formatCurrency(vehicle.preco)}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onViewDetails(vehicle)}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-semibold text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <IconEye className="w-3.5 h-3.5 text-gray-400" />
              <span>Ver detalhes</span>
            </button>

            {isSold ? (
              <button
                disabled
                className="py-2.5 px-3 rounded-xl text-xs font-semibold text-gray-500 bg-gray-800/50 cursor-not-allowed text-center"
              >
                Vendido
              </button>
            ) : (
              <button
                onClick={() => onInterest(vehicle)}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-semibold text-black bg-amber-400 hover:bg-amber-300 transition-colors shadow-md shadow-amber-500/10 focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                <span>Tenho interesse</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
