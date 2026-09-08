import React from 'react';
import { ServiceItem } from '../types';
import {
  IconCar,
  IconFinance,
  IconCheck,
  IconShield,
  IconStar,
  IconTestDrive,
  IconArrow,
} from './icons';

interface ServicesSectionProps {
  services: ServiceItem[];
  onRequestService: (serviceName: string) => void;
  isDedicatedPage?: boolean;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({
  services,
  onRequestService,
  isDedicatedPage = true,
}) => {
  const getServiceIcon = (type: string) => {
    switch (type) {
      case 'car':
        return <IconCar className="w-6 h-6" />;
      case 'finance':
        return <IconFinance className="w-6 h-6" />;
      case 'check':
        return <IconCheck className="w-6 h-6" />;
      case 'test-drive':
        return <IconTestDrive className="w-6 h-6" />;
      case 'star':
        return <IconStar className="w-6 h-6" />;
      case 'shield':
      default:
        return <IconShield className="w-6 h-6" />;
    }
  };

  return (
    <section
      id="servicos"
      className={`${
        isDedicatedPage ? 'pt-28 sm:pt-32 pb-20 min-h-[85vh]' : 'py-20'
      } bg-[#0e1117] border-t border-white/5`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold mb-3">
            <span>Soluções Automotivas Completas</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight font-['Space_Grotesk']">
            Nossos Serviços Exclusivos
          </h1>
          <p className="mt-3 text-sm sm:text-base text-gray-300">
            Muito além da venda: oferecemos assessoria 360° para você comprar, vender, financiar e
            proteger seu veículo com total comodidade.
          </p>
        </div>

        {/* Services Grid (8 cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {services.map((srv) => (
            <div
              key={srv.id}
              className="group bg-[#151922] border border-white/10 hover:border-amber-500/40 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-amber-500/5 flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-5 group-hover:bg-amber-400 group-hover:text-black transition-colors">
                  {getServiceIcon(srv.icone_tipo)}
                </div>
                <h3 className="text-base font-bold text-white mb-2 group-hover:text-amber-400 transition-colors font-['Space_Grotesk']">
                  {srv.titulo}
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed">{srv.descricao}</p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/5">
                <button
                  onClick={() => onRequestService(srv.titulo)}
                  className="w-full flex items-center justify-between text-xs font-semibold text-amber-400 group-hover:text-amber-300 py-1"
                >
                  <span>{srv.link_texto || 'Solicitar atendimento'}</span>
                  <IconArrow className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
