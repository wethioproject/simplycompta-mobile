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

/**
 * Map an API category name (English or French) to its i18n key.
 * Falls back to the raw name if no mapping is found.
 */
export const CATEGORY_KEY_MAP: Record<string, string> = {
  // English API names
  'Fuel': 'expense_cat_carburant_transport',
  'Internet': 'expense_cat_internet',
  'Office Supplies': 'expense_cat_office_supplies',
  'Other': 'expense_cat_autres_depenses',
  'Rent': 'expense_cat_loyer',
  'Restaurant': 'expense_cat_restaurant',
  'Transport': 'expense_cat_transport',
  'Utilities': 'expense_cat_utilities',
  'Cloud Services': 'expense_cat_cloud_services',
  'Meals & Entertainment': 'expense_cat_meals_entertainment',
  'Meals and Entertainment': 'expense_cat_meals_and_entertainment',
  'Salaries': 'expense_cat_salaires',
  // French API / legacy names
  'Autres dépenses': 'expense_cat_autres_depenses',
  'Banque / Assurance': 'expense_cat_banque_assurance',
  'Carburant / Transport': 'expense_cat_carburant_transport',
  'Comptable / Juridiques': 'expense_cat_comptable_juridiques',
  'Eau / Électricité': 'expense_cat_utilities',
  'Fournitures': 'expense_cat_fournitures',
  'Impôts / Taxes': 'expense_cat_impots_taxes',
  'Logiciels / Abonnements': 'expense_cat_logiciels_abonnements',
  'Loyer': 'expense_cat_loyer',
  'Maintenance / Réparation': 'expense_cat_maintenance_reparation',
  'Marketing / Publicités': 'expense_cat_marketing_publicites',
  'Salaires': 'expense_cat_salaires',
};

export const resolveCategoryKey = (name?: string): string => {
  if (!name) return 'expense_cat_autres_depenses';
  return CATEGORY_KEY_MAP[name] ?? CATEGORY_KEY_MAP[name.trim()] ?? '';
};
