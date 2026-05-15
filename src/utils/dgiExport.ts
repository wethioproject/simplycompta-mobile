import type { ExpenseItem } from '../types/expense.types';
import type { InvoiceArticle, InvoiceItem } from '../types/invoice.types';

export type DgiExportKind = 'expenses' | 'invoices';

export type DgiRow = {
  order: number;
  invoiceDate: string;
  invoiceNumber: string;
  thirdPartyName: string;
  ifNumber: string;
  ice: string;
  designation: string;
  amountHt: number;
  tvaRate: string;
  amountTva: number;
  amountTtc: number;
  paymentMethod: string;
  paymentDate: string;
  accountNumber: string;
};

const DGI_HEADERS = [
  "N° d'ordre",
  'Date de la Facture',
  'N° Facture',
  'Nom du Fournisseur',
  'N° I.F.',
  'ICE',
  'Désignation des biens, services ou travaux',
  'MT HT',
  'Taux de TVA',
  'MT TVA',
  'MT TTC',
  'Mode de Règlement',
  'Date de Règlement',
  'N° Compte',
];

const toNumber = (value: unknown): number => {
  if (value === null || value === undefined || value === '') return 0;
  const normalized = String(value).replace(/\s/g, '').replace(',', '.');
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
};

const escapeHtml = (value: unknown): string =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const formatDate = (value: unknown): string => {
  if (!value) return '';
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString('fr-FR');
};

const formatAmount = (value: number): string =>
  value.toLocaleString('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const normalizeRate = (value: unknown): string => {
  if (value === null || value === undefined || value === '') return '';
  const numeric = toNumber(value);
  if (!Number.isFinite(numeric)) return String(value);
  return `${numeric.toLocaleString('fr-FR', { maximumFractionDigits: 2 })}%`;
};

const inferRate = (amountHt: number, amountTva: number): string => {
  if (amountHt <= 0 || amountTva <= 0) return '';
  return `${Math.round((amountTva / amountHt) * 100)}%`;
};

const getSupplierName = (expense: ExpenseItem): string =>
  expense.supplier?.company_name ||
  expense.supplier?.supplier_name ||
  expense.supplier?.name ||
  '';

const getExpenseDesignation = (expense: ExpenseItem): string =>
  expense.category?.name ||
  expense.notes ||
  'Dépense';

export const expensesToDgiRows = (expenses: ExpenseItem[]): DgiRow[] =>
  expenses.map((expense, index) => {
    const amountTtc = toNumber(expense.total_ttc || expense.ttc);
    const amountTva = toNumber(expense.total_tva || expense.tva);
    const amountHt = Math.max(amountTtc - amountTva, 0);

    return {
      order: index + 1,
      invoiceDate: formatDate(expense.date),
      invoiceNumber: expense.reference || String(expense.id),
      thirdPartyName: getSupplierName(expense),
      ifNumber: (expense.supplier as any)?.if_number || '',
      ice: expense.supplier?.ice || expense.supplier?.ice_number || '',
      designation: getExpenseDesignation(expense),
      amountHt,
      tvaRate: inferRate(amountHt, amountTva),
      amountTva,
      amountTtc,
      paymentMethod: expense.payment_method || '',
      paymentDate: formatDate(expense.date),
      accountNumber: (expense as any).account?.number || (expense as any).account_number || '',
    };
  });

const sumInvoiceHt = (articles: InvoiceArticle[] = []): number =>
  articles.reduce((sum, article) => sum + toNumber(article.total_price_ht), 0);

const sumInvoiceTva = (articles: InvoiceArticle[] = [], fallbackTtc = 0): number => {
  if (!articles.length) return 0;
  const tva = articles.reduce((sum, article) => {
    const ht = toNumber(article.total_price_ht);
    const rate = toNumber(article.tva_percentage);
    return sum + (ht * rate) / 100;
  }, 0);
  return tva || Math.max(fallbackTtc - sumInvoiceHt(articles), 0);
};

