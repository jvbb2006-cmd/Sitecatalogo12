import React from 'react';
import { IconStar } from './icons';

export const TestimonialsSection: React.FC = () => {
  const testimonials = [
    {
      id: 1,
      name: 'Eduardo M. Siqueira',
      role: 'Empresário',
      vehicle: 'Porsche 911 Carrera S',
      comment:
        'A experiência de compra na AutoPrime superou todas as expectativas. Todo o histórico cautelar do carro me foi apresentado com transparência total antes mesmo de eu visitar a loja física.',
      rating: 5,
    },
    {
      id: 2,
      name: 'Dra. Beatriz Fontana',
      role: 'Médica Cirurgiã',
      vehicle: 'Volvo XC60 T8 Recharge',
      comment:
        'A agilidade no processo de financiamento e a avaliação do meu usado foram decisivas. O carro foi entregue impecável, higienizado e com a garantia estendida de 1 ano. Recomendo de olhos fechados!',
      rating: 5,
    },
    {
      id: 3,
      name: 'Ricardo Vasconcellos',
      role: 'Engenheiro Mecânico',
      vehicle: 'BMW M3 Competition',
      comment:
        'Como conhecedor de mecânica de alta performance, fiquei extremamente impressionado com o rigor da equipe na seleção dos automóveis. Atendimento técnico, pontual e altamente profissional.',
      rating: 5,
    },
  ];

  return (
    <section className="py-20 bg-[#0e1117] border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold mb-3">
            <span>Depoimentos Reais</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-['Space_Grotesk']">
            O que Nossos Clientes Dizem
          </h2>
          <p className="mt-3 text-sm text-gray-400">
            A satisfação e a fidelidade de quem já realizou o sonho de dirigir um modelo AutoPrime.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div
              key={t.id}
              className="bg-[#151922] border border-white/10 rounded-2xl p-6 flex flex-col justify-between"
            >
              <div>
                {/* Rating stars */}
                <div className="flex items-center gap-1 text-amber-400 mb-4">
                  {[...Array(t.rating)].map((_, i) => (
                    <IconStar key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-sm text-gray-300 italic leading-relaxed mb-6">
                  "{t.comment}"
                </p>
              </div>

              <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white font-['Space_Grotesk']">{t.name}</h4>
                  <p className="text-xs text-gray-400">{t.role}</p>
                </div>
                <span className="text-[11px] font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
                  {t.vehicle}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
