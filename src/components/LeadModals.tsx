import React, { useState, useEffect } from 'react';
import { Vehicle } from '../types';
import { IconClose, IconCheck, IconWhatsApp, IconFinance, IconTestDrive, IconCar } from './icons';
import { formatPhone, cleanPhone, formatCurrency } from '../utils/formatters';
import { submitContact } from '../utils/api';

export type LeadModalType = 'contato' | 'financiamento' | 'avaliacao_usado' | 'agendamento_visita' | 'test_drive';

interface LeadModalsProps {
  isOpen: boolean;
  type: LeadModalType;
  selectedVehicle?: Vehicle | null;
  serviceTitle?: string;
  onClose: () => void;
  whatsappNumber?: string;
}

export const LeadModals: React.FC<LeadModalsProps> = ({
  isOpen,
  type,
  selectedVehicle,
  serviceTitle,
  onClose,
  whatsappNumber = '5511999998888',
}) => {
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [valorEntrada, setValorEntrada] = useState<string>('');
  const [parcelas, setParcelas] = useState<number>(48);
  const [veiculoTroca, setVeiculoTroca] = useState('');
  const [mensagem, setMensagem] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Auto-populate message based on context
  useEffect(() => {
    if (selectedVehicle) {
      if (type === 'financiamento') {
        const defaultEntry = Math.round(selectedVehicle.preco * 0.3);
        setValorEntrada(defaultEntry.toString());
        setMensagem(
          `Gostaria de simular o financiamento do ${selectedVehicle.marca} ${selectedVehicle.modelo} (${selectedVehicle.versao}).`
        );
      } else if (type === 'agendamento_visita' || type === 'test_drive') {
        setMensagem(
          `Gostaria de agendar uma visita/test-drive para conhecer o ${selectedVehicle.marca} ${selectedVehicle.modelo}.`
        );
      } else {
        setMensagem(
          `Tenho interesse no ${selectedVehicle.marca} ${selectedVehicle.modelo} (${selectedVehicle.versao}) anunciado por ${formatCurrency(
            selectedVehicle.preco
          )}.`
        );
      }
    } else if (serviceTitle) {
      setMensagem(`Gostaria de solicitar atendimento referente ao serviço: ${serviceTitle}.`);
    }
  }, [selectedVehicle, serviceTitle, type]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!nome.trim()) {
      setErrorMsg('Por favor, informe seu nome completo.');
      return;
    }

    const cleanTel = cleanPhone(telefone);
    if (cleanTel.length < 10) {
      setErrorMsg('Por favor, informe um telefone válido com DDD.');
      return;
    }

    try {
      setIsSubmitting(true);
      await submitContact({
        tipo: type,
        nome: nome.trim(),
        telefone: telefone.trim(),
        email: email.trim(),
        veiculo_id: selectedVehicle?.id || null,
        veiculo_nome: selectedVehicle ? `${selectedVehicle.marca} ${selectedVehicle.modelo}` : serviceTitle || '',
        valor_entrada: valorEntrada ? Number(valorEntrada) : 0,
        parcelas: Number(parcelas || 0),
        veiculo_troca: veiculoTroca.trim(),
        mensagem: mensagem.trim(),
      });

      setSuccessMsg('Solicitação recebida com sucesso! Nossa equipe entrará em contato em breve.');
      setTimeout(() => {
        onClose();
      }, 2500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao enviar. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getModalTitle = () => {
    switch (type) {
      case 'financiamento':
        return 'Simulação & Financiamento';
      case 'avaliacao_usado':
        return 'Avaliação de Veículo Usado';
      case 'agendamento_visita':
      case 'test_drive':
        return 'Agendar Visita & Test-Drive';
      case 'contato':
      default:
        return selectedVehicle ? `Interesse no ${selectedVehicle.modelo}` : 'Fale Conosco';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-[#131720] border border-white/10 rounded-3xl w-full max-w-lg p-6 sm:p-8 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10"
        >
          <IconClose className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold mb-2">
            <span>Atendimento Personalizado</span>
          </div>
          <h3 className="text-2xl font-bold text-white font-['Space_Grotesk']">{getModalTitle()}</h3>
          {selectedVehicle && (
            <p className="text-xs text-gray-400 mt-1">
              Veículo: {selectedVehicle.marca} {selectedVehicle.modelo} ({selectedVehicle.ano_modelo})
            </p>
          )}
        </div>

        {/* Feedback Messages */}
        {errorMsg && (
          <div className="mb-4 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs leading-relaxed">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-center gap-2">
            <IconCheck className="w-5 h-5 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-gray-300 font-medium mb-1">Nome Completo *</label>
            <input
              type="text"
              required
              placeholder="Ex: Carlos Eduardo Silva"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full bg-[#0d1017] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-300 font-medium mb-1">Telefone / WhatsApp *</label>
              <input
                type="tel"
                required
                placeholder="(11) 99999-8888"
                value={telefone}
                onChange={(e) => setTelefone(formatPhone(e.target.value))}
                className="w-full bg-[#0d1017] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-gray-300 font-medium mb-1">E-mail</label>
              <input
                type="email"
                placeholder="carlos@exemplo.com.br"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#0d1017] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Conditional fields for Financing */}
          {type === 'financiamento' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
              <div>
                <label className="block text-gray-300 font-medium mb-1">Valor de Entrada (R$)</label>
                <input
                  type="number"
                  placeholder="Ex: 50000"
                  value={valorEntrada}
                  onChange={(e) => setValorEntrada(e.target.value)}
                  className="w-full bg-[#0d1017] border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-medium mb-1">Parcelas Desejadas</label>
                <select
                  value={parcelas}
                  onChange={(e) => setParcelas(Number(e.target.value))}
                  className="w-full bg-[#0d1017] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="12">12 meses</option>
                  <option value="24">24 meses</option>
                  <option value="36">36 meses</option>
                  <option value="48">48 meses</option>
                  <option value="60">60 meses</option>
                </select>
              </div>
            </div>
          )}

          {/* Conditional field for Used Car Trade-in / Appraisal */}
          {(type === 'avaliacao_usado' || type === 'contato') && (
            <div>
              <label className="block text-gray-300 font-medium mb-1">
                Possui veículo para dar na troca? (Marca, Modelo, Ano)
              </label>
              <input
                type="text"
                placeholder="Ex: Honda Civic 2.0 EXL 2020 - 45.000 km"
                value={veiculoTroca}
                onChange={(e) => setVeiculoTroca(e.target.value)}
                className="w-full bg-[#0d1017] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
              />
            </div>
          )}

          <div>
            <label className="block text-gray-300 font-medium mb-1">Mensagem ou Observações</label>
            <textarea
              rows={3}
              placeholder="Digite sua mensagem, preferência de horário para contato ou detalhes adicionais..."
              value={mensagem}
              onChange={(e) => setMensagem(e.target.value)}
              className="w-full bg-[#0d1017] border border-white/10 rounded-xl p-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-sm shadow-lg shadow-amber-500/20 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <span>Gravando no banco de dados...</span>
              ) : (
                <span>Enviar Solicitação</span>
              )}
            </button>

            <p className="text-[10px] text-gray-500 text-center">
              Seus dados estão protegidos e serão utilizados exclusivamente pela nossa equipe de vendas.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