const getInvoiceRate = (articles: InvoiceArticle[] = []): string => {
  const rates = Array.from(new Set(articles.map(article => normalizeRate(article.tva_percentage)).filter(Boolean)));
  if (rates.length === 1) return rates[0];
  if (rates.length > 1) return 'Mixte';
  return '';
};

export const invoicesToDgiRows = (invoices: InvoiceItem[]): DgiRow[] =>
  invoices.map((invoice, index) => {
    const articles = invoice.articles || [];
    const amountTtc = toNumber(invoice.total_ttc);
    const amountHt = sumInvoiceHt(articles) || amountTtc;
    const amountTva = sumInvoiceTva(articles, amountTtc);
    const client = invoice.client as any;

    return {
      order: index + 1,
      invoiceDate: formatDate(invoice.date),
      invoiceNumber: invoice.invoice_number_formatted || invoice.invoice_number || String(invoice.id),
      thirdPartyName: client?.client_name || client?.company_name || client?.name || '',
      ifNumber: client?.if_number || '',
      ice: client?.ice || client?.ice_number || '',
      designation: articles.map(article => article.designation).filter(Boolean).join(' / ') || invoice.notes || 'Facture client',
      amountHt,
      tvaRate: getInvoiceRate(articles) || inferRate(amountHt, amountTva),
      amountTva,
      amountTtc,
      paymentMethod: invoice.payment_method || '',
      paymentDate: invoice.status === 'paid' ? formatDate(invoice.due_date || invoice.date) : '',
      accountNumber: (invoice as any).account?.number || (invoice as any).account_number || '',
    };
  });

const renderRow = (row: DgiRow): string => {
  const cells = [
    row.order,
    row.invoiceDate,
    row.invoiceNumber,
    row.thirdPartyName,
    row.ifNumber,
    row.ice,
    row.designation,
    formatAmount(row.amountHt),
    row.tvaRate,
    formatAmount(row.amountTva),
    formatAmount(row.amountTtc),
    row.paymentMethod,
    row.paymentDate,
    row.accountNumber,
  ];

  return `<tr>${cells.map(cell => `<td>${escapeHtml(cell)}</td>`).join('')}</tr>`;
};

export const buildDgiHtmlWorkbook = (title: string, rows: DgiRow[]): string => {
  const totalHt = rows.reduce((sum, row) => sum + row.amountHt, 0);
  const totalTva = rows.reduce((sum, row) => sum + row.amountTva, 0);
  const totalTtc = rows.reduce((sum, row) => sum + row.amountTtc, 0);

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    body { font-family: Arial, sans-serif; }
    h1 { font-size: 18px; margin: 0 0 14px; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #111; padding: 5px 7px; font-size: 12px; white-space: nowrap; }
    th { background: #fff89a; font-weight: 700; text-align: center; }
    td:nth-child(7) { min-width: 260px; white-space: normal; }
    .total td { font-weight: 700; background: #f4f4f4; }
    .grand td { font-weight: 700; background: #e6e6e6; }
  </style>
</head>
<body>
  <h1>${escapeHtml(title)}</h1>
  <table>
    <thead>
      <tr>${DGI_HEADERS.map(header => `<th>${escapeHtml(header)}</th>`).join('')}</tr>
    </thead>
    <tbody>
      ${rows.map(renderRow).join('')}
      <tr class="total">
        <td colspan="7">Total page (1/1)</td>
        <td>${escapeHtml(formatAmount(totalHt))}</td>
        <td></td>
        <td>${escapeHtml(formatAmount(totalTva))}</td>
        <td>${escapeHtml(formatAmount(totalTtc))}</td>
        <td colspan="3"></td>
      </tr>
      <tr class="grand">
        <td colspan="9">Total de la TVA déductible après application du prorata visé à l'article 104 du CGI</td>
        <td>${escapeHtml(formatAmount(totalTva))}</td>
        <td colspan="4"></td>
      </tr>
    </tbody>
  </table>
</body>
</html>`;
};

export const buildDgiFileName = (kind: DgiExportKind, month: number, year: number): string => {
  const suffix = `${year}-${String(month).padStart(2, '0')}`;
  return `export-dgi-${kind}-${suffix}.xls`;
};
