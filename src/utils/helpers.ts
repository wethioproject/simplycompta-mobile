export const formatCurrency = (amount: number): string => {
  return `$${amount.toFixed(2)}`;
};

export const validateEmail = (email: string): boolean => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const getMimeType = (url: string, fallback = 'application/pdf'): string => {
  const raw = url.split('?')[0].split('.').pop()?.toLowerCase() ?? '';
  const ext = /^[a-z0-9]{1,5}$/.test(raw) ? raw : '';
  const map: Record<string, string> = {
    pdf:  'application/pdf',
    png:  'image/png',
    jpg:  'image/jpeg',
    jpeg: 'image/jpeg',
    gif:  'image/gif',
    webp: 'image/webp',
    doc:  'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xls:  'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  };
  return map[ext] ?? fallback;
};