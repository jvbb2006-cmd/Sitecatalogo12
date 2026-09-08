export interface Vehicle {
  id: number;
  marca: string;
  modelo: string;
  versao: string;
  categoria: string;
  preco: number;
  preco_promocional: number;
  ano_fabricacao: number;
  ano_modelo: number;
  km: number;
  combustivel: string;
  cambio: string;
  cor: string;
  portas: number;
  placa_final: string;
  condicao: 'Novo' | 'Seminovo';
  descricao: string;
  status: 'disponivel' | 'reservado' | 'vendido';
  destaque: number;
  em_oferta: number;
  ordem: number;
  is_deleted?: number;
  created_at?: string;
  updated_at?: string;
  cover_image: string;
  images: string[];
  features: string[];
  similar?: Vehicle[];
}

export interface ServiceItem {
  id: number;
  titulo: string;
  descricao: string;
  icone_tipo: string;
  link_texto: string;
  ativo: number;
}

export interface ContactLead {
  id: number;
  tipo: 'contato' | 'financiamento' | 'avaliacao_usado' | 'agendamento_visita' | 'test_drive';
  nome: string;
  telefone: string;
  email: string;
  veiculo_id?: number | null;
  veiculo_nome?: string;
  valor_entrada?: number;
  parcelas?: number;
  veiculo_troca?: string;
  mensagem?: string;
  status: 'novo' | 'em_atendimento' | 'concluido';
  created_at: string;
}

export interface CompanyConfig {
  id: number;
  nome: string;
  slogan: string;
  logo_url: string;
  cor_destaque: string;
  telefone: string;
  whatsapp: string;
  email: string;
  endereco: string;
  cidade_estado: string;
  horario_atendimento: string;
  instagram: string;
  facebook: string;
  banner_titulo: string;
  banner_subtitulo: string;
  banner_imagem: string;
  sobre_historia: string;
  sobre_missao: string;
  sobre_valores: string;
  sobre_diferenciais: string;
  metric_carros_vendidos: string;
  metric_anos_experiencia: string;
  metric_clientes_atendidos: string;
  metric_satisfacao: string;
}

export interface AdminStats {
  total_veiculos?: number;
  totalVeiculos?: number;
  disponiveis: number;
  veiculos_disponiveis?: number;
  vendidos: number;
  veiculos_vendidos?: number;
  reservados?: number;
  veiculos_reservados?: number;
  ofertas: number;
  veiculos_oferta?: number;
  totalContatos: number;
  total_contatos?: number;
  novosContatos: number;
  contatos_novos?: number;
}

export interface FilterState {
  search: string;
  marca: string;
  categoria: string;
  anoMin: string;
  anoMax: string;
  precoMin: string;
  precoMax: string;
  combustivel: string;
  cambio: string;
  condicao: string;
  status: string;
  apenasOfertas: boolean;
  sort: string;
}
