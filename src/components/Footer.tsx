import React from 'react';
import { CompanyConfig } from '../types';
import {
  IconLogo,
  IconLocation,
  IconPhone,
  IconWhatsApp,
  IconClock,
  IconInstagram,
  IconFacebook,
  IconYouTube,
  IconShield,
  IconCheck,
} from './icons';
import { getWhatsAppLink } from '../utils/formatters';

interface FooterProps {
  config: CompanyConfig | null;
  onNavigate: (sectionId: string) => void;
  onOpenFinancing: () => void;
  onOpenAppraisal: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  config,
  onNavigate,
  onOpenFinancing,
  onOpenAppraisal,
}) => {
  const whatsAppLink = getWhatsAppLink(
    config?.whatsapp || '5511999998888',
    'Olá! Estava no rodapé do site da AutoPrime e gostaria de falar com a equipe.'
  );

  return (
    <footer className="bg-[#080a0f] border-t border-white/10 text-gray-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand & Slogan (2 cols) */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-black shadow-lg shadow-amber-500/20">
                <IconLogo className="w-6 h-6 text-black" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white font-['Space_Grotesk']">
                {config?.nome || 'AutoPrime Motors'}
              </span>
            </div>

            <p className="text-sm text-gray-400 mb-6 leading-relaxed max-w-sm">
              {config?.slogan ||
                'Especialistas em veículos seminovos e novos de alto padrão. Procedência atestada, laudo cautelar 100% aprovado e atendimento com transparência absoluta.'}
            </p>

            <div className="flex items-center gap-3">
              <a
                href={config?.instagram ? `https://instagram.com/${config.instagram}` : '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                title="Instagram"
              >
                <IconInstagram className="w-4 h-4" />
              </a>

              <a
                href={config?.facebook ? `https://facebook.com/${config.facebook}` : '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                title="Facebook"
              >
                <IconFacebook className="w-4 h-4" />
              </a>

              <a
                href={config?.youtube ? `https://youtube.com/${config.youtube}` : '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                title="YouTube"
              >
                <IconYouTube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4 font-['Space_Grotesk'] uppercase tracking-wider">
              Navegação
            </h4>
            <ul className="space-y-2.5">
              <li>
                <button
                  onClick={() => onNavigate('inicio')}
                  className="hover:text-amber-400 transition-colors text-left"
                >
                  Página Inicial
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('catalogo')}
                  className="hover:text-amber-400 transition-colors text-left"
                >
                  Catálogo de Veículos
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('sobre')}
                  className="hover:text-amber-400 transition-colors text-left"
                >
                  Sobre a Concessionária
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('servicos')}
                  className="hover:text-amber-400 transition-colors text-left"
                >
                  Serviços Oferecidos
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('contato')}
                  className="hover:text-amber-400 transition-colors text-left"
                >
                  Fale Conosco
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenFinancing}
                  className="hover:text-amber-400 transition-colors text-left"
                >
                  Simular Financiamento
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenAppraisal}
                  className="hover:text-amber-400 transition-colors text-left"
                >
                  Avaliação do seu Usado
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4 font-['Space_Grotesk'] uppercase tracking-wider">
              Atendimento
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5">
                <IconPhone className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="block text-white font-medium">Telefone Loja</span>
                  <span>{config?.telefone || '(11) 3045-8800'}</span>
                </div>
              </li>

              <li className="flex items-start gap-2.5">
                <IconWhatsApp className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="block text-white font-medium">WhatsApp Plantão</span>
                  <a
                    href={whatsAppLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline text-emerald-400"
                  >
                    {config?.whatsapp || '(11) 99999-8888'}
                  </a>
                </div>
              </li>

              <li className="flex items-start gap-2.5">
                <IconClock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="block text-white font-medium">Horários</span>
                  <span>{config?.horario_atendimento || 'Seg a Sex: 08h-19h | Sáb: 09h-16h'}</span>
                </div>
              </li>
            </ul>
          </div>

          {/* Showroom & Guarantees */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4 font-['Space_Grotesk'] uppercase tracking-wider">
              Localização
            </h4>
            <div className="flex items-start gap-2.5 mb-5">
              <IconLocation className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-white font-medium">{config?.endereco || 'Avenida Europa, 1420'}</p>
                <p>{config?.cidade_estado || 'Jardins - São Paulo, SP'}</p>
                <p className="text-[11px] text-gray-500 mt-1">Estacionamento próprio com manobrista</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs">
                <IconShield className="w-4 h-4" />
                <span>Procedência Certificada</span>
              </div>
              <p className="text-[11px] text-gray-400 leading-relaxed">
                100% dos veículos periciados com laudo cautelar aprovado e garantia documental.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-gray-500">
          <p>© {new Date().getFullYear()} {config?.nome || 'AutoPrime Motors'}. Todos os direitos reservados.</p>
          <div className="flex items-center gap-6">
            <span>Desenvolvido com padrão de excelência automotiva</span>
            <button
              onClick={() => onNavigate('contato')}
              className="text-gray-400 hover:text-amber-400 transition-colors"
            >
              Fale com um Consultor
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
