export function formatCurrency(value: number): string {
  if (isNaN(value)) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatKm(value: number): string {
  if (!value || value === 0) return '0 km (Novo)';
  return `${new Intl.NumberFormat('pt-BR').format(value)} km`;
}

export function formatPhone(value: string): string {
  if (!value) return '';
  const cleaned = value.replace(/\D/g, '');
  if (cleaned.length <= 10) {
    return cleaned.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3').trim();
  }
  return cleaned.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3').trim();
}

export function cleanPhone(value: string): string {
  return value.replace(/\D/g, '');
}

export function getWhatsAppLink(phone: string, text: string): string {
  const clean = cleanPhone(phone);
  const formattedPhone = clean.startsWith('55') ? clean : `55${clean}`;
  return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(text)}`;
}

export function formatDate(dateString?: string): string {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return dateString;
  }
}
