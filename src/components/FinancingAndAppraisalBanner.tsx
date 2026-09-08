import React from 'react';
import { IconFinance, IconCar, IconArrow } from './icons';

interface BannerProps {
  onOpenFinancing: () => void;
  onOpenAppraisal: () => void;
}

export const FinancingAndAppraisalBanner: React.FC<BannerProps> = ({
  onOpenFinancing,
  onOpenAppraisal,
}) => {
  return (
    <section className="py-16 bg-[#0b0e14] border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Financing Callout */}
          <div className="relative bg-gradient-to-br from-[#161a24] to-[#12151d] border border-white/10 rounded-3xl p-8 overflow-hidden group">
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-4">
                <IconFinance className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2 font-['Space_Grotesk']">
                Financiamento Ágil & Sem Burocracia
              </h3>
              <p className="text-sm text-gray-300 mb-6 leading-relaxed">
                Trabalhamos com os principais bancos para aprovação rápida, taxas personalizadas e
                prazos de até 60 meses. Simule agora mesmo sem compromisso.
              </p>
              <button
                onClick={onOpenFinancing}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs shadow-lg shadow-amber-500/20 transition-all"
              >
                <span>Simular Financiamento</span>
                <IconArrow className="w-4 h-4" />
              </button>
            </div>
            <div className="absolute -right-6 -bottom-6 w-40 h-40 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-colors" />
          </div>

          {/* Used Car Appraisal Callout */}
          <div className="relative bg-gradient-to-br from-[#161a24] to-[#12151d] border border-white/10 rounded-3xl p-8 overflow-hidden group">
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
                <IconCar className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2 font-['Space_Grotesk']">
                Avaliação do seu Usado na Troca
              </h3>
              <p className="text-sm text-gray-300 mb-6 leading-relaxed">
                Valorizamos seu veículo com base na cotação real de mercado. Receba uma proposta
                justa e use seu carro atual como entrada no novo modelo.
              </p>
              <button
                onClick={onOpenAppraisal}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs border border-white/15 transition-all"
              >
                <span>Avaliar meu Veículo</span>
                <IconArrow className="w-4 h-4" />
              </button>
            </div>
            <div className="absolute -right-6 -bottom-6 w-40 h-40 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors" />
          </div>
        </div>
      </div>
    </section>
  );
};
