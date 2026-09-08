import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Vehicle, CompanyConfig, FilterState, ServiceItem } from './types';
import { fetchCompanyConfig, fetchVehicles, fetchServices } from './utils/api';
import { Header } from './components/Header';
import { HomeExclusive } from './components/HomeExclusive';
import { CatalogSection } from './components/CatalogSection';
import { VehicleDetailModal } from './components/VehicleDetailModal';
import { AboutSection } from './components/AboutSection';
import { ServicesSection } from './components/ServicesSection';
import { ContactSection } from './components/ContactSection';
import { FinancingAndAppraisalBanner } from './components/FinancingAndAppraisalBanner';
import { TestimonialsSection } from './components/TestimonialsSection';
import { Footer } from './components/Footer';
import { LeadModals, LeadModalType } from './components/LeadModals';
import { AdminPanel } from './components/AdminPanel';
import { IconWhatsApp } from './components/icons';
import { getWhatsAppLink } from './utils/formatters';

export default function App() {
  const [config, setConfig] = useState<CompanyConfig | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [isLoadingVehicles, setIsLoadingVehicles] = useState(true);

  // Tab navigation: 'inicio' | 'catalogo' | 'sobre' | 'servicos' | 'contato'
  const [activeNav, setActiveNav] = useState<'inicio' | 'catalogo' | 'sobre' | 'servicos' | 'contato'>('inicio');

  // Filter state for catalog
  const [filters, setFilters] = useState<FilterState>({
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

  // Modals state
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const [leadModalOpen, setLeadModalOpen] = useState(false);
  const [leadModalType, setLeadModalType] = useState<LeadModalType>('contato');
  const [leadModalVehicle, setLeadModalVehicle] = useState<Vehicle | null>(null);
  const [leadModalService, setLeadModalService] = useState<string>('');

  // Admin panel state (hidden from public UI, accessed only via #admin)
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  // Load config
  const loadConfig = useCallback(async () => {
    try {
      const data = await fetchCompanyConfig();
      setConfig(data);
    } catch (err) {
      console.error('Erro ao carregar configurações:', err);
    }
  }, []);

  // Load services
  const loadServices = useCallback(async () => {
    try {
      const list = await fetchServices();
      setServices(list);
    } catch (err) {
      console.error('Erro ao carregar serviços:', err);
    }
  }, []);

  // Load vehicles based on active filters
  const loadVehicles = useCallback(async () => {
    try {
      setIsLoadingVehicles(true);
      const list = await fetchVehicles(filters);
      setVehicles(list);
    } catch (err) {
      console.error('Erro ao carregar veículos:', err);
    } finally {
      setIsLoadingVehicles(false);
    }
  }, [filters]);

  useEffect(() => {
    loadConfig();
    loadServices();
  }, [loadConfig, loadServices]);

  useEffect(() => {
    loadVehicles();
  }, [loadVehicles]);

  // Handle URL hash changes for discrete admin access and direct tab links
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '').toLowerCase();
      if (hash === 'admin') {
        setIsAdminOpen(true);
      } else if (hash === 'catalogo' || hash === 'sobre' || hash === 'servicos' || hash === 'contato' || hash === 'inicio') {
        setActiveNav(hash);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  // Keyboard shortcut for discrete owner access: Ctrl + Shift + A
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        setIsAdminOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const navigateToTab = (
    tab: 'inicio' | 'catalogo' | 'sobre' | 'servicos' | 'contato',
    filterPreset?: Partial<FilterState>
  ) => {
    if (filterPreset) {
      setFilters((prev) => ({
        ...prev,
        ...filterPreset,
      }));
    }
    setActiveNav(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    try {
      window.history.pushState(null, '', `#${tab}`);
    } catch {
      window.location.hash = tab;
    }
  };

  // Modal Handlers
  const handleViewDetails = (v: Vehicle) => {
    setSelectedVehicle(v);
    setIsDetailModalOpen(true);
  };

  const handleInterest = (v: Vehicle) => {
    setLeadModalVehicle(v);
    setLeadModalType('contato');
    setLeadModalService('');
    setLeadModalOpen(true);
  };

  const handleOpenLeadModalFromDetail = (
    type: 'contato' | 'financiamento' | 'agendamento_visita',
    v: Vehicle
  ) => {
    setLeadModalVehicle(v);
    setLeadModalType(type);
    setLeadModalService('');
    setLeadModalOpen(true);
  };

  const handleRequestService = (serviceName: string) => {
    setLeadModalVehicle(null);
    setLeadModalType('contato');
    setLeadModalService(serviceName);
    setLeadModalOpen(true);
  };

  const handleOpenFinancing = () => {
    setLeadModalVehicle(null);
    setLeadModalType('financiamento');
    setLeadModalService('Simulação de Financiamento');
    setLeadModalOpen(true);
  };

  const handleOpenAppraisal = () => {
    setLeadModalVehicle(null);
    setLeadModalType('avaliacao_usado');
    setLeadModalService('Avaliação de Veículo Usado na Troca');
    setLeadModalOpen(true);
  };

  const floatingWhatsAppUrl = getWhatsAppLink(
    config?.whatsapp || '5511999998888',
    'Olá! Estou navegando no site da AutoPrime e gostaria de tirar uma dúvida.'
  );

  return (
    <div className="min-h-screen bg-[#0b0e14] text-white flex flex-col font-['Inter',sans-serif] selection:bg-amber-400 selection:text-black">
      {/* Fixed Header with Tab Navigation */}
      <Header
        config={config}
        activeNav={activeNav}
        setActiveNav={(nav) =>
          navigateToTab(nav as 'inicio' | 'catalogo' | 'sobre' | 'servicos' | 'contato')
        }
        openContactModal={(srv) => {
          setLeadModalService(srv || '');
          setLeadModalType('contato');
          setLeadModalVehicle(null);
          setLeadModalOpen(true);
        }}
      />

      {/* Main Content: Dedicated Tab Views */}
      <main className="flex-1">
        {/* TAB 1: INÍCIO - EXPERIÊNCIA EXCLUSIVA */}
        {activeNav === 'inicio' && (
          <HomeExclusive
            config={config}
            vehicles={vehicles}
            onNavigate={navigateToTab}
            onViewVehicleDetails={handleViewDetails}
            onOpenCustomOrderModal={() => {
              setLeadModalVehicle(null);
              setLeadModalType('contato');
              setLeadModalService('Veículo sob Encomenda (Personal Car Shopper)');
              setLeadModalOpen(true);
            }}
            onOpenVisitModal={() => {
              setLeadModalVehicle(null);
              setLeadModalType('agendamento_visita');
              setLeadModalService('Agendamento de Visita VIP ao Showroom');
              setLeadModalOpen(true);
            }}
          />
        )}

        {/* TAB 2: CATÁLOGO */}
        {activeNav === 'catalogo' && (
          <CatalogSection
            vehicles={vehicles}
            isLoading={isLoadingVehicles}
            filters={filters}
            setFilters={setFilters}
            onViewDetails={handleViewDetails}
            onInterest={handleInterest}
            whatsappNumber={config?.whatsapp}
            isDedicatedPage={true}
          />
        )}

        {/* TAB 3: SOBRE A EMPRESA */}
        {activeNav === 'sobre' && (
          <div>
            <AboutSection config={config} isDedicatedPage={true} />
            <TestimonialsSection />
          </div>
        )}

        {/* TAB 4: SERVIÇOS */}
        {activeNav === 'servicos' && (
          <div>
            <ServicesSection
              services={services}
              onRequestService={handleRequestService}
              isDedicatedPage={true}
            />
            <FinancingAndAppraisalBanner
              onOpenFinancing={handleOpenFinancing}
              onOpenAppraisal={handleOpenAppraisal}
            />
          </div>
        )}

        {/* TAB 5: CONTATO */}
        {activeNav === 'contato' && (
          <ContactSection
            config={config}
            onOpenFinancing={handleOpenFinancing}
            onOpenAppraisal={handleOpenAppraisal}
          />
        )}
      </main>

      {/* Footer with clean tab links & no admin links */}
      <Footer
        config={config}
        onNavigate={(tab) =>
          navigateToTab(tab as 'inicio' | 'catalogo' | 'sobre' | 'servicos' | 'contato')
        }
        onOpenFinancing={handleOpenFinancing}
        onOpenAppraisal={handleOpenAppraisal}
      />

      {/* Floating WhatsApp Action Button */}
      <a
        href={floatingWhatsAppUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold p-3.5 sm:px-4 sm:py-3 rounded-full shadow-2xl shadow-emerald-500/30 transition-all hover:scale-105 group focus:outline-none focus:ring-2 focus:ring-emerald-400"
        aria-label="Atendimento no WhatsApp"
        title="Falar no WhatsApp"
      >
        <IconWhatsApp className="w-6 h-6 text-black" />
        <span className="hidden sm:inline text-xs tracking-tight">Atendimento WhatsApp</span>
      </a>

      {/* Vehicle Details Modal */}
      {isDetailModalOpen && selectedVehicle && (
        <VehicleDetailModal
          vehicle={selectedVehicle}
          onClose={() => {
            setIsDetailModalOpen(false);
            setSelectedVehicle(null);
          }}
          onOpenLeadModal={handleOpenLeadModalFromDetail}
          onSelectSimilarVehicle={(sim) => {
            setSelectedVehicle(sim);
          }}
          whatsappNumber={config?.whatsapp}
        />
      )}

      {/* Lead / Contact / Financing / Appraisal Modal */}
      {leadModalOpen && (
        <LeadModals
          isOpen={leadModalOpen}
          type={leadModalType}
          selectedVehicle={leadModalVehicle}
          serviceTitle={leadModalService}
          onClose={() => {
            setLeadModalOpen(false);
            setLeadModalVehicle(null);
            setLeadModalService('');
          }}
          whatsappNumber={config?.whatsapp}
        />
      )}

      {/* Discrete Admin Panel (only opens via #admin route or keyboard shortcut, invisible to public) */}
      {isAdminOpen && (
        <AdminPanel
          isOpen={isAdminOpen}
          onClose={() => {
            setIsAdminOpen(false);
            if (window.location.hash === '#admin') {
              try {
                window.history.replaceState(null, '', window.location.pathname);
              } catch {
                window.location.hash = '';
              }
            }
          }}
          config={config}
          onConfigUpdated={loadConfig}
          onInventoryChanged={loadVehicles}
        />
      )}
    </div>
  );
}
