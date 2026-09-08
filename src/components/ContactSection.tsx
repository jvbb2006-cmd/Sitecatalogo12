import React, { useState } from 'react';
import { CompanyConfig } from '../types';
import {
  IconPhone,
  IconWhatsApp,
  IconClock,
  IconLocation,
  IconCheck,
  IconShield,
  IconCar,
  IconFinance,
  IconSend,
} from './icons';
import { getWhatsAppLink } from '../utils/formatters';
import { submitContact } from '../utils/api';

interface ContactSectionProps {
  config: CompanyConfig | null;
  onOpenFinancing?: () => void;
  onOpenAppraisal?: () => void;
}

export const ContactSection: React.FC<ContactSectionProps> = ({
  config,
  onOpenFinancing,
  onOpenAppraisal,
}) => {
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [assunto, setAssunto] = useState('Dúvida sobre Veículo');
  const [mensagem, setMensagem] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const whatsAppLink = getWhatsAppLink(
    config?.whatsapp || '5511999998888',
    'Olá! Gostaria de falar com um consultor da AutoPrime para tirar dúvidas sobre um veículo.'
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !telefone.trim()) {
      setStatusMsg({ type: 'error', text: 'Por favor, informe seu nome e telefone/WhatsApp.' });
      return;
    }

    try {
      setIsSubmitting(true);
      setStatusMsg(null);

      await submitContact({
        tipo: 'contato',
        nome,
        telefone,
        email,
        mensagem: `[Assunto: ${assunto}] ${mensagem}`,
      });

      setStatusMsg({
        type: 'success',
        text: 'Mensagem enviada com sucesso! Um consultor especializado entrará em contato em breve via WhatsApp.',
      });

      // Clear form
      setNome('');
      setTelefone('');
      setEmail('');
      setMensagem('');
    } catch (err: any) {
      setStatusMsg({
        type: 'error',
        text: err.message || 'Falha ao enviar mensagem. Tente novamente ou chame no WhatsApp.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-16 sm:py-24 bg-[#0b0e14] min-h-[85vh]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="max-w-3xl mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold mb-3">
            <span>Canal Direto de Atendimento</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight font-['Space_Grotesk']">
            Entre em Contato com a AutoPrime
          </h1>
          <p className="mt-4 text-base sm:text-lg text-gray-300 leading-relaxed">
            Estamos à disposição para apresentar nossos veículos em estoque, realizar simulações de financiamento sob medida ou agendar seu atendimento exclusivo em nosso showroom.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left Column: Direct Contact & Location Info */}
          <div className="lg:col-span-5 space-y-6">
            {/* WhatsApp Priority Card */}
            <div className="bg-gradient-to-br from-emerald-950/40 via-[#11141c] to-[#141822] border border-emerald-500/30 rounded-2xl p-6 relative overflow-hidden shadow-xl">
              <div className="flex items-start justify-between">
                <div>
                  <span className="inline-block text-[11px] font-bold text-emerald-400 uppercase tracking-wider mb-1">
                    Atendimento Rápido
                  </span>
                  <h3 className="text-xl font-bold text-white font-['Space_Grotesk']">
                    Plantão no WhatsApp
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-300 mt-1.5 leading-relaxed">
                    Tire fotos do seu veículo para avaliação imediata ou solicite vídeos detalhados dos carros em estoque.
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-emerald-500 text-black flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/20">
                  <IconWhatsApp className="w-6 h-6" />
                </div>
              </div>

              <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <a
                  href={whatsAppLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-black font-bold text-sm shadow-lg shadow-emerald-400/20 transition-all hover:scale-102"
                >
                  <IconWhatsApp className="w-4 h-4 text-black" />
                  <span>Iniciar Conversa Agora</span>
                </a>
              </div>
              <p className="text-[11px] text-gray-400 mt-2 text-center sm:text-left">
                Tempo médio de resposta: menos de 5 minutos
              </p>
            </div>

            {/* Channels & Location Details */}
            <div className="bg-[#141822] border border-white/10 rounded-2xl p-6 space-y-5">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider font-['Space_Grotesk']">
                Canais de Atendimento
              </h4>

              <div className="space-y-4 text-sm">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-amber-400 shrink-0">
                    <IconPhone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs text-gray-400 block">Central Telefônica</span>
                    <span className="font-semibold text-white text-base">
                      {config?.telefone || '(11) 3045-8800'}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-amber-400 shrink-0">
                    <IconClock className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs text-gray-400 block">Horário de Funcionamento</span>
                    <span className="font-semibold text-white">
                      {config?.horario_atendimento || 'Seg a Sex: 08h às 19h | Sáb: 09h às 16h'}
                    </span>
                    <span className="text-xs text-gray-400 block mt-0.5">
                      Domingos e Feriados sob agendamento prévio
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-amber-400 shrink-0">
                    <IconLocation className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs text-gray-400 block">Showroom Principal</span>
                    <span className="font-semibold text-white">
                      {config?.endereco || 'Avenida Europa, 1420 - Jardins'}
                    </span>
                    <span className="text-xs text-gray-400 block">
                      {config?.cidade_estado || 'São Paulo - SP'}
                    </span>
                    <span className="text-[11px] text-amber-400 block mt-1">
                      * Estacionamento privativo com manobrista para clientes
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 flex gap-3">
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(
                    `${config?.endereco || 'Avenida Europa, 1420'}, ${config?.cidade_estado || 'São Paulo'}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 text-center py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold border border-white/10 transition-colors"
                >
                  Abrir no Google Maps
                </a>
                <a
                  href={`https://waze.com/ul?q=${encodeURIComponent(
                    `${config?.endereco || 'Avenida Europa, 1420'}, ${config?.cidade_estado || 'São Paulo'}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 text-center py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold border border-white/10 transition-colors"
                >
                  Navegar com Waze
                </a>
              </div>
            </div>

            {/* Guarantees Box */}
            <div className="bg-[#141822] border border-white/10 rounded-2xl p-6">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider font-['Space_Grotesk'] mb-3">
                Compromisso com o Cliente
              </h4>
              <ul className="space-y-2.5 text-xs text-gray-300">
                <li className="flex items-center gap-2">
                  <IconCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Atendimento consultivo sem pressão de venda</span>
                </li>
                <li className="flex items-center gap-2">
                  <IconCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Laudo cautelar 100% periciado entregue em mãos</span>
                </li>
                <li className="flex items-center gap-2">
                  <IconCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Sigilo e segurança em todas as transações</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Right Column: Contact & Message Form */}
          <div className="lg:col-span-7">
            <div className="bg-[#141822] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-xl">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-white font-['Space_Grotesk']">
                  Envie uma Mensagem
                </h3>
                <p className="text-xs sm:text-sm text-gray-400 mt-1">
                  Preencha o formulário abaixo e receba atendimento exclusivo pelo canal de sua preferência.
                </p>
              </div>

              {statusMsg && (
                <div
                  className={`p-4 rounded-xl text-sm mb-6 flex items-start gap-3 ${
                    statusMsg.type === 'success'
                      ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
                      : 'bg-red-500/15 border border-red-500/30 text-red-300'
                  }`}
                >
                  <IconCheck className="w-5 h-5 shrink-0 mt-0.5" />
                  <span>{statusMsg.text}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1.5">
                      Seu Nome Completo *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Carlos Eduardo Silveira"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      className="w-full bg-[#0e1117] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-400 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1.5">
                      Telefone / WhatsApp *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="(11) 99999-9999"
                      value={telefone}
                      onChange={(e) => setTelefone(e.target.value)}
                      className="w-full bg-[#0e1117] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-400 transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1.5">
                      E-mail (opcional)
                    </label>
                    <input
                      type="email"
                      placeholder="seuemail@exemplo.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-[#0e1117] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-400 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1.5">
                      Assunto de Interesse
                    </label>
                    <select
                      value={assunto}
                      onChange={(e) => setAssunto(e.target.value)}
                      className="w-full bg-[#0e1117] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-400 transition-colors"
                    >
                      <option value="Dúvida sobre Veículo">Dúvida sobre Veículo do Estoque</option>
                      <option value="Simulação de Financiamento">Simulação de Financiamento</option>
                      <option value="Avaliação de Usado na Troca">Avaliação de Usado na Troca</option>
                      <option value="Agendamento de Test-Drive">Agendamento de Test-Drive</option>
                      <option value="Consignação do Meu Veículo">Quero Deixar Meu Carro em Consignação</option>
                      <option value="Outros Assuntos">Outros Assuntos</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1.5">
                    Mensagem ou Detalhes
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Conte-nos qual veículo você tem interesse, preferências de ano/cor ou detalhes do seu carro para troca..."
                    value={mensagem}
                    onChange={(e) => setMensagem(e.target.value)}
                    className="w-full bg-[#0e1117] border border-white/10 rounded-xl p-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-400 transition-colors resize-none"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 px-6 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:bg-amber-400/50 text-black font-bold text-sm shadow-lg shadow-amber-400/20 transition-all hover:scale-[1.01] flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        <span>Enviando mensagem...</span>
                      </>
                    ) : (
                      <>
                        <span>Enviar Mensagem para Consultor</span>
                        <IconSend className="w-4 h-4 text-black" />
                      </>
                    )}
                  </button>
                  <p className="text-[11px] text-gray-500 text-center mt-2.5">
                    Seus dados estão protegidos e serão utilizados exclusivamente para este atendimento.
                  </p>
                </div>
              </form>
            </div>

            {/* Quick Actions Shortcuts */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
              {onOpenFinancing && (
                <button
                  onClick={onOpenFinancing}
                  className="p-4 rounded-xl bg-[#141822] border border-white/10 hover:border-amber-400/30 text-left transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
                      <IconFinance className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="font-bold text-white text-sm block group-hover:text-amber-400 transition-colors">
                        Simular Financiamento
                      </span>
                      <span className="text-xs text-gray-400">
                        Calcule parcelas e entradas estimadas
                      </span>
                    </div>
                  </div>
                </button>
              )}

              {onOpenAppraisal && (
                <button
                  onClick={onOpenAppraisal}
                  className="p-4 rounded-xl bg-[#141822] border border-white/10 hover:border-amber-400/30 text-left transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
                      <IconCar className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="font-bold text-white text-sm block group-hover:text-amber-400 transition-colors">
                        Avaliar Meu Usado
                      </span>
                      <span className="text-xs text-gray-400">
                        Utilize seu seminovo como entrada
                      </span>
                    </div>
                  </div>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
