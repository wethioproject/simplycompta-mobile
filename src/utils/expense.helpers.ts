/**
 * Format a date string (ISO or partial) to a locale date string.
 */
export const formatDate = (dateStr: string, locale = 'fr-FR'): string => {
  return new Date(dateStr).toLocaleDateString(locale);
};

/**
 * Format a numeric or string amount to a locale currency string.
 */
export const formatCurrency = (amount: string | number, locale = 'fr-FR'): string => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return `${(isNaN(num) ? 0 : num).toLocaleString(locale)} MAD`;
};

/**
 * Capitalise the first character of a string.
 */
export const capitalise = (str: string): string =>
  str.charAt(0).toUpperCase() + str.slice(1);
