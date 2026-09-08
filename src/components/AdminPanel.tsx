import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Vehicle, CompanyConfig, ContactLead, AdminStats } from '../types';
import {
  IconDashboard,
  IconCar,
  IconPlus,
  IconEdit,
  IconDelete,
  IconClose,
  IconCheck,
  IconWhatsApp,
  IconSearch,
  IconStar,
  IconSold,
  IconUpload,
  IconSettings,
  IconEye,
  IconCopy,
  IconLogout,
  IconClock,
  IconRefresh,
  IconMail,
  IconPhone,
  IconFinance,
  IconTestDrive,
} from './icons';
import { formatCurrency, formatKm, formatDate, getWhatsAppLink } from '../utils/formatters';
import {
  fetchVehicles,
  createVehicle,
  updateVehicle,
  updateVehicleStatus,
  toggleVehicleDestaque,
  toggleVehicleOferta,
  duplicateVehicle,
  deleteVehicle,
  restoreVehicle,
  uploadImage,
  fetchContacts,
  updateContactStatus,
  deleteContact,
  fetchAdminStats,
  loginAdmin,
  logoutAdmin,
  updateCompanyConfig,
  checkAdminSession,
} from '../utils/api';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  config: CompanyConfig | null;
  onConfigUpdated: () => void;
  onInventoryChanged: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  isOpen,
  onClose,
  config,
  onConfigUpdated,
  onInventoryChanged,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return Boolean(localStorage.getItem('autoprime_admin_token'));
  });
  const [activeTab, setActiveTab] = useState<'dashboard' | 'veiculos' | 'contatos' | 'config'>('dashboard');

  // Login form state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Data states
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [contacts, setContacts] = useState<ContactLead[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date>(new Date());

  // Filters
  const [searchVehicles, setSearchVehicles] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'disponivel' | 'reservado' | 'vendido' | 'trash'>('all');
  const [leadStatusFilter, setLeadStatusFilter] = useState<'all' | 'novo' | 'em_atendimento' | 'concluido'>('all');
  const [searchLeads, setSearchLeads] = useState('');

  // Selected lead for detailed view modal
  const [selectedLeadModal, setSelectedLeadModal] = useState<ContactLead | null>(null);

  // Vehicle Edit / Create Modal state
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Partial<Vehicle> | null>(null);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [featuresList, setFeaturesList] = useState<string[]>([]);
  const [newFeatureText, setNewFeatureText] = useState('');
  const [isSavingVehicle, setIsSavingVehicle] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [vehicleModalError, setVehicleModalError] = useState<string | null>(null);

  // Config settings form state
  const [formDataConfig, setFormDataConfig] = useState<Partial<CompanyConfig>>({});
  const [isSavingConfig, setIsSavingConfig] = useState(false);
  const [configSuccessMsg, setConfigSuccessMsg] = useState<string | null>(null);

  // Dynamic real-time calculated KPIs directly from state (updates with 0ms lag)
  const activeVehicles = useMemo(() => vehicles.filter((v) => !v.is_deleted), [vehicles]);
  const deletedVehicles = useMemo(() => vehicles.filter((v) => Boolean(v.is_deleted === 1)), [vehicles]);

  const kpiTotalEstoque = activeVehicles.length;
  const kpiDisponiveis = activeVehicles.filter((v) => v.status === 'disponivel').length;
  const kpiVendidos = activeVehicles.filter((v) => v.status === 'vendido').length;
  const kpiReservados = activeVehicles.filter((v) => v.status === 'reservado').length;
  const kpiOfertas = activeVehicles.filter((v) => v.em_oferta === 1).length;

  const kpiTotalContatos = contacts.length;
  const kpiNovosContatos = contacts.filter((c) => c.status === 'novo').length;

  // Load data from backend
  const loadAdminData = useCallback(async (silent = false) => {
    if (!silent) setIsLoadingData(true);
    try {
      const [statsRes, vehiclesRes, contactsRes] = await Promise.all([
        fetchAdminStats().catch((err) => {
          if (err?.message?.includes('401') || err?.message?.includes('autorizado')) {
            logoutAdmin();
            setIsAuthenticated(false);
          }
          return null;
        }),
        fetchVehicles(undefined, true).catch(() => []),
        fetchContacts().catch((err) => {
          if (err?.message?.includes('401') || err?.message?.includes('autorizado')) {
            logoutAdmin();
            setIsAuthenticated(false);
          }
          return [];
        }),
      ]);

      if (statsRes) setStats(statsRes.stats);
      if (vehiclesRes && Array.isArray(vehiclesRes)) setVehicles(vehiclesRes);
      if (contactsRes && Array.isArray(contactsRes)) setContacts(contactsRes);
      setLastRefreshedAt(new Date());
    } catch (err) {
      console.error('Erro ao sincronizar dados do painel:', err);
    } finally {
      if (!silent) setIsLoadingData(false);
    }
  }, []);

  // Check session validity and initial load
  useEffect(() => {
    if (!isOpen) return;

    const init = async () => {
      const token = localStorage.getItem('autoprime_admin_token');
      if (!token) {
        setIsAuthenticated(false);
        return;
      }
      const isValid = await checkAdminSession();
      if (!isValid) {
        logoutAdmin();
        setIsAuthenticated(false);
        return;
      }
      setIsAuthenticated(true);
      await loadAdminData(false);
    };

    init();
  }, [isOpen, loadAdminData]);

  // Sync config into state
  useEffect(() => {
    if (config) {
      setFormDataConfig(config);
    }
  }, [config]);

  // Auto-polling every 8 seconds to catch incoming leads and inventory changes
  useEffect(() => {
    if (!isAuthenticated || !isOpen) return;

    const interval = setInterval(() => {
      loadAdminData(true);
    }, 8000);

    return () => clearInterval(interval);
  }, [isAuthenticated, isOpen, loadAdminData]);

  if (!isOpen) return null;

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    try {
      setIsLoggingIn(true);
      await loginAdmin(username, password);
      setIsAuthenticated(true);
      await loadAdminData(false);
    } catch (err: any) {
      setLoginError(err.message || 'Usuário ou senha incorretos.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Handle Logout
  const handleLogout = () => {
    logoutAdmin();
    setIsAuthenticated(false);
  };

  // Quick Inline Status Change with Optimistic Feedback
  const handleQuickStatus = async (id: number, newStatus: 'disponivel' | 'reservado' | 'vendido') => {
    // Immediate optimistic update on UI
    setVehicles((prev) =>
      prev.map((v) => (v.id === id ? { ...v, status: newStatus } : v))
    );
    try {
      await updateVehicleStatus(id, newStatus);
      onInventoryChanged();
      loadAdminData(true);
    } catch (err: any) {
      alert(err.message || 'Erro ao alterar status');
      await loadAdminData();
    }
  };

  // Quick Inline Destaque Toggle with Optimistic Feedback
  const handleToggleDestaque = async (id: number) => {
    setVehicles((prev) =>
      prev.map((v) => (v.id === id ? { ...v, destaque: v.destaque === 1 ? 0 : 1 } : v))
    );
    try {
      await toggleVehicleDestaque(id);
      onInventoryChanged();
      loadAdminData(true);
    } catch (err: any) {
      alert(err.message || 'Erro ao alterar destaque');
      await loadAdminData();
    }
  };

  // Quick Inline Oferta Toggle with Optimistic Feedback
  const handleToggleOferta = async (id: number) => {
    setVehicles((prev) =>
      prev.map((v) => (v.id === id ? { ...v, em_oferta: v.em_oferta === 1 ? 0 : 1 } : v))
    );
    try {
      await toggleVehicleOferta(id);
      onInventoryChanged();
      loadAdminData(true);
    } catch (err: any) {
      alert(err.message || 'Erro ao alterar oferta');
      await loadAdminData();
    }
  };

  // Duplicate Vehicle
  const handleDuplicate = async (id: number) => {
    if (!confirm('Deseja duplicar este anúncio no catálogo?')) return;
    try {
      await duplicateVehicle(id);
      await loadAdminData(false);
      onInventoryChanged();
    } catch (err: any) {
      alert(err.message || 'Erro ao duplicar veículo');
    }
  };

  // Delete / Soft Delete Vehicle with Instant Optimistic Removal
  const handleDeleteVehicle = async (id: number, permanent = false) => {
    const msg = permanent
      ? 'Tem certeza de que deseja EXCLUIR DEFINITIVAMENTE este veículo? Essa ação é permanente.'
      : 'Mover veículo para a lixeira? (Ele deixará de aparecer no site, mas poderá ser restaurado a qualquer momento).';
    if (!confirm(msg)) return;

    // Optimistic removal from active list
    if (permanent) {
      setVehicles((prev) => prev.filter((v) => v.id !== id));
    } else {
      setVehicles((prev) =>
        prev.map((v) => (v.id === id ? { ...v, is_deleted: 1 } : v))
      );
    }
    onInventoryChanged();

    try {
      await deleteVehicle(id, permanent);
      loadAdminData(true);
    } catch (err: any) {
      alert(err.message || 'Erro ao excluir veículo');
      await loadAdminData();
    }
  };

  // Restore Vehicle with Instant Optimistic Feedback
  const handleRestoreVehicle = async (id: number) => {
    setVehicles((prev) =>
      prev.map((v) => (v.id === id ? { ...v, is_deleted: 0 } : v))
    );
    onInventoryChanged();

    try {
      await restoreVehicle(id);
      loadAdminData(true);
    } catch (err: any) {
      alert(err.message || 'Erro ao restaurar veículo');
      await loadAdminData();
    }
  };

  // Open Vehicle Modal for Create or Edit
  const handleOpenVehicleModal = (v?: Vehicle) => {
    setVehicleModalError(null);
    if (v) {
      setEditingVehicle({ ...v });
      setImageUrls(v.images && v.images.length > 0 ? [...v.images] : [v.cover_image]);
      setFeaturesList(v.features ? [...v.features] : []);
    } else {
      setEditingVehicle({
        marca: '',
        modelo: '',
        versao: '',
        categoria: 'Sedan',
        ano_fabricacao: new Date().getFullYear(),
        ano_modelo: new Date().getFullYear(),
        km: 0,
        combustivel: 'Gasolina',
        cambio: 'Automático',
        cor: 'Preto',
        portas: 4,
        placa_final: '1',
        preco: 250000,
        preco_promocional: 0,
        status: 'disponivel',
        condicao: 'Seminovo',
        destaque: 0,
        em_oferta: 0,
        descricao: '',
      });
      setImageUrls([
        'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80',
      ]);
      setFeaturesList([
        'Ar condicionado digital dual-zone',
        'Bancos revestidos em couro',
        'Faróis Full LED com acendimento automático',
        'Central multimídia com espelhamento sem fio',
        'Câmera de ré e sensores dianteiros/traseiros',
        'Controle de cruzeiro adaptativo (ACC)',
      ]);
    }
    setIsVehicleModalOpen(true);
  };

  // Upload Real Image File
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingImage(true);
      const url = await uploadImage(file);
      setImageUrls((prev) => [...prev, url]);
    } catch (err: any) {
      alert(err.message || 'Erro no upload da imagem');
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Add Image URL
  const handleAddImageUrl = () => {
    if (!newImageUrl.trim()) return;
    setImageUrls((prev) => [...prev, newImageUrl.trim()]);
    setNewImageUrl('');
  };

  // Add Feature
  const handleAddFeature = () => {
    if (!newFeatureText.trim()) return;
    setFeaturesList((prev) => [...prev, newFeatureText.trim()]);
    setNewFeatureText('');
  };

  // Save Vehicle
  const handleSaveVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVehicle) return;
    setVehicleModalError(null);

    if (!editingVehicle.marca?.trim() || !editingVehicle.modelo?.trim()) {
      setVehicleModalError('Marca e Modelo são obrigatórios.');
      return;
    }

    try {
      setIsSavingVehicle(true);
      const payload = {
        ...editingVehicle,
        cover_image: imageUrls[0] || '',
        images: imageUrls,
        features: featuresList,
      };

      if (editingVehicle.id) {
        await updateVehicle(editingVehicle.id, payload);
      } else {
        await createVehicle(payload);
      }

      setIsVehicleModalOpen(false);
      await loadAdminData(false);
      onInventoryChanged();
    } catch (err: any) {
      setVehicleModalError(err.message || 'Erro ao salvar veículo');
    } finally {
      setIsSavingVehicle(false);
    }
  };

  // Save Company Config
  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSavingConfig(true);
      setConfigSuccessMsg(null);
      await updateCompanyConfig(formDataConfig);
      setConfigSuccessMsg('Configurações salvas com sucesso no banco de dados!');
      onConfigUpdated();
      setTimeout(() => setConfigSuccessMsg(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Erro ao salvar configurações');
    } finally {
      setIsSavingConfig(false);
    }
  };

  // Change Lead Status with Optimistic Feedback
  const handleContactStatus = async (id: number, status: 'novo' | 'em_atendimento' | 'concluido') => {
    setContacts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status } : c))
    );
    if (selectedLeadModal?.id === id) {
      setSelectedLeadModal((prev) => prev ? { ...prev, status } : null);
    }
    try {
      await updateContactStatus(id, status);
      loadAdminData(true);
    } catch (err) {
      console.error('Erro ao atualizar status do lead:', err);
      await loadAdminData();
    }
  };

  // Delete Contact Lead
  const handleDeleteContact = async (id: number) => {
    if (!confirm('Deseja excluir este lead?')) return;
    setContacts((prev) => prev.filter((c) => c.id !== id));
    if (selectedLeadModal?.id === id) {
      setSelectedLeadModal(null);
    }
    try {
      await deleteContact(id);
      loadAdminData(true);
    } catch (err) {
      console.error('Erro ao excluir contato:', err);
      await loadAdminData();
    }
  };

  // Filtered vehicles list using is_deleted === 1 check
  const filteredVehicles = vehicles.filter((v) => {
    const isDeleted = Boolean(v.is_deleted === 1);
    if (statusFilter === 'trash') {
      if (!isDeleted) return false;
    } else {
      if (isDeleted) return false;
      if (statusFilter !== 'all' && v.status !== statusFilter) return false;
    }

    if (searchVehicles) {
      const q = searchVehicles.toLowerCase();
      const match =
        v.marca.toLowerCase().includes(q) ||
        v.modelo.toLowerCase().includes(q) ||
        (v.versao && v.versao.toLowerCase().includes(q)) ||
        v.categoria.toLowerCase().includes(q);
      if (!match) return false;
    }

    return true;
  });

  // Filtered contacts list
  const filteredContacts = contacts.filter((c) => {
    if (leadStatusFilter !== 'all' && c.status !== leadStatusFilter) return false;
    if (searchLeads) {
      const q = searchLeads.toLowerCase();
      const match =
        c.nome.toLowerCase().includes(q) ||
        c.telefone.toLowerCase().includes(q) ||
        (c.email && c.email.toLowerCase().includes(q)) ||
        (c.veiculo_nome && c.veiculo_nome.toLowerCase().includes(q)) ||
        (c.mensagem && c.mensagem.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/90 backdrop-blur-md flex items-center justify-center p-0 sm:p-4">
      <div className="relative bg-[#0d1017] sm:border sm:border-white/15 sm:rounded-3xl w-full max-w-6xl h-full sm:h-auto sm:max-h-[94vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Admin Header */}
        <div className="bg-[#131722] px-4 sm:px-6 py-3.5 sm:py-4 border-b border-white/10 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-400 text-black flex items-center justify-center font-bold shrink-0 shadow-lg shadow-amber-500/20">
              <IconDashboard className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-bold text-white font-['Space_Grotesk'] truncate">
                Painel Administrativo
              </h2>
              <p className="text-[11px] sm:text-xs text-gray-400 truncate">
                {config?.nome || 'AutoPrime Motors'} • Gestão de Estoque & Leads
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isAuthenticated && (
              <>
                <button
                  onClick={() => loadAdminData(false)}
                  disabled={isLoadingData}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-gray-300 hover:text-white border border-white/10 transition-colors"
                  title="Atualizar dados e sincronizar"
                >
                  <IconRefresh className={`w-3.5 h-3.5 ${isLoadingData ? 'animate-spin text-amber-400' : ''}`} />
                  <span className="hidden md:inline">Atualizar</span>
                </button>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-gray-300 hover:text-white border border-white/10 transition-colors"
                  title="Sair da sessão"
                >
                  <IconLogout className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Sair</span>
                </button>
              </>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/10 transition-colors"
              title="Fechar painel"
            >
              <IconClose className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Auth Check or Main Screen */}
        {!isAuthenticated ? (
          /* Login Screen */
          <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex items-center justify-center">
            <div className="w-full max-w-md bg-[#131722] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-xl space-y-5">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-amber-400 text-black mx-auto flex items-center justify-center font-black shadow-lg shadow-amber-500/20">
                  <IconDashboard className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white font-['Space_Grotesk']">
                  Acesso Restrito do Proprietário
                </h3>
                <p className="text-xs text-gray-400">
                  Faça login para gerenciar seu estoque, propostas de leads e configurações.
                </p>
              </div>

              {loginError && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-400 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4 text-xs">
                <div>
                  <label className="block text-gray-300 font-medium mb-1.5">Usuário Administrador</label>
                  <input
                    type="text"
                    required
                    autoComplete="username"
                    placeholder="Digite seu usuário"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-[#0d1017] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-medium mb-1.5">Senha de Acesso</label>
                  <input
                    type="password"
                    required
                    autoComplete="current-password"
                    placeholder="Digite sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#0d1017] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-sm shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50"
                >
                  {isLoggingIn ? 'Entrando...' : 'Entrar no Painel'}
                </button>
              </form>
            </div>
          </div>
        ) : (
          /* Authenticated Dashboard View */
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Navigation Tabs */}
            <div className="bg-[#11141d] px-4 sm:px-6 border-b border-white/10 flex gap-2 overflow-x-auto shrink-0 scrollbar-none">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`py-3.5 px-3 sm:px-4 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${
                  activeTab === 'dashboard'
                    ? 'border-amber-400 text-amber-400'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                <IconDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </button>

              <button
                onClick={() => setActiveTab('veiculos')}
                className={`py-3.5 px-3 sm:px-4 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${
                  activeTab === 'veiculos'
                    ? 'border-amber-400 text-amber-400'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                <IconCar className="w-4 h-4" />
                <span>Gestão de Veículos</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/10 text-white font-bold">
                  {kpiTotalEstoque}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('contatos')}
                className={`py-3.5 px-3 sm:px-4 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${
                  activeTab === 'contatos'
                    ? 'border-amber-400 text-amber-400'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                <IconMail className="w-4 h-4" />
                <span>Mensagens & Leads</span>
                {kpiNovosContatos > 0 && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500 text-white font-bold animate-pulse">
                    {kpiNovosContatos} novo(s)
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('config')}
                className={`py-3.5 px-3 sm:px-4 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${
                  activeTab === 'config'
                    ? 'border-amber-400 text-amber-400'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                <IconSettings className="w-4 h-4" />
                <span>Configurações & Métricas</span>
              </button>
            </div>

            {/* Tab Contents */}
            <div className="p-4 sm:p-6 flex-1 overflow-y-auto space-y-6">
              
              {/* TAB 1: DASHBOARD */}
              {activeTab === 'dashboard' && (
                <div className="space-y-6">
                  {/* Dynamic KPI Cards (Reflects vehicle status change instantly) */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
                    <div className="bg-[#151924] border border-white/10 p-4 sm:p-5 rounded-2xl">
                      <span className="text-xs text-gray-400">Total em Estoque</span>
                      <div className="text-2xl sm:text-3xl font-black text-white font-['Space_Grotesk'] mt-1">
                        {kpiTotalEstoque}
                      </div>
                      <span className="text-[11px] text-gray-500">Veículos ativos</span>
                    </div>

                    <div className="bg-[#151924] border border-emerald-500/20 p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-[#151924] to-emerald-950/10">
                      <span className="text-xs text-emerald-400">Disponíveis</span>
                      <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-['Space_Grotesk'] mt-1">
                        {kpiDisponiveis}
                      </div>
                      <span className="text-[11px] text-gray-500">Prontos para venda</span>
                    </div>

                    <div className="bg-[#151924] border border-rose-500/20 p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-[#151924] to-rose-950/10">
                      <span className="text-xs text-rose-400">Vendidos</span>
                      <div className="text-2xl sm:text-3xl font-black text-rose-400 font-['Space_Grotesk'] mt-1">
                        {kpiVendidos}
                      </div>
                      <span className="text-[11px] text-gray-500">Atualiza em tempo real</span>
                    </div>

                    <div className="bg-[#151924] border border-amber-500/20 p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-[#151924] to-amber-950/10">
                      <span className="text-xs text-amber-400">Em Oferta</span>
                      <div className="text-2xl sm:text-3xl font-black text-amber-400 font-['Space_Grotesk'] mt-1">
                        {kpiOfertas}
                      </div>
                      <span className="text-[11px] text-gray-500">Com preço promocional</span>
                    </div>

                    <div className="bg-[#151924] border border-blue-500/20 p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-[#151924] to-blue-950/10 col-span-2 sm:col-span-1">
                      <span className="text-xs text-blue-400">Leads & Propostas</span>
                      <div className="text-2xl sm:text-3xl font-black text-blue-400 font-['Space_Grotesk'] mt-1">
                        {kpiTotalContatos}
                      </div>
                      <span className="text-[11px] text-blue-300 font-semibold">
                        {kpiNovosContatos} aguardando contato
                      </span>
                    </div>
                  </div>

                  {/* Quick Action Banner */}
                  <div className="bg-gradient-to-r from-[#171b26] to-[#1e2333] border border-white/10 p-5 sm:p-6 rounded-2xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-base font-bold text-white font-['Space_Grotesk']">
                        Cadastrar Novo Veículo no Estoque
                      </h3>
                      <p className="text-xs text-gray-400 mt-1">
                        Adicione novos modelos com galeria de fotos, itens de série, valores e ficha técnica.
                      </p>
                    </div>
                    <button
                      onClick={() => handleOpenVehicleModal()}
                      className="px-5 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 whitespace-nowrap transition-all"
                    >
                      <IconPlus className="w-4 h-4" />
                      <span>Cadastrar Veículo</span>
                    </button>
                  </div>

                  {/* Recent Leads Preview with Detailed Messages */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm sm:text-base font-bold text-white font-['Space_Grotesk']">
                          Últimas Mensagens e Propostas Recebidas
                        </h3>
                        <p className="text-xs text-gray-400">
                          Visualize na íntegra a mensagem, contato e veículo de interesse enviado pelo cliente.
                        </p>
                      </div>
                      <button
                        onClick={() => setActiveTab('contatos')}
                        className="text-xs text-amber-400 hover:underline font-semibold"
                      >
                        Ver todas ({contacts.length})
                      </button>
                    </div>

                    {contacts.length === 0 ? (
                      <div className="bg-[#151924] border border-white/5 p-8 rounded-2xl text-center space-y-2">
                        <IconMail className="w-8 h-8 text-gray-500 mx-auto" />
                        <p className="text-sm text-gray-300 font-semibold">Nenhuma mensagem registrada ainda.</p>
                        <p className="text-xs text-gray-500">Quando um cliente enviar uma proposta no site, ela aparecerá automaticamente aqui.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                        {contacts.slice(0, 4).map((c) => (
                          <div
                            key={c.id}
                            className="bg-[#151924] border border-white/10 rounded-2xl p-4 sm:p-5 flex flex-col justify-between gap-3 hover:border-white/20 transition-all"
                          >
                            <div className="space-y-2.5">
                              {/* Header: Name, Status and Date */}
                              <div className="flex items-center justify-between gap-2">
                                <div className="min-w-0">
                                  <div className="font-bold text-sm sm:text-base text-white truncate">{c.nome}</div>
                                  <div className="text-[11px] text-gray-400 flex items-center gap-2">
                                    <span>{formatDate(c.created_at)}</span>
                                    <span>•</span>
                                    <span className="text-amber-400 font-medium capitalize">{c.tipo.replace('_', ' ')}</span>
                                  </div>
                                </div>
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                                    c.status === 'novo'
                                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                      : c.status === 'em_atendimento'
                                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                      : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                  }`}
                                >
                                  {c.status.replace('_', ' ')}
                                </span>
                              </div>

                              {/* Vehicle / Service interest info */}
                              {c.veiculo_nome && (
                                <div className="text-xs bg-white/5 px-3 py-1.5 rounded-lg text-gray-300 flex items-center gap-2">
                                  <IconCar className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                  <span className="font-medium text-white truncate">{c.veiculo_nome}</span>
                                </div>
                              )}

                              {/* Proposal details if financing or trade-in */}
                              {(c.valor_entrada || c.veiculo_troca) && (
                                <div className="text-[11px] text-gray-400 space-y-0.5 bg-black/20 p-2.5 rounded-lg border border-white/5">
                                  {c.valor_entrada ? (
                                    <div>
                                      Entrada proposta: <strong className="text-emerald-400">{formatCurrency(c.valor_entrada)}</strong> em {c.parcelas} parcelas
                                    </div>
                                  ) : null}
                                  {c.veiculo_troca ? (
                                    <div>
                                      Veículo na troca: <strong className="text-white">{c.veiculo_troca}</strong>
                                    </div>
                                  ) : null}
                                </div>
                              )}

                              {/* Message body */}
                              <div className="bg-[#0e121a] p-3 rounded-xl border border-white/5 text-xs text-gray-300 italic line-clamp-3">
                                "{c.mensagem || 'Mensagem de solicitação de contato enviada pelo formulário.'}"
                              </div>
                            </div>

                            {/* Actions footer */}
                            <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-2">
                              <div className="text-xs text-gray-400 truncate">
                                Tel: <span className="text-white font-medium">{c.telefone}</span>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <a
                                  href={getWhatsAppLink(
                                    c.telefone,
                                    `Olá ${c.nome}! Sou consultor da ${config?.nome || 'AutoPrime Motors'}. Recebemos sua mensagem sobre ${c.veiculo_nome || 'nossos veículos'} e estamos à disposição.`
                                  )}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 font-semibold text-xs flex items-center gap-1.5 transition-colors"
                                >
                                  <IconWhatsApp className="w-3.5 h-3.5" />
                                  <span>WhatsApp</span>
                                </a>
                                <button
                                  onClick={() => setSelectedLeadModal(c)}
                                  className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white font-semibold text-xs transition-colors"
                                >
                                  Ver Tudo
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: VEÍCULOS MANAGEMENT */}
              {activeTab === 'veiculos' && (
                <div className="space-y-4">
                  {/* Top Filter and Actions Bar */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-1 max-w-xl">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          placeholder="Buscar por marca, modelo..."
                          value={searchVehicles}
                          onChange={(e) => setSearchVehicles(e.target.value)}
                          className="w-full bg-[#151924] border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 transition-colors"
                        />
                        <IconSearch className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-3" />
                      </div>

                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as any)}
                        className="bg-[#151924] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 transition-colors"
                      >
                        <option value="all">Todos os Status ({kpiTotalEstoque})</option>
                        <option value="disponivel">Disponíveis ({kpiDisponiveis})</option>
                        <option value="reservado">Reservados ({kpiReservados})</option>
                        <option value="vendido">Vendidos ({kpiVendidos})</option>
                        <option value="trash">Lixeira / Excluídos ({deletedVehicles.length})</option>
                      </select>
                    </div>

                    <button
                      onClick={() => handleOpenVehicleModal()}
                      className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 whitespace-nowrap transition-all"
                    >
                      <IconPlus className="w-4 h-4" />
                      <span>Cadastrar Veículo</span>
                    </button>
                  </div>

                  {/* Empty state */}
                  {filteredVehicles.length === 0 && (
                    <div className="bg-[#151924] border border-white/5 p-8 rounded-2xl text-center space-y-2">
                      <IconCar className="w-8 h-8 text-gray-500 mx-auto" />
                      <p className="text-sm text-gray-300 font-semibold">Nenhum veículo encontrado com os filtros atuais.</p>
                      <p className="text-xs text-gray-500">Tente buscar por outro termo ou mude o filtro de status.</p>
                    </div>
                  )}

                  {/* Mobile Cards View (Visible on screens < 768px) */}
                  <div className="block md:hidden space-y-3">
                    {filteredVehicles.map((v) => {
                      const isDeleted = Boolean(v.is_deleted === 1);
                      return (
                        <div
                          key={v.id}
                          className={`bg-[#151924] border rounded-2xl p-4 space-y-3 ${
                            isDeleted ? 'border-rose-900/30 opacity-60 bg-rose-950/10' : 'border-white/10'
                          }`}
                        >
                          <div className="flex gap-3 items-center">
                            <img
                              src={v.cover_image}
                              alt=""
                              className="w-20 h-16 object-cover rounded-xl bg-black/40 shrink-0 border border-white/10"
                            />
                            <div className="min-w-0 flex-1">
                              <span className="text-[10px] text-amber-400 uppercase font-bold tracking-wider">
                                {v.marca}
                              </span>
                              <div className="font-bold text-white text-sm truncate">
                                {v.modelo}
                              </div>
                              <div className="text-[11px] text-gray-400 truncate">
                                {v.versao}
                              </div>
                              <div className="text-xs font-bold text-white mt-1">
                                {v.preco_promocional > 0 && v.preco_promocional < v.preco ? (
                                  <span className="text-emerald-400">
                                    {formatCurrency(v.preco_promocional)}{' '}
                                    <span className="text-[10px] text-gray-500 line-through">
                                      {formatCurrency(v.preco)}
                                    </span>
                                  </span>
                                ) : (
                                  formatCurrency(v.preco)
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-xs text-gray-400 pt-1 border-t border-white/5">
                            <span>{v.ano_fabricacao}/{v.ano_modelo} • {formatKm(v.km)}</span>
                            <span>{v.categoria} • {v.combustivel}</span>
                          </div>

                          {/* Status and Action Buttons */}
                          <div className="pt-2 border-t border-white/5 flex flex-col gap-2.5">
                            {!isDeleted ? (
                              <>
                                <div className="flex items-center gap-2">
                                  <label className="text-[11px] text-gray-400 shrink-0">Status:</label>
                                  <select
                                    value={v.status}
                                    onChange={(e) => handleQuickStatus(v.id, e.target.value as any)}
                                    className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-bold border focus:outline-none cursor-pointer ${
                                      v.status === 'disponivel'
                                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                                        : v.status === 'reservado'
                                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                                        : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                                    }`}
                                  >
                                    <option value="disponivel">Disponível</option>
                                    <option value="reservado">Reservado</option>
                                    <option value="vendido">Vendido</option>
                                  </select>
                                </div>

                                <div className="grid grid-cols-4 gap-1.5">
                                  <button
                                    onClick={() => handleToggleDestaque(v.id)}
                                    className={`py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 border ${
                                      v.destaque === 1
                                        ? 'bg-amber-400 text-black border-amber-400 font-bold'
                                        : 'bg-white/5 text-gray-400 border-white/10'
                                    }`}
                                  >
                                    <IconStar className="w-3.5 h-3.5" />
                                    <span>{v.destaque === 1 ? 'Destaque' : 'Destacar'}</span>
                                  </button>

                                  <button
                                    onClick={() => handleToggleOferta(v.id)}
                                    className={`py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 border ${
                                      v.em_oferta === 1
                                        ? 'bg-emerald-500 text-white border-emerald-500 font-bold'
                                        : 'bg-white/5 text-gray-400 border-white/10'
                                    }`}
                                  >
                                    <span>Oferta</span>
                                  </button>

                                  <button
                                    onClick={() => handleOpenVehicleModal(v)}
                                    className="py-2 rounded-xl bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-semibold flex items-center justify-center gap-1"
                                  >
                                    <IconEdit className="w-3.5 h-3.5" />
                                    <span>Editar</span>
                                  </button>

                                  <button
                                    onClick={() => handleDeleteVehicle(v.id, false)}
                                    className="py-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs font-semibold flex items-center justify-center gap-1"
                                  >
                                    <IconDelete className="w-3.5 h-3.5" />
                                    <span>Apagar</span>
                                  </button>
                                </div>
                              </>
                            ) : (
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleRestoreVehicle(v.id)}
                                  className="flex-1 py-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold"
                                >
                                  Restaurar Veículo
                                </button>
                                <button
                                  onClick={() => handleDeleteVehicle(v.id, true)}
                                  className="py-2 px-3 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold"
                                  title="Excluir do banco"
                                >
                                  Excluir Definitivo
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Desktop Inventory Table (Visible on md and larger) */}
                  <div className="hidden md:block bg-[#151924] border border-white/10 rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs text-gray-300">
                        <thead className="bg-[#11141d] text-gray-400 text-[11px] uppercase border-b border-white/10">
                          <tr>
                            <th className="p-3.5">Veículo</th>
                            <th className="p-3.5">Ano / Km</th>
                            <th className="p-3.5">Preço</th>
                            <th className="p-3.5">Status do Estoque</th>
                            <th className="p-3.5 text-center">Destaques</th>
                            <th className="p-3.5 text-right">Ações</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {filteredVehicles.map((v) => {
                            const isDeleted = Boolean(v.is_deleted === 1);
                            return (
                              <tr
                                key={v.id}
                                className={`hover:bg-white/5 transition-colors ${
                                  isDeleted ? 'opacity-50 bg-rose-950/10' : ''
                                }`}
                              >
                                {/* Thumbnail & Title */}
                                <td className="p-3.5 flex items-center gap-3">
                                  <img
                                    src={v.cover_image}
                                    alt=""
                                    className="w-14 h-10 object-cover rounded-lg bg-black/40 shrink-0 border border-white/10"
                                  />
                                  <div>
                                    <span className="text-[10px] text-gray-400 uppercase font-semibold">
                                      {v.marca}
                                    </span>
                                    <div className="font-bold text-white leading-tight">
                                      {v.modelo}{' '}
                                      <span className="text-gray-400 font-normal">{v.versao}</span>
                                    </div>
                                  </div>
                                </td>

                                {/* Year & Mileage */}
                                <td className="p-3.5 whitespace-nowrap">
                                  <div>{v.ano_fabricacao}/{v.ano_modelo}</div>
                                  <div className="text-[11px] text-gray-500">{formatKm(v.km)}</div>
                                </td>

                                {/* Price */}
                                <td className="p-3.5 whitespace-nowrap">
                                  {v.preco_promocional > 0 && v.preco_promocional < v.preco ? (
                                    <div>
                                      <div className="font-bold text-emerald-400">
                                        {formatCurrency(v.preco_promocional)}
                                      </div>
                                      <div className="text-[10px] text-gray-500 line-through">
                                        {formatCurrency(v.preco)}
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="font-bold text-white">
                                      {formatCurrency(v.preco)}
                                    </div>
                                  )}
                                </td>

                                {/* Quick Inline Status Selector */}
                                <td className="p-3.5">
                                  {isDeleted ? (
                                    <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 text-[10px] font-bold">
                                      Na Lixeira
                                    </span>
                                  ) : (
                                    <select
                                      value={v.status}
                                      onChange={(e) => handleQuickStatus(v.id, e.target.value as any)}
                                      className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border focus:outline-none cursor-pointer transition-colors ${
                                        v.status === 'disponivel'
                                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                                          : v.status === 'reservado'
                                          ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                                          : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                                      }`}
                                    >
                                      <option value="disponivel">Disponível</option>
                                      <option value="reservado">Reservado</option>
                                      <option value="vendido">Vendido</option>
                                    </select>
                                  )}
                                </td>

                                {/* Badges Toggle (Destaque & Oferta) */}
                                <td className="p-3.5 text-center">
                                  {!isDeleted && (
                                    <div className="flex items-center justify-center gap-1.5">
                                      <button
                                        onClick={() => handleToggleDestaque(v.id)}
                                        title={v.destaque === 1 ? 'Remover destaque' : 'Tornar destaque'}
                                        className={`p-1.5 rounded-lg border text-xs transition-colors ${
                                          v.destaque === 1
                                            ? 'bg-amber-400 text-black border-amber-400 font-bold'
                                            : 'bg-white/5 text-gray-500 border-white/10 hover:text-white'
                                        }`}
                                      >
                                        <IconStar className="w-3.5 h-3.5 fill-current" />
                                      </button>

                                      <button
                                        onClick={() => handleToggleOferta(v.id)}
                                        title={v.em_oferta === 1 ? 'Remover oferta' : 'Marcar como oferta'}
                                        className={`px-2 py-1 rounded-lg border text-[10px] font-bold uppercase transition-colors ${
                                          v.em_oferta === 1
                                            ? 'bg-emerald-500 text-white border-emerald-500'
                                            : 'bg-white/5 text-gray-500 border-white/10 hover:text-white'
                                        }`}
                                      >
                                        Oferta
                                      </button>
                                    </div>
                                  )}
                                </td>

                                {/* Actions: Edit, Duplicate, Delete / Restore */}
                                <td className="p-3.5 text-right">
                                  <div className="flex items-center justify-end gap-1.5">
                                    {isDeleted ? (
                                      <>
                                        <button
                                          onClick={() => handleRestoreVehicle(v.id)}
                                          className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 font-semibold text-[11px]"
                                        >
                                          Restaurar
                                        </button>
                                        <button
                                          onClick={() => handleDeleteVehicle(v.id, true)}
                                          className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10"
                                          title="Excluir Definitivamente"
                                        >
                                          <IconDelete className="w-4 h-4" />
                                        </button>
                                      </>
                                    ) : (
                                      <>
                                        <button
                                          onClick={() => handleDuplicate(v.id)}
                                          className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10"
                                          title="Duplicar veículo"
                                        >
                                          <IconCopy className="w-4 h-4" />
                                        </button>

                                        <button
                                          onClick={() => handleOpenVehicleModal(v)}
                                          className="p-1.5 rounded-lg text-amber-400 hover:bg-amber-400/10"
                                          title="Editar veículo"
                                        >
                                          <IconEdit className="w-4 h-4" />
                                        </button>

                                        <button
                                          onClick={() => handleDeleteVehicle(v.id, false)}
                                          className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10"
                                          title="Mover para lixeira"
                                        >
                                          <IconDelete className="w-4 h-4" />
                                        </button>
                                      </>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: CONTACTS & LEADS */}
              {activeTab === 'contatos' && (
                <div className="space-y-4">
                  {/* Filter & Search Bar */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-1 max-w-xl">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          placeholder="Buscar por cliente, telefone, veículo..."
                          value={searchLeads}
                          onChange={(e) => setSearchLeads(e.target.value)}
                          className="w-full bg-[#151924] border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 transition-colors"
                        />
                        <IconSearch className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-3" />
                      </div>

                      <select
                        value={leadStatusFilter}
                        onChange={(e) => setLeadStatusFilter(e.target.value as any)}
                        className="bg-[#151924] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 transition-colors"
                      >
                        <option value="all">Todos os Leads ({contacts.length})</option>
                        <option value="novo">Novos ({kpiNovosContatos})</option>
                        <option value="em_atendimento">Em Atendimento</option>
                        <option value="concluido">Concluídos</option>
                      </select>
                    </div>

                    <div className="text-xs text-gray-400 text-right">
                      {filteredContacts.length} lead(s) encontrado(s)
                    </div>
                  </div>

                  {filteredContacts.length === 0 ? (
                    <div className="bg-[#151924] border border-white/5 p-8 rounded-2xl text-center space-y-2">
                      <IconMail className="w-8 h-8 text-gray-500 mx-auto" />
                      <p className="text-sm text-gray-300 font-semibold">Nenhum lead encontrado.</p>
                      <p className="text-xs text-gray-500">As propostas e contatos preenchidos no site aparecerão aqui em tempo real.</p>
                    </div>
                  ) : (
                    <>
                      {/* Mobile Cards for Leads */}
                      <div className="block md:hidden space-y-3">
                        {filteredContacts.map((c) => (
                          <div
                            key={c.id}
                            className="bg-[#151924] border border-white/10 rounded-2xl p-4 space-y-3"
                          >
                            <div className="flex items-center justify-between">
                              <div className="min-w-0">
                                <div className="font-bold text-white text-sm">{c.nome}</div>
                                <div className="text-[11px] text-gray-400">{formatDate(c.created_at)}</div>
                              </div>
                              <select
                                value={c.status}
                                onChange={(e) => handleContactStatus(c.id, e.target.value as any)}
                                className={`text-xs font-bold px-2 py-1 rounded-lg border focus:outline-none ${
                                  c.status === 'novo'
                                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                                    : c.status === 'em_atendimento'
                                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                }`}
                              >
                                <option value="novo">Novo</option>
                                <option value="em_atendimento">Em Atendimento</option>
                                <option value="concluido">Concluído</option>
                              </select>
                            </div>

                            <div className="text-xs space-y-1">
                              <div className="text-gray-300">
                                <strong>Tipo:</strong> <span className="capitalize text-amber-400">{c.tipo.replace('_', ' ')}</span>
                              </div>
                              {c.veiculo_nome && (
                                <div className="text-gray-300">
                                  <strong>Veículo:</strong> <span className="text-white">{c.veiculo_nome}</span>
                                </div>
                              )}
                              {c.valor_entrada ? (
                                <div className="text-gray-300">
                                  <strong>Entrada:</strong> {formatCurrency(c.valor_entrada)} ({c.parcelas}x)
                                </div>
                              ) : null}
                              {c.veiculo_troca && (
                                <div className="text-gray-300">
                                  <strong>Troca:</strong> {c.veiculo_troca}
                                </div>
                              )}
                            </div>

                            {/* Message box */}
                            <div className="bg-[#0d1017] p-3 rounded-xl border border-white/5 text-xs text-gray-300">
                              <div className="text-[10px] text-gray-500 uppercase font-semibold mb-1">Mensagem enviada:</div>
                              <p className="italic">"{c.mensagem || 'Sem mensagem adicional'}"</p>
                            </div>

                            <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-2">
                              <a
                                href={getWhatsAppLink(
                                  c.telefone,
                                  `Olá ${c.nome}! Sou consultor da ${config?.nome || 'AutoPrime Motors'}. Entro em contato sobre sua mensagem.`
                                )}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 font-bold text-xs flex items-center justify-center gap-1.5"
                              >
                                <IconWhatsApp className="w-4 h-4" />
                                <span>WhatsApp ({c.telefone})</span>
                              </a>
                              <button
                                onClick={() => setSelectedLeadModal(c)}
                                className="px-3 py-2 rounded-xl bg-white/10 text-white font-semibold text-xs"
                              >
                                Detalhes
                              </button>
                              <button
                                onClick={() => handleDeleteContact(c.id)}
                                className="p-2 rounded-xl bg-rose-500/10 text-rose-400"
                                title="Excluir lead"
                              >
                                <IconDelete className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Desktop Table for Leads */}
                      <div className="hidden md:block bg-[#151924] border border-white/10 rounded-2xl overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs text-gray-300">
                            <thead className="bg-[#11141d] text-gray-400 text-[11px] uppercase border-b border-white/10">
                              <tr>
                                <th className="p-3.5">Data</th>
                                <th className="p-3.5">Cliente</th>
                                <th className="p-3.5">Telefone / E-mail</th>
                                <th className="p-3.5">Finalidade / Veículo</th>
                                <th className="p-3.5">Mensagem / Proposta</th>
                                <th className="p-3.5">Status</th>
                                <th className="p-3.5 text-right">Ações</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                              {filteredContacts.map((c) => (
                                <tr key={c.id} className="hover:bg-white/5 transition-colors">
                                  <td className="p-3.5 whitespace-nowrap text-gray-400">
                                    {formatDate(c.created_at)}
                                  </td>
                                  <td className="p-3.5 font-bold text-white">{c.nome}</td>
                                  <td className="p-3.5 whitespace-nowrap">
                                    <div className="font-semibold text-gray-200">{c.telefone}</div>
                                    <div className="text-gray-500 text-[11px]">{c.email || '-'}</div>
                                  </td>
                                  <td className="p-3.5">
                                    <span className="font-semibold text-amber-400 capitalize">
                                      {c.tipo.replace('_', ' ')}
                                    </span>
                                    {c.veiculo_nome && (
                                      <div className="text-gray-300 text-[11px] font-medium truncate max-w-xs">
                                        {c.veiculo_nome}
                                      </div>
                                    )}
                                    {c.valor_entrada ? (
                                      <div className="text-[10px] text-gray-400">
                                        Entrada: {formatCurrency(c.valor_entrada)} ({c.parcelas}x)
                                      </div>
                                    ) : null}
                                  </td>
                                  <td className="p-3.5 max-w-xs truncate text-gray-300">
                                    <span title={c.mensagem}>{c.mensagem || '-'}</span>
                                    {c.veiculo_troca && (
                                      <div className="text-[10px] text-emerald-400">
                                        Troca: {c.veiculo_troca}
                                      </div>
                                    )}
                                  </td>
                                  <td className="p-3.5">
                                    <select
                                      value={c.status}
                                      onChange={(e) => handleContactStatus(c.id, e.target.value as any)}
                                      className={`border rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:outline-none transition-colors cursor-pointer ${
                                        c.status === 'novo'
                                          ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                                          : c.status === 'em_atendimento'
                                          ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                                          : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                                      }`}
                                    >
                                      <option value="novo">Novo</option>
                                      <option value="em_atendimento">Em Atendimento</option>
                                      <option value="concluido">Concluído</option>
                                    </select>
                                  </td>
                                  <td className="p-3.5 text-right whitespace-nowrap">
                                    <div className="flex items-center justify-end gap-1.5">
                                      <button
                                        onClick={() => setSelectedLeadModal(c)}
                                        className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white text-xs font-semibold"
                                        title="Ver mensagem e proposta completa"
                                      >
                                        Ver Proposta
                                      </button>
                                      <a
                                        href={getWhatsAppLink(
                                          c.telefone,
                                          `Olá ${c.nome}! Sou consultor da ${config?.nome || 'AutoPrime Motors'}. Entro em contato sobre sua mensagem enviada no nosso site.`
                                        )}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                                        title="Chamar no WhatsApp"
                                      >
                                        <IconWhatsApp className="w-4 h-4" />
                                      </a>
                                      <button
                                        onClick={() => handleDeleteContact(c.id)}
                                        className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10"
                                        title="Remover lead"
                                      >
                                        <IconDelete className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* TAB 4: COMPANY SETTINGS & EDITABLE METRICS */}
              {activeTab === 'config' && (
                <form onSubmit={handleSaveConfig} className="space-y-6 max-w-4xl text-xs">
                  {configSuccessMsg && (
                    <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                      <IconCheck className="w-5 h-5 shrink-0" />
                      <span>{configSuccessMsg}</span>
                    </div>
                  )}

                  {/* General Info */}
                  <div className="bg-[#151924] border border-white/10 p-5 sm:p-6 rounded-2xl space-y-4">
                    <h3 className="text-base font-bold text-white font-['Space_Grotesk']">
                      Identidade da Concessionária
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-300 font-medium mb-1">Nome da Empresa</label>
                        <input
                          type="text"
                          value={formDataConfig.nome || ''}
                          onChange={(e) =>
                            setFormDataConfig((prev) => ({ ...prev, nome: e.target.value }))
                          }
                          className="w-full bg-[#0d1017] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div>
                        <label className="block text-gray-300 font-medium mb-1">Slogan</label>
                        <input
                          type="text"
                          value={formDataConfig.slogan || ''}
                          onChange={(e) =>
                            setFormDataConfig((prev) => ({ ...prev, slogan: e.target.value }))
                          }
                          className="w-full bg-[#0d1017] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-gray-300 font-medium mb-1">Telefone Fixo</label>
                        <input
                          type="text"
                          value={formDataConfig.telefone || ''}
                          onChange={(e) =>
                            setFormDataConfig((prev) => ({ ...prev, telefone: e.target.value }))
                          }
                          className="w-full bg-[#0d1017] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div>
                        <label className="block text-gray-300 font-medium mb-1">WhatsApp Oficial</label>
                        <input
                          type="text"
                          value={formDataConfig.whatsapp || ''}
                          onChange={(e) =>
                            setFormDataConfig((prev) => ({ ...prev, whatsapp: e.target.value }))
                          }
                          className="w-full bg-[#0d1017] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div>
                        <label className="block text-gray-300 font-medium mb-1">E-mail Comercial</label>
                        <input
                          type="email"
                          value={formDataConfig.email || ''}
                          onChange={(e) =>
                            setFormDataConfig((prev) => ({ ...prev, email: e.target.value }))
                          }
                          className="w-full bg-[#0d1017] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-300 font-medium mb-1">Endereço Completo</label>
                        <input
                          type="text"
                          value={formDataConfig.endereco || ''}
                          onChange={(e) =>
                            setFormDataConfig((prev) => ({ ...prev, endereco: e.target.value }))
                          }
                          className="w-full bg-[#0d1017] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div>
                        <label className="block text-gray-300 font-medium mb-1">Horário de Atendimento</label>
                        <input
                          type="text"
                          value={formDataConfig.horario_atendimento || ''}
                          onChange={(e) =>
                            setFormDataConfig((prev) => ({
                              ...prev,
                              horario_atendimento: e.target.value,
                            }))
                          }
                          className="w-full bg-[#0d1017] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Editable Custom Metric Counters */}
                  <div className="bg-[#151924] border border-white/10 p-5 sm:p-6 rounded-2xl space-y-4">
                    <div>
                      <h3 className="text-base font-bold text-white font-['Space_Grotesk']">
                        Métricas de Autoridade (Exibidas na Home e Sobre Nós)
                      </h3>
                      <p className="text-xs text-gray-400 mt-1">
                        Edite os valores numéricos dos contadores que comprovam a solidez da sua concessionária.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-gray-300 font-medium mb-1">Veículos Vendidos</label>
                        <input
                          type="text"
                          value={formDataConfig.metric_carros_vendidos || ''}
                          onChange={(e) =>
                            setFormDataConfig((prev) => ({
                              ...prev,
                              metric_carros_vendidos: e.target.value,
                            }))
                          }
                          placeholder="Ex: 1.850+"
                          className="w-full bg-[#0d1017] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div>
                        <label className="block text-gray-300 font-medium mb-1">Anos de Experiência</label>
                        <input
                          type="text"
                          value={formDataConfig.metric_anos_experiencia || ''}
                          onChange={(e) =>
                            setFormDataConfig((prev) => ({
                              ...prev,
                              metric_anos_experiencia: e.target.value,
                            }))
                          }
                          placeholder="Ex: 15 Anos"
                          className="w-full bg-[#0d1017] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div>
                        <label className="block text-gray-300 font-medium mb-1">Clientes Atendidos</label>
                        <input
                          type="text"
                          value={formDataConfig.metric_clientes_atendidos || ''}
                          onChange={(e) =>
                            setFormDataConfig((prev) => ({
                              ...prev,
                              metric_clientes_atendidos: e.target.value,
                            }))
                          }
                          placeholder="Ex: 3.200+"
                          className="w-full bg-[#0d1017] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div>
                        <label className="block text-gray-300 font-medium mb-1">Índice de Satisfação</label>
                        <input
                          type="text"
                          value={formDataConfig.metric_satisfacao || ''}
                          onChange={(e) =>
                            setFormDataConfig((prev) => ({
                              ...prev,
                              metric_satisfacao: e.target.value,
                            }))
                          }
                          placeholder="Ex: 99.4%"
                          className="w-full bg-[#0d1017] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSavingConfig}
                    className="px-6 py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-sm shadow-lg shadow-amber-500/20 disabled:opacity-50 transition-all"
                  >
                    {isSavingConfig ? 'Salvando no Banco...' : 'Salvar Alterações'}
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

        {/* MODAL: FULL LEAD DETAIL DOSSIER */}
        {selectedLeadModal && (
          <div className="fixed inset-0 z-60 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
            <div className="relative bg-[#11151e] border border-white/15 rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
              <div className="bg-[#151926] px-6 py-4 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-400 text-black flex items-center justify-center font-bold">
                    <IconMail className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white font-['Space_Grotesk']">
                      Proposta / Mensagem de {selectedLeadModal.nome}
                    </h3>
                    <p className="text-[11px] text-gray-400">
                      Recebida em {formatDate(selectedLeadModal.created_at)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedLeadModal(null)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-white"
                >
                  <IconClose className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-4 text-xs">
                {/* Status & Actions Bar */}
                <div className="flex items-center justify-between p-3.5 bg-white/5 rounded-xl border border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 font-medium">Status do Atendimento:</span>
                    <select
                      value={selectedLeadModal.status}
                      onChange={(e) => handleContactStatus(selectedLeadModal.id, e.target.value as any)}
                      className={`font-bold px-3 py-1 rounded-lg border text-xs cursor-pointer ${
                        selectedLeadModal.status === 'novo'
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                          : selectedLeadModal.status === 'em_atendimento'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      }`}
                    >
                      <option value="novo">Novo</option>
                      <option value="em_atendimento">Em Atendimento</option>
                      <option value="concluido">Concluído</option>
                    </select>
                  </div>

                  <a
                    href={getWhatsAppLink(
                      selectedLeadModal.telefone,
                      `Olá ${selectedLeadModal.nome}! Sou consultor da ${config?.nome || 'AutoPrime Motors'}. Estou respondendo sua mensagem sobre ${selectedLeadModal.veiculo_nome || 'nosso catálogo'}.`
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/20"
                  >
                    <IconWhatsApp className="w-4 h-4" />
                    <span>Conversar no WhatsApp</span>
                  </a>
                </div>

                {/* Contact Data */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-[#151924] rounded-xl border border-white/10">
                  <div>
                    <span className="text-[11px] text-gray-400 block">Nome Completo:</span>
                    <span className="text-sm font-bold text-white">{selectedLeadModal.nome}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-gray-400 block">Telefone / WhatsApp:</span>
                    <span className="text-sm font-bold text-emerald-400">{selectedLeadModal.telefone}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-gray-400 block">E-mail:</span>
                    <span className="text-sm text-gray-300">{selectedLeadModal.email || 'Não informado'}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-gray-400 block">Tipo de Proposta:</span>
                    <span className="text-sm font-bold text-amber-400 capitalize">
                      {selectedLeadModal.tipo.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {/* Vehicle & Terms Data */}
                {(selectedLeadModal.veiculo_nome || selectedLeadModal.valor_entrada || selectedLeadModal.veiculo_troca) && (
                  <div className="p-4 bg-[#151924] rounded-xl border border-white/10 space-y-2">
                    <h4 className="font-bold text-white text-xs">Detalhes da Proposta Comercial</h4>
                    {selectedLeadModal.veiculo_nome && (
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-gray-400">Veículo de Interesse:</span>
                        <strong className="text-white">{selectedLeadModal.veiculo_nome}</strong>
                      </div>
                    )}
                    {selectedLeadModal.valor_entrada ? (
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-gray-400">Simulação de Financiamento:</span>
                        <strong className="text-emerald-400">{formatCurrency(selectedLeadModal.valor_entrada)} de entrada</strong>
                        <span className="text-gray-400">em {selectedLeadModal.parcelas}x parcelas</span>
                      </div>
                    ) : null}
                    {selectedLeadModal.veiculo_troca && (
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-gray-400">Veículo Ofertado na Troca:</span>
                        <strong className="text-white">{selectedLeadModal.veiculo_troca}</strong>
                      </div>
                    )}
                  </div>
                )}

                {/* Message Body */}
                <div className="p-4 bg-[#0d1017] rounded-xl border border-white/10 space-y-2">
                  <h4 className="font-bold text-white text-xs">Mensagem Enviada pelo Cliente</h4>
                  <div className="p-3.5 bg-black/40 rounded-xl text-gray-200 text-xs leading-relaxed border border-white/5 whitespace-pre-wrap">
                    {selectedLeadModal.mensagem || 'Nenhuma mensagem de texto adicional inserida.'}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-[#151926] border-t border-white/10 flex items-center justify-between">
                <button
                  onClick={() => handleDeleteContact(selectedLeadModal.id)}
                  className="px-3.5 py-2 rounded-xl text-rose-400 hover:bg-rose-500/10 text-xs font-semibold flex items-center gap-1.5"
                >
                  <IconDelete className="w-4 h-4" />
                  <span>Excluir Lead</span>
                </button>
                <button
                  onClick={() => setSelectedLeadModal(null)}
                  className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: CREATE / EDIT VEHICLE */}
        {isVehicleModalOpen && editingVehicle && (
          <div className="fixed inset-0 z-60 overflow-y-auto bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
            <div className="relative bg-[#11151e] border border-white/15 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
              {/* Modal Header */}
              <div className="bg-[#151926] px-6 py-4 border-b border-white/10 flex items-center justify-between">
                <h3 className="text-base sm:text-lg font-bold text-white font-['Space_Grotesk']">
                  {editingVehicle.id ? 'Editar Veículo no Estoque' : 'Cadastrar Novo Veículo no Estoque'}
                </h3>
                <button
                  onClick={() => setIsVehicleModalOpen(false)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-white"
                >
                  <IconClose className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleSaveVehicle} className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6 text-xs">
                {vehicleModalError && (
                  <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                    {vehicleModalError}
                  </div>
                )}

                {/* Primary Specs */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-gray-300 font-medium mb-1">Marca *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Porsche, BMW, Mercedes"
                      value={editingVehicle.marca || ''}
                      onChange={(e) =>
                        setEditingVehicle((prev) => ({ ...prev!, marca: e.target.value }))
                      }
                      className="w-full bg-[#0d1017] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-300 font-medium mb-1">Modelo *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: 911 Carrera S"
                      value={editingVehicle.modelo || ''}
                      onChange={(e) =>
                        setEditingVehicle((prev) => ({ ...prev!, modelo: e.target.value }))
                      }
                      className="w-full bg-[#0d1017] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-300 font-medium mb-1">Versão</label>
                    <input
                      type="text"
                      placeholder="Ex: 3.0 Bi-Turbo PDK"
                      value={editingVehicle.versao || ''}
                      onChange={(e) =>
                        setEditingVehicle((prev) => ({ ...prev!, versao: e.target.value }))
                      }
                      className="w-full bg-[#0d1017] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                {/* Pricing & Offer */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white/5 p-4 rounded-xl border border-white/10">
                  <div>
                    <label className="block text-gray-300 font-medium mb-1">Preço Normal (R$) *</label>
                    <input
                      type="number"
                      required
                      value={editingVehicle.preco || ''}
                      onChange={(e) =>
                        setEditingVehicle((prev) => ({ ...prev!, preco: Number(e.target.value) }))
                      }
                      className="w-full bg-[#0d1017] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-300 font-medium mb-1">
                      Preço Promocional (Opcional)
                    </label>
                    <input
                      type="number"
                      value={editingVehicle.preco_promocional || ''}
                      onChange={(e) =>
                        setEditingVehicle((prev) => ({
                          ...prev!,
                          preco_promocional: Number(e.target.value),
                        }))
                      }
                      placeholder="0 para sem desconto"
                      className="w-full bg-[#0d1017] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="flex items-center gap-4 pt-2 sm:pt-6">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={editingVehicle.em_oferta === 1}
                        onChange={(e) =>
                          setEditingVehicle((prev) => ({
                            ...prev!,
                            em_oferta: e.target.checked ? 1 : 0,
                          }))
                        }
                        className="rounded bg-[#0d1017] border-white/20 text-amber-500 w-4 h-4"
                      />
                      <span className="text-gray-200 font-medium">Em Oferta</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={editingVehicle.destaque === 1}
                        onChange={(e) =>
                          setEditingVehicle((prev) => ({
                            ...prev!,
                            destaque: e.target.checked ? 1 : 0,
                          }))
                        }
                        className="rounded bg-[#0d1017] border-white/20 text-amber-500 w-4 h-4"
                      />
                      <span className="text-gray-200 font-medium">Destaque</span>
                    </label>
                  </div>
                </div>

                {/* Technical Details Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-gray-300 font-medium mb-1">Ano Fabricação</label>
                    <input
                      type="number"
                      value={editingVehicle.ano_fabricacao || ''}
                      onChange={(e) =>
                        setEditingVehicle((prev) => ({
                          ...prev!,
                          ano_fabricacao: Number(e.target.value),
                        }))
                      }
                      className="w-full bg-[#0d1017] border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-300 font-medium mb-1">Ano Modelo</label>
                    <input
                      type="number"
                      value={editingVehicle.ano_modelo || ''}
                      onChange={(e) =>
                        setEditingVehicle((prev) => ({
                          ...prev!,
                          ano_modelo: Number(e.target.value),
                        }))
                      }
                      className="w-full bg-[#0d1017] border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-300 font-medium mb-1">Quilometragem (km)</label>
                    <input
                      type="number"
                      value={editingVehicle.km ?? ''}
                      onChange={(e) =>
                        setEditingVehicle((prev) => ({ ...prev!, km: Number(e.target.value) }))
                      }
                      className="w-full bg-[#0d1017] border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-300 font-medium mb-1">Condição</label>
                    <select
                      value={editingVehicle.condicao || 'Seminovo'}
                      onChange={(e) =>
                        setEditingVehicle((prev) => ({ ...prev!, condicao: e.target.value as any }))
                      }
                      className="w-full bg-[#0d1017] border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white"
                    >
                      <option value="Seminovo">Seminovo</option>
                      <option value="Novo">0 km (Novo)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-gray-300 font-medium mb-1">Carroceria</label>
                    <select
                      value={editingVehicle.categoria || 'Sedan'}
                      onChange={(e) =>
                        setEditingVehicle((prev) => ({ ...prev!, categoria: e.target.value }))
                      }
                      className="w-full bg-[#0d1017] border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white"
                    >
                      <option value="SUV">SUV</option>
                      <option value="Sedan">Sedan</option>
                      <option value="Cupê">Cupê</option>
                      <option value="Hatchback">Hatchback</option>
                      <option value="Picape">Picape</option>
                      <option value="Conversível">Conversível</option>
                      <option value="Esportivo">Esportivo</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-300 font-medium mb-1">Câmbio</label>
                    <select
                      value={editingVehicle.cambio || 'Automático'}
                      onChange={(e) =>
                        setEditingVehicle((prev) => ({ ...prev!, cambio: e.target.value }))
                      }
                      className="w-full bg-[#0d1017] border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white"
                    >
                      <option value="Automático">Automático</option>
                      <option value="Manual">Manual</option>
                      <option value="CVT">CVT</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-300 font-medium mb-1">Combustível</label>
                    <select
                      value={editingVehicle.combustivel || 'Gasolina'}
                      onChange={(e) =>
                        setEditingVehicle((prev) => ({ ...prev!, combustivel: e.target.value }))
                      }
                      className="w-full bg-[#0d1017] border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white"
                    >
                      <option value="Gasolina">Gasolina</option>
                      <option value="Flex">Flex</option>
                      <option value="Híbrido">Híbrido</option>
                      <option value="Diesel">Diesel</option>
                      <option value="Elétrico">Elétrico</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-300 font-medium mb-1">Status</label>
                    <select
                      value={editingVehicle.status || 'disponivel'}
                      onChange={(e) =>
                        setEditingVehicle((prev) => ({ ...prev!, status: e.target.value as any }))
                      }
                      className="w-full bg-[#0d1017] border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white font-semibold"
                    >
                      <option value="disponivel">Disponível</option>
                      <option value="reservado">Reservado</option>
                      <option value="vendido">Vendido</option>
                    </select>
                  </div>
                </div>

                {/* Additional specs: color, doors, plate */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-gray-300 font-medium mb-1">Cor</label>
                    <input
                      type="text"
                      value={editingVehicle.cor || ''}
                      onChange={(e) =>
                        setEditingVehicle((prev) => ({ ...prev!, cor: e.target.value }))
                      }
                      className="w-full bg-[#0d1017] border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-300 font-medium mb-1">Portas</label>
                    <input
                      type="number"
                      value={editingVehicle.portas || 4}
                      onChange={(e) =>
                        setEditingVehicle((prev) => ({ ...prev!, portas: Number(e.target.value) }))
                      }
                      className="w-full bg-[#0d1017] border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-300 font-medium mb-1">Final da Placa</label>
                    <input
                      type="text"
                      maxLength={2}
                      value={editingVehicle.placa_final || ''}
                      onChange={(e) =>
                        setEditingVehicle((prev) => ({ ...prev!, placa_final: e.target.value }))
                      }
                      className="w-full bg-[#0d1017] border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white"
                    />
                  </div>
                </div>

                {/* Multiple Images Management */}
                <div className="bg-[#151926] p-4 rounded-xl border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-white">Galeria de Fotos do Veículo</h4>
                      <p className="text-[11px] text-gray-400">
                        A primeira foto será a capa oficial exibida no catálogo.
                      </p>
                    </div>

                    <label className="cursor-pointer px-3.5 py-2 rounded-xl bg-amber-400/20 text-amber-400 border border-amber-400/30 hover:bg-amber-400/30 text-xs font-semibold flex items-center gap-1.5 transition-colors">
                      <IconUpload className="w-3.5 h-3.5" />
                      <span>{isUploadingImage ? 'Enviando...' : 'Fazer Upload'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* Add URL input */}
                  <div className="flex gap-2">
                    <input
                      type="url"
                      placeholder="Ou cole a URL direta da imagem (https://...)"
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      className="flex-1 bg-[#0d1017] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white"
                    />
                    <button
                      type="button"
                      onClick={handleAddImageUrl}
                      className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-medium transition-colors"
                    >
                      Adicionar URL
                    </button>
                  </div>

                  {/* Previews */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 pt-2">
                    {imageUrls.map((url, idx) => (
                      <div
                        key={idx}
                        className="relative group aspect-[16/10] rounded-xl overflow-hidden border border-white/10 bg-black/40"
                      >
                        <img src={url} alt="" className="w-full h-full object-cover" />
                        {idx === 0 && (
                          <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-amber-500 text-black font-bold text-[9px]">
                            Capa
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => setImageUrls((prev) => prev.filter((_, i) => i !== idx))}
                          className="absolute top-1 right-1 p-1 rounded-full bg-black/80 text-rose-400 hover:bg-rose-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <IconClose className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Optionals / Features */}
                <div className="bg-[#151926] p-4 rounded-xl border border-white/10 space-y-3">
                  <h4 className="font-bold text-white">Opcionais e Itens de Série</h4>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Ex: Teto solar panorâmico, Som Harman Kardon"
                      value={newFeatureText}
                      onChange={(e) => setNewFeatureText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddFeature();
                        }
                      }}
                      className="flex-1 bg-[#0d1017] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white"
                    />
                    <button
                      type="button"
                      onClick={handleAddFeature}
                      className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-medium transition-colors"
                    >
                      Adicionar Item
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    {featuresList.map((f, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 text-xs"
                      >
                        <span>{f}</span>
                        <button
                          type="button"
                          onClick={() => setFeaturesList((prev) => prev.filter((_, i) => i !== idx))}
                          className="text-gray-500 hover:text-rose-400 font-bold"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-gray-300 font-medium mb-1">
                    Descrição Detalhada do Veículo
                  </label>
                  <textarea
                    rows={4}
                    value={editingVehicle.descricao || ''}
                    onChange={(e) =>
                      setEditingVehicle((prev) => ({ ...prev!, descricao: e.target.value }))
                    }
                    placeholder="Informe o histórico de revisões, estado dos pneus, opcionais destacados e laudo cautelar aprovado..."
                    className="w-full bg-[#0d1017] border border-white/10 rounded-xl p-3.5 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Modal Footer */}
                <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsVehicleModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-semibold transition-colors"
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    disabled={isSavingVehicle}
                    className="px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs shadow-lg shadow-amber-500/20 disabled:opacity-50 transition-all"
                  >
                    {isSavingVehicle
                      ? 'Salvando no Banco...'
                      : editingVehicle.id
                      ? 'Salvar Alterações'
                      : 'Cadastrar Veículo'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
