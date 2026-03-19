// ─── Invoice calculation utilities ────────────────────────────────────────

import type { Article, InvoiceArticle } from '../types/invoice.types';

export const calculateArticleTotal = (unitPrice: number, quantity: number): number => {
  return unitPrice * quantity;
};

export const calculateInvoiceTotalHT = (articles: Article[]): number => {
  return articles.reduce((sum, article) => sum + (article.totalHT ?? 0), 0);
};

export const calculateInvoiceTotalTVA = (articles: Article[]): number => {
  return articles.reduce((sum, article) => {
    const totalHT = article.totalHT ?? 0;
    const tvaPercent = article.tva ?? 0;
    return sum + (totalHT * tvaPercent) / 100;
  }, 0);
};

export const calculateInvoiceTotalTTC = (articles: Article[]): number => {
  const totalHT = calculateInvoiceTotalHT(articles);
  const totalTVA = calculateInvoiceTotalTVA(articles);
  return totalHT + totalTVA;
};

export const calculateInvoiceFromItems = (articles: Article[]) => {
  const totalHT = calculateInvoiceTotalHT(articles);
  const totalTVA = calculateInvoiceTotalTVA(articles);
  const totalTTC = calculateInvoiceTotalTTC(articles);

  return { totalHT, totalTVA, totalTTC };
};

/**
 * Calculate invoice totals (HT, TVA, TTC) from InvoiceArticle items
 * Works with the full InvoiceItem articles structure
 */
export interface InvoiceTotals {
  totalHT: number;
  totalTVA: number;
  totalTTC: number;
}

export const calculateInvoiceTotals = (articles: InvoiceArticle[]): InvoiceTotals => {
  const totalHT = articles.reduce((sum, article) => sum + parseFloat(article.total_price_ht), 0);
  const totalTVA = articles.reduce(
    (sum, article) => sum + (parseFloat(article.total_price_ht) * parseFloat(article.tva_percentage)) / 100,
    0
  );
  const totalTTC = totalHT + totalTVA;

  return { totalHT, totalTVA, totalTTC };
};

