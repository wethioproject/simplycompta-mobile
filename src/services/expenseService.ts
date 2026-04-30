import api from '../api';
import { Api_Endpoints } from './endpoints';

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
            console.log('Creating expense with payload:', payload);
            formData.append('customer_id', String(payload.customer_id));
            formData.append('date', payload.date);
            formData.append('ttc', payload.ttc);
            formData.append('tva', payload.tva);
            formData.append('payment_method', payload.payment_method);
            formData.append('category_id', payload.category_id);
            formData.append('total_ttc', payload.total_ttc);
            formData.append('total_tva', payload.total_tva);

            if (payload.supplier_id != null) {
                formData.append('supplier_id', String(payload.supplier_id));
            }

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
            });
            return response.data;
        } catch (error: any) {
            console.error('Create Expense error:', error.response?.data || error.message);
            throw error;
        }
    }


    async updateExpense(id: number,payload: any): Promise<any> {
        try {
            const formData = new FormData();
            formData.append('customer_id', String(payload.customer_id));
            formData.append('date', payload.date);
            formData.append('ttc', payload.ttc);
            formData.append('tva', payload.tva);
            formData.append('payment_method', payload.payment_method);
            formData.append('category_id', payload.category_id);
            formData.append('total_ttc', payload.total_ttc);
            formData.append('total_tva', payload.total_tva);
            formData.append('_method', 'PUT');
            formData.append('remove_document', String(payload.remove_document ?? 0));

            if (payload.supplier_id != null) {
                formData.append('supplier_id', String(payload.supplier_id));
            }

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
            });
            return response.data;
        } catch (error: any) {
            console.error('Update Expense error:', error.response?.data || error.message);
            throw error;
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