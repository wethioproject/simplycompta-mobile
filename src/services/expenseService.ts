import api from '../api';
import { Api_Endpoints } from './endpoints';

const EXPENSE_UPLOAD_TIMEOUT_MS = 45000;

const extractApiError = (error: any, fallback: string) => {
    const data = error?.response?.data;
    const validationErrors = data?.errors && typeof data.errors === 'object'
        ? Object.values(data.errors).flat().filter(Boolean).join('\n')
        : '';
    if (validationErrors) return validationErrors;
    if (data?.message) return data.message;
    if (error?.code === 'ECONNABORTED') return 'Request timed out. Please check your connection and try again.';
    return error?.message || fallback;
};

const appendIfPresent = (formData: FormData, key: string, value: any) => {
    if (value === undefined || value === null || value === '') return;
    formData.append(key, String(value));
};

class ExpenseService {

    async getExpenses(params?: { month?: number; year?: number}) {
        try {
            const response = await api.get(Api_Endpoints.customerExpenses, { params });
            return response.data;
        } catch (error) {
            console.error('Expenses fetch error:', error);
            throw error;
        }
    }

    async getExpense(id: number) {
        try {
            const response = await api.get(`${Api_Endpoints.customerExpense}/${id}`)
            return response.data;
        } catch (error: any) {
            console.error('Expense fetch error:', error.response?.data || error.message);
            throw error;
        }
    }

    async getExpenseResources() {
        try {
            const response = await api.get(Api_Endpoints.customerExpenseResources);
            return response.data;
        } catch (error: any) {
            console.error('Expense resources fetch error:', error.response?.data || error.message);
            throw error;
        }
    }

    // async createExpense(payload: BankStatementPayload): Promise<BankStatementResponse> {
    async createExpense(payload: any): Promise<any> {
        try {
            const formData = new FormData();
            console.log('[Expense:create] payload summary', {
                customer_id: payload.customer_id,
                supplier_id: payload.supplier_id,
                category_id: payload.category_id,
                payment_method: payload.payment_method,
                ttc: payload.ttc,
                tva: payload.tva,
                has_document: Boolean(payload.document),
                is_ocr: payload.is_ocr,
            });
            appendIfPresent(formData, 'customer_id', payload.customer_id);
            appendIfPresent(formData, 'date', payload.date);
            appendIfPresent(formData, 'ttc', payload.ttc);
            appendIfPresent(formData, 'tva', payload.tva ?? 0);
            appendIfPresent(formData, 'payment_method', payload.payment_method);
            appendIfPresent(formData, 'category_id', payload.category_id);
            appendIfPresent(formData, 'total_ttc', payload.total_ttc ?? payload.ttc);
            appendIfPresent(formData, 'total_tva', payload.total_tva ?? payload.tva ?? 0);
            appendIfPresent(formData, 'supplier_id', payload.supplier_id);
            appendIfPresent(formData, 'reference', payload.reference ?? payload.expense_reference);
            appendIfPresent(formData, 'notes', payload.notes ?? payload.description);
            appendIfPresent(formData, 'is_ocr', payload.is_ocr ?? 0);
            appendIfPresent(formData, 'ocr_confidence_score', payload.ocr_confidence_score);
            if (payload.ocr_raw) appendIfPresent(formData, 'ocr_raw', JSON.stringify(payload.ocr_raw));
            if (payload.ocr_warnings) appendIfPresent(formData, 'ocr_warnings', JSON.stringify(payload.ocr_warnings));
            if (payload.ocr_items) appendIfPresent(formData, 'ocr_items', JSON.stringify(payload.ocr_items));
            if (payload.document) {
                const file = payload.document;
                formData.append('file', {
                    uri: file.fileCopyUri || file.uri,
                    type: file.type || 'application/pdf',
                    name: file.name || 'Expense.pdf',
                } as any);
            }

            const response = await api.post<any>(Api_Endpoints.customerExpense, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                timeout: EXPENSE_UPLOAD_TIMEOUT_MS,
            });
            console.log('[Expense:create] response', response.status, response.data?.success);
            return response.data;
        } catch (error: any) {
            console.error('Create Expense error:', error.response?.data || error.message);
            throw new Error(extractApiError(error, 'Failed to upload expense.'));
        }
    }


    async updateExpense(id: number,payload: any): Promise<any> {
        try {
            const formData = new FormData();
            appendIfPresent(formData, 'customer_id', payload.customer_id);
            appendIfPresent(formData, 'date', payload.date);
            appendIfPresent(formData, 'ttc', payload.ttc);
            appendIfPresent(formData, 'tva', payload.tva ?? 0);
            appendIfPresent(formData, 'payment_method', payload.payment_method);
            appendIfPresent(formData, 'category_id', payload.category_id);
            appendIfPresent(formData, 'total_ttc', payload.total_ttc ?? payload.ttc);
            appendIfPresent(formData, 'total_tva', payload.total_tva ?? payload.tva ?? 0);
            formData.append('_method', 'PUT');
            formData.append('remove_document', String(payload.remove_document ?? 0));
            appendIfPresent(formData, 'supplier_id', payload.supplier_id);
            appendIfPresent(formData, 'reference', payload.reference ?? payload.expense_reference);
            appendIfPresent(formData, 'notes', payload.notes ?? payload.description);
            appendIfPresent(formData, 'is_ocr', payload.is_ocr ?? 0);

            if (payload.document) {
                const file = payload.document;
                formData.append('file', {
                    uri: file.fileCopyUri || file.uri,
                    type: file.type || 'application/pdf',
                    name: file.name || 'Expense.pdf',
                } as any);
            }

            const response = await api.post<any>(`${Api_Endpoints.customerExpense}/${id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                timeout: EXPENSE_UPLOAD_TIMEOUT_MS,
            });
            return response.data;
        } catch (error: any) {
            console.error('Update Expense error:', error.response?.data || error.message);
            throw new Error(extractApiError(error, 'Failed to update expense.'));
        }
    }

    async exportExpenses(): Promise<{ csvData: string; fileName: string }> {
        try {
            const response = await api.get(Api_Endpoints.customerExpenseExport, {
                responseType: 'text',
            });
            const csvData: string = typeof response.data === 'string'
                ? response.data
                : JSON.stringify(response.data);
            const disposition: string =
                response.headers?.['content-disposition'] ||
                response.headers?.['Content-Disposition'] || '';
            const match = disposition.match(/filename=([^;\s]+)/);
            const fileName = match ? match[1].replace(/"/g, '') : 'expenses_export.csv';
            return { csvData, fileName };
        } catch (error: any) {
            console.error('Export expenses error:', error.response?.data || error.message);
            throw error;
        }
    }

    async duplicateExpense(id: number): Promise<any> {
        try {
            const response = await api.post<any>(`${Api_Endpoints.customerExpenseDuplicate}/${id}`);
            return response.data;
        } catch (error: any) {
            console.error('Duplicate Expense error:', error.response?.data || error.message);
            throw error;
        }
    }

    async deleteExpense(id: number) {
        try {
            const response = await api.delete(`${Api_Endpoints.customerExpense}/${id}`)
            return response.data;
        } catch (error: any) {
            console.error('Expense delete error:', error.response?.data || error.message);
            throw error;
        }
    }

}


const expenseService = new ExpenseService();
export default expenseService;
