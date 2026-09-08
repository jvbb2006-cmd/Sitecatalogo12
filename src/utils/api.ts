import { Vehicle, ServiceItem, ContactLead, CompanyConfig, AdminStats, FilterState } from '../types';

const BASE_URL = '/api';

function getAuthHeaders() {
  const token = localStorage.getItem('autoprime_admin_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// Safely parses a Response body as JSON. Never throws "Unexpected end of JSON input":
// if the body is empty, not valid JSON (e.g. an HTML error page), or the network
// connection dropped mid-response, this resolves to `null` instead of crashing the caller.
async function safeParseJson(res: Response): Promise<any | null> {
  const text = await res.text().catch(() => '');
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

// Builds a friendly Error from a failed Response, falling back gracefully when the
// server didn't (or couldn't) send a JSON error body.
async function buildErrorFromResponse(res: Response, fallbackMessage: string): Promise<Error> {
  const data = await safeParseJson(res);
  if (data?.error) return new Error(data.error);
  if (res.status === 0) return new Error('Não foi possível conectar ao servidor. Verifique sua conexão.');
  if (res.status >= 500) return new Error('Erro interno do servidor. Tente novamente em instantes.');
  return new Error(fallbackMessage);
}

export async function fetchCompanyConfig(): Promise<CompanyConfig> {
  const res = await fetch(`${BASE_URL}/config`);
  if (!res.ok) throw await buildErrorFromResponse(res, 'Erro ao buscar configurações da empresa');
  const data = await safeParseJson(res);
  return data?.config;
}

export async function updateCompanyConfig(config: Partial<CompanyConfig>): Promise<void> {
  const res = await fetch(`${BASE_URL}/config`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(config),
  });
  if (!res.ok) throw await buildErrorFromResponse(res, 'Erro ao atualizar configurações');
}

export async function fetchVehicles(filters?: Partial<FilterState>, includeDeleted = false): Promise<Vehicle[]> {
  const params = new URLSearchParams();
  if (filters?.search) params.append('search', filters.search);
  if (filters?.marca) params.append('marca', filters.marca);
  if (filters?.categoria) params.append('categoria', filters.categoria);
  if (filters?.combustivel) params.append('combustivel', filters.combustivel);
  if (filters?.cambio) params.append('cambio', filters.cambio);
  if (filters?.condicao) params.append('condicao', filters.condicao);
  if (filters?.status) params.append('status', filters.status);
  if (filters?.apenasOfertas) params.append('em_oferta', '1');
  if (filters?.precoMin) params.append('precoMin', filters.precoMin);
  if (filters?.precoMax) params.append('precoMax', filters.precoMax);
  if (filters?.anoMin) params.append('anoMin', filters.anoMin);
  if (filters?.anoMax) params.append('anoMax', filters.anoMax);
  if (filters?.sort) params.append('sort', filters.sort);
  if (includeDeleted) params.append('include_deleted', 'true');

  const res = await fetch(`${BASE_URL}/vehicles?${params.toString()}`);
  if (!res.ok) throw await buildErrorFromResponse(res, 'Erro ao buscar catálogo de veículos');
  const data = await safeParseJson(res);
  return data?.vehicles || [];
}

export async function fetchVehicleById(id: number): Promise<Vehicle> {
  const res = await fetch(`${BASE_URL}/vehicles/${id}`);
  if (!res.ok) throw await buildErrorFromResponse(res, 'Veículo não encontrado');
  const data = await safeParseJson(res);
  return data?.vehicle;
}

export async function createVehicle(vehicleData: any): Promise<number> {
  const res = await fetch(`${BASE_URL}/vehicles`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(vehicleData),
  });
  if (!res.ok) throw await buildErrorFromResponse(res, 'Erro ao cadastrar veículo');
  const data = await safeParseJson(res);
  return data?.id;
}

export async function updateVehicle(id: number, vehicleData: any): Promise<void> {
  const res = await fetch(`${BASE_URL}/vehicles/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(vehicleData),
  });
  if (!res.ok) throw await buildErrorFromResponse(res, 'Erro ao atualizar veículo');
}

export async function updateVehicleStatus(id: number, status: 'disponivel' | 'reservado' | 'vendido'): Promise<void> {
  const res = await fetch(`${BASE_URL}/vehicles/${id}/status`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw await buildErrorFromResponse(res, 'Erro ao alterar status');
}

export async function toggleVehicleDestaque(id: number): Promise<void> {
  const res = await fetch(`${BASE_URL}/vehicles/${id}/toggle-destaque`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw await buildErrorFromResponse(res, 'Erro ao alterar destaque');
}

export async function toggleVehicleOferta(id: number): Promise<void> {
  const res = await fetch(`${BASE_URL}/vehicles/${id}/toggle-oferta`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw await buildErrorFromResponse(res, 'Erro ao alterar oferta');
}

export async function duplicateVehicle(id: number): Promise<number> {
  const res = await fetch(`${BASE_URL}/vehicles/${id}/duplicate`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw await buildErrorFromResponse(res, 'Erro ao duplicar veículo');
  const data = await safeParseJson(res);
  return data?.id;
}

export async function deleteVehicle(id: number, permanent = false): Promise<void> {
  const res = await fetch(`${BASE_URL}/vehicles/${id}?permanent=${permanent}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw await buildErrorFromResponse(res, 'Erro ao excluir veículo');
}

export async function restoreVehicle(id: number): Promise<void> {
  const res = await fetch(`${BASE_URL}/vehicles/${id}/restore`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw await buildErrorFromResponse(res, 'Erro ao restaurar veículo');
}

export async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('image', file);
  const token = localStorage.getItem('autoprime_admin_token');

  const res = await fetch(`${BASE_URL}/upload`, {
    method: 'POST',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  if (!res.ok) throw await buildErrorFromResponse(res, 'Erro ao fazer upload da imagem');
  const data = await safeParseJson(res);
  if (!data?.url) throw new Error('O servidor não retornou a URL da imagem enviada.');
  return data.url;
}

export async function fetchServices(): Promise<ServiceItem[]> {
  const res = await fetch(`${BASE_URL}/services`);
  if (!res.ok) throw await buildErrorFromResponse(res, 'Erro ao buscar serviços');
  const data = await safeParseJson(res);
  return data?.services || [];
}

export async function submitContact(contactData: Partial<ContactLead>): Promise<void> {
  const res = await fetch(`${BASE_URL}/contacts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(contactData),
  });
  if (!res.ok) throw await buildErrorFromResponse(res, 'Erro ao enviar contato');
}

export async function fetchContacts(): Promise<ContactLead[]> {
  const res = await fetch(`${BASE_URL}/contacts`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw await buildErrorFromResponse(res, 'Erro ao buscar mensagens');
  const data = await safeParseJson(res);
  return data?.contacts || [];
}

export async function updateContactStatus(id: number, status: 'novo' | 'em_atendimento' | 'concluido'): Promise<void> {
  const res = await fetch(`${BASE_URL}/contacts/${id}/status`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw await buildErrorFromResponse(res, 'Erro ao atualizar status do contato');
}

export async function deleteContact(id: number): Promise<void> {
  const res = await fetch(`${BASE_URL}/contacts/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw await buildErrorFromResponse(res, 'Erro ao remover contato');
}

export async function fetchAdminStats(): Promise<{ stats: AdminStats; ultimosVeiculos: any[]; ultimosContatos: any[] }> {
  const res = await fetch(`${BASE_URL}/admin/stats`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw await buildErrorFromResponse(res, 'Erro ao buscar estatísticas');
  const data = await safeParseJson(res);
  return data || { stats: {} as AdminStats, ultimosVeiculos: [], ultimosContatos: [] };
}

export async function loginAdmin(username: string, password: string): Promise<{ token: string; user: any }> {
  const res = await fetch(`${BASE_URL}/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) throw await buildErrorFromResponse(res, 'Credenciais inválidas');
  const data = await safeParseJson(res);
  if (!data?.token) throw new Error('Resposta inválida do servidor ao fazer login.');
  localStorage.setItem('autoprime_admin_token', data.token);
  return data;
}

export async function checkAdminSession(): Promise<boolean> {
  const token = localStorage.getItem('autoprime_admin_token');
  if (!token) return false;
  try {
    const res = await fetch(`${BASE_URL}/admin/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.ok;
  } catch {
    return false;
  }
}

export function logoutAdmin(): void {
  const token = localStorage.getItem('autoprime_admin_token');
  if (token) {
    fetch(`${BASE_URL}/admin/logout`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => {});
  }
  localStorage.removeItem('autoprime_admin_token');
}
