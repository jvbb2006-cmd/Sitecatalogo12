import React from 'react';
import { CompanyConfig } from '../types';
import { IconArrow, IconWhatsApp, IconShield, IconStar, IconCheck, IconCar } from './icons';
import { getWhatsAppLink } from '../utils/formatters';

interface HeroProps {
  config: CompanyConfig | null;
  onExploreCatalog: () => void;
  onOpenConsultant: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  config,
  onExploreCatalog,
  onOpenConsultant,
}) => {
  const whatsAppLink = getWhatsAppLink(
    config?.whatsapp || '5511999998888',
    'Olá! Gostaria de falar com um consultor da AutoPrime para encontrar meu próximo veículo.'
  );

  const heroImage =
    config?.banner_imagem ||
    'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1920&q=80';

  return (
    <section id="inicio" className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
      {/* Background with Dark Luxury Gradient Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="Veículo esportivo em destaque"
          className="w-full h-full object-cover object-center transform scale-105 filter brightness-50 contrast-110"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0e1117] via-[#0e1117]/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0e1117] via-[#0e1117]/70 to-transparent" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold mb-6 backdrop-blur-md">
            <IconStar className="w-3.5 h-3.5 text-amber-400" />
            <span>Curadoria Premium & Procedência Atestada</span>
          </div>

          {/* Title */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-[1.1] font-['Space_Grotesk']">
            {config?.banner_titulo || 'Seu próximo carro está aqui.'}
          </h1>

          {/* Description */}
          <p className="mt-6 text-lg sm:text-xl text-gray-300 leading-relaxed font-normal max-w-2xl">
            {config?.banner_subtitulo ||
              'Veículos selecionados, atendimento especializado e as melhores condições para você dirigir uma nova história.'}
          </p>

          {/* Call to Actions */}
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <button
              onClick={onExploreCatalog}
              className="flex items-center gap-3 px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-base shadow-xl shadow-amber-500/25 transition-all hover:scale-102 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <span>Ver veículos</span>
              <IconArrow className="w-4 h-4" direction="right" />
            </button>

            <a
              href={whatsAppLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-base border border-white/15 backdrop-blur-md transition-all hover:border-white/30 focus:outline-none focus:ring-2 focus:ring-white/40"
            >
              <IconWhatsApp className="w-5 h-5 text-emerald-400" />
              <span>Falar com um consultor</span>
            </a>
          </div>

          {/* Trust Badges */}
          <div className="mt-12 pt-8 border-t border-white/10 grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-amber-400">
                <IconShield className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">100% Cautelar</h4>
                <p className="text-xs text-gray-400">Laudo aprovado sem apontamentos</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-amber-400">
                <IconCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Garantia 1 Ano</h4>
                <p className="text-xs text-gray-400">Motor e câmbio assegurados</p>
              </div>
            </div>

            <div className="flex items-center gap-3 col-span-2 sm:col-span-1">
              <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-amber-400">
                <IconCar className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Troca Justa</h4>
                <p className="text-xs text-gray-400">Máxima valorização do seu usado</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
