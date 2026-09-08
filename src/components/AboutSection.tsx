import React from 'react';
import { CompanyConfig } from '../types';
import { IconShield, IconStar, IconCheck, IconCar, IconLocation } from './icons';

interface AboutSectionProps {
  config: CompanyConfig | null;
  isDedicatedPage?: boolean;
}

export const AboutSection: React.FC<AboutSectionProps> = ({
  config,
  isDedicatedPage = true,
}) => {
  return (
    <section
      id="sobre"
      className={`${
        isDedicatedPage ? 'pt-28 sm:pt-32 pb-20 min-h-[85vh]' : 'py-20'
      } bg-[#0b0e14] border-t border-white/5`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold mb-3">
            <span>Tradição, Procedência & Confiança</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight font-['Space_Grotesk']">
            Sobre a {config?.nome || 'AutoPrime Motors'}
          </h1>
          <p className="mt-3 text-sm sm:text-base text-gray-300 leading-relaxed">
            {config?.sobre_historia ||
              'Fundada com a proposta de redefinir o mercado automotivo premium, a AutoPrime nasceu do entusiasmo por automóveis de alta performance e da busca incessante pela máxima transparência.'}
          </p>
        </div>

        {/* Authority Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
          <div className="bg-[#141822] border border-white/10 rounded-2xl p-6 relative overflow-hidden group">
            <div className="text-3xl sm:text-4xl font-black text-amber-400 font-['Space_Grotesk'] mb-1">
              {config?.metric_carros_vendidos || '1.850+'}
            </div>
            <div className="text-sm font-bold text-white">Veículos Entregues</div>
            <div className="text-[11px] text-gray-400 mt-1">Negociações com procedência atestada</div>
          </div>

          <div className="bg-[#141822] border border-white/10 rounded-2xl p-6 relative overflow-hidden group">
            <div className="text-3xl sm:text-4xl font-black text-amber-400 font-['Space_Grotesk'] mb-1">
              {config?.metric_anos_experiencia || '15 Anos'}
            </div>
            <div className="text-sm font-bold text-white">Tempo de Atuação</div>
            <div className="text-[11px] text-gray-400 mt-1">Solidez e credibilidade no mercado</div>
          </div>

          <div className="bg-[#141822] border border-white/10 rounded-2xl p-6 relative overflow-hidden group">
            <div className="text-3xl sm:text-4xl font-black text-amber-400 font-['Space_Grotesk'] mb-1">
              {config?.metric_clientes_atendidos || '2.400+'}
            </div>
            <div className="text-sm font-bold text-white">Clientes Atendidos</div>
            <div className="text-[11px] text-gray-400 mt-1">Consultoria sob medida e pós-venda ativo</div>
          </div>

          <div className="bg-[#141822] border border-white/10 rounded-2xl p-6 relative overflow-hidden group">
            <div className="text-3xl sm:text-4xl font-black text-amber-400 font-['Space_Grotesk'] mb-1">
              {config?.metric_satisfacao || '99.4%'}
            </div>
            <div className="text-sm font-bold text-white">Índice de Satisfação</div>
            <div className="text-[11px] text-gray-400 mt-1">Avaliação máxima nos canais oficiais</div>
          </div>
        </div>

        {/* Mission, Values & Differentials Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="bg-[#141822] border border-white/10 rounded-2xl p-6">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-4">
              <IconShield className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2 font-['Space_Grotesk']">Nossa Missão</h3>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
              {config?.sobre_missao ||
                'Proporcionar aos nossos clientes a melhor experiência na aquisição de veículos, unindo segurança documental, garantia de procedência e atendimento humanizado.'}
            </p>
          </div>

          <div className="bg-[#141822] border border-white/10 rounded-2xl p-6">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-4">
              <IconStar className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2 font-['Space_Grotesk']">Nossos Valores</h3>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
              {config?.sobre_valores ||
                'Ética inegociável, transparência em cada laudo cautelar, paixão por automóveis e excelência contínua no pós-venda.'}
            </p>
          </div>

          <div className="bg-[#141822] border border-white/10 rounded-2xl p-6">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-4">
              <IconCheck className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2 font-['Space_Grotesk']">Diferenciais</h3>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
              {config?.sobre_diferenciais ||
                '100% dos veículos com laudo cautelar aprovado sem restrições, garantia estendida de 1 ano, entrega para todo o Brasil e avaliação justa do seu usado.'}
            </p>
          </div>
        </div>

        {/* Location & Showroom Callout */}
        <div className="bg-gradient-to-r from-[#141822] to-[#1c2230] border border-white/10 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-400 text-black flex items-center justify-center shrink-0 shadow-lg shadow-amber-400/20">
              <IconLocation className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-white font-['Space_Grotesk']">
                Conheça Nosso Showroom Físico
              </h4>
              <p className="text-sm text-gray-300 mt-1">
                {config?.endereco || 'Avenida Europa, 1420 - Jardins'} —{' '}
                {config?.cidade_estado || 'São Paulo - SP'}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {config?.horario_atendimento ||
                  'Segunda a Sexta: 08h às 19h | Sábados: 09h às 16h'}
              </p>
            </div>
          </div>

          <a
            href={`https://maps.google.com/?q=${encodeURIComponent(
              `${config?.endereco || 'Avenida Europa, 1420'}, ${config?.cidade_estado || 'São Paulo'}`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs border border-white/10 transition-colors whitespace-nowrap"
          >
            Ver no Google Maps
          </a>
        </div>
      </div>
    </section>
  );
};
