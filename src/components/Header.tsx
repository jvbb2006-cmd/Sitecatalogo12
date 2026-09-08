import React, { useState, useEffect } from 'react';
import { CompanyConfig } from '../types';
import { IconLogo, IconMenu, IconClose, IconWhatsApp, IconPhone } from './icons';
import { getWhatsAppLink } from '../utils/formatters';

interface HeaderProps {
  config: CompanyConfig | null;
  activeNav: string;
  setActiveNav: (nav: string) => void;
  openContactModal: (serviceName?: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  config,
  activeNav,
  setActiveNav,
  openContactModal,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { id: 'inicio', label: 'Início' },
    { id: 'catalogo', label: 'Catálogo' },
    { id: 'sobre', label: 'Sobre a Empresa' },
    { id: 'servicos', label: 'Serviços' },
    { id: 'contato', label: 'Contato' },
  ];

  const handleNavClick = (id: string) => {
    setActiveNav(id);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    try {
      window.history.pushState(null, '', `#${id}`);
    } catch {
      window.location.hash = id;
    }
  };

  const whatsAppLink = getWhatsAppLink(
    config?.whatsapp || '5511999998888',
    'Olá! Estava navegando no site da concessionária e gostaria de falar com um consultor.'
  );

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled
            ? 'bg-[#0b0e14]/95 backdrop-blur-md border-b border-white/10 shadow-xl py-3'
            : 'bg-gradient-to-b from-[#0b0e14]/90 to-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Brand Logo */}
          <a
            href="#inicio"
            onClick={(e) => {
              e.preventDefault();
              handleNavClick('inicio');
            }}
            className="flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-amber-500 rounded-lg p-1"
          >
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-black shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
              <IconLogo className="w-6 h-6 text-black" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5 font-['Space_Grotesk']">
                {config?.nome || 'AutoPrime'}
                <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  MOTORS
                </span>
              </span>
              <span className="text-[10px] tracking-wider text-gray-400 uppercase hidden sm:block">
                Veículos Selecionados
              </span>
            </div>
          </a>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden lg:flex items-center gap-1 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                  activeNav === item.id
                    ? 'text-black bg-amber-400 font-bold shadow-md shadow-amber-400/20'
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Action Button - WhatsApp Priority */}
          <div className="hidden sm:flex items-center gap-3">
            <a
              href={whatsAppLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-black bg-emerald-400 hover:bg-emerald-300 shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            >
              <IconWhatsApp className="w-4 h-4 text-black" />
              <span>WhatsApp</span>
            </a>
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex items-center gap-2 lg:hidden">
            <a
              href={whatsAppLink}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-400"
              title="WhatsApp"
            >
              <IconWhatsApp className="w-5 h-5 text-emerald-400" />
            </a>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-white/5 border border-white/10 text-gray-200 hover:text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-amber-500"
              aria-label="Abrir menu de navegação"
            >
              {mobileMenuOpen ? (
                <IconClose className="w-6 h-6 animate-spin-once" />
              ) : (
                <IconMenu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar Navigation Drawer */}
      <div
        className={`fixed inset-0 z-50 lg:hidden transition-opacity duration-300 ${
          mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />

        {/* Drawer content */}
        <div
          className={`absolute top-0 right-0 w-80 max-w-[85vw] h-full bg-[#11141c] border-l border-white/10 p-6 flex flex-col justify-between shadow-2xl transition-transform duration-300 ${
            mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div>
            <div className="flex items-center justify-between pb-6 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded bg-amber-500 flex items-center justify-center text-black">
                  <IconLogo className="w-5 h-5" />
                </div>
                <span className="font-bold text-lg text-white font-['Space_Grotesk']">
                  {config?.nome || 'AutoPrime'}
                </span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10"
              >
                <IconClose className="w-5 h-5" />
              </button>
            </div>

            <nav className="mt-6 flex flex-col gap-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl text-left text-sm font-medium transition-all ${
                    activeNav === item.id
                      ? 'bg-amber-400 text-black font-bold shadow-md shadow-amber-400/20'
                      : 'text-gray-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <span>{item.label}</span>
                  <span className="text-xs opacity-60">→</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="pt-6 border-t border-white/10 flex flex-col gap-3">
            <a
              href={whatsAppLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-black bg-emerald-400 hover:bg-emerald-300 shadow-lg text-sm"
            >
              <IconWhatsApp className="w-5 h-5" />
              <span>Falar no WhatsApp</span>
            </a>

            {config?.telefone && (
              <div className="flex items-center gap-2 text-xs text-gray-400 justify-center mt-2">
                <IconPhone className="w-3.5 h-3.5 text-gray-500" />
                <span>{config.telefone}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
