/**
 * Returns the uppercased first character of a name string.
 */
export const getInitials = (name: string): string =>
  name.charAt(0).toUpperCase();

/**
 * Formats an ISO date string to a locale-aware display string.
 */
export const formatDate = (dateStr: string, locale: string): string =>
  new Date(dateStr).toLocaleDateString(locale);
