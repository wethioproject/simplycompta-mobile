import { ChecklistItem, ChecklistItemAPI } from '../types/onboarding.types';

export const CHECKLIST_STATIC: Omit<ChecklistItem, 'status'>[] = [
  {
    id: 'company-setup',
    titleKey: 'checklist_company_title',
    subtitleKey: 'checklist_company_subtitle',
    iconName: 'Building2',
    targetScreen: 'Company Profile',
    targetParams: { fromChecklist: true },
  },
  {
    id: 'first-client',
    titleKey: 'checklist_client_title',
    subtitleKey: 'checklist_client_subtitle',
    iconName: 'User',
    targetScreen: 'Contacts',
    targetParams: { autoOpen: true, tab: 'clients' },
  },
  {
    id: 'first-invoice',
    titleKey: 'checklist_invoice_title',
    subtitleKey: 'checklist_invoice_subtitle',
    iconName: 'FileText',
    targetScreen: 'Invoice',
    targetParams: { openCreateModal: true },
  },
  {
    id: 'add-supplier',
    titleKey: 'checklist_supplier_title',
    subtitleKey: 'checklist_supplier_subtitle',
    iconName: 'Users',
    targetScreen: 'Contacts',
    targetParams: { autoOpen: true, tab: 'suppliers' },
  },
  {
    id: 'first-expense',
    titleKey: 'checklist_expense_title',
    subtitleKey: 'checklist_expense_subtitle',
    iconName: 'Receipt',
    targetScreen: 'Expenses',
    targetParams: { openCreateModal: true },
  },
];

export const DEFAULT_CHECKLIST_ITEMS: ChecklistItem[] = CHECKLIST_STATIC.map(item => ({
  ...item,
  status: 'pending',
}));

