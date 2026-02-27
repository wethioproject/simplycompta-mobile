import api from '../api';
import { Api_Endpoints } from './endpoints';

class InvoiceService {

    async getInvoices(params?: { month?: number; year?: number }) {
        try {
            const response = await api.get(Api_Endpoints.customerInvoices, { params });
            return response.data;
        } catch (error) {
            console.error('Invoices fetch error:', error);
            throw error;
        }
    }

    async getInvoice(id: number) {
        try {
            const response = await api.get(`${Api_Endpoints.customerInvoice}/${id}`)
            return response.data;
        } catch (error: any) {
            console.error('Invoice fetch error:', error.response?.data || error.message);
            throw error;
        }
    }

    async getInvoiceResources() {
        try {
            const response = await api.get(Api_Endpoints.customerInvoiceResources);
            return response.data;
        } catch (error: any) {
            console.error('Invoice resources fetch error:', error.response?.data || error.message);
            throw error;
        }
    }

    // async createInvoice(payload: BankStatementPayload): Promise<BankStatementResponse> {
    async createInvoice(payload: any): Promise<any> {
        try {
            const formData = new FormData();
            console.log('Creating invoice with payload:', payload);
            formData.append('customer_id', String(payload.customer_id));
            formData.append('client_id', String(payload.client_id));
            formData.append('date', payload.date);
            formData.append('invoice_number', payload.invoice_number);
            formData.append('payment_method', payload.payment_method);
            formData.append('status', payload.status ?? 'Brouillons');

            if (payload.document) {
                const file = payload.document;
                formData.append('document', {
                    uri: file.fileCopyUri || file.uri,
                    type: file.type || 'application/pdf',
                    name: file.name || 'invoice.pdf',
                } as any);
            }

            payload.articles?.forEach((article: any, index: number) => {
                formData.append(`articles[${index}][designation]`, article.designation);
                formData.append(`articles[${index}][unit_price_ht]`, String(article.unit_price_ht));
                formData.append(`articles[${index}][quantity]`, String(article.quantity));
                formData.append(`articles[${index}][total_price_ht]`, String(article.total_price_ht));
                formData.append(`articles[${index}][tva_percentage]`, String(article.tva_percentage));
            });

            const response = await api.post<any>(Api_Endpoints.customerInvoice, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            return response.data;
        } catch (error: any) {
            console.error('Create Invoice error:', error.response?.data || error.message);
            throw error;
        }
    }


    async updateInvoice(id: number,payload: any): Promise<any> {
        try {
            const formData = new FormData();
            formData.append('customer_id', String(payload.customer_id));
            formData.append('client_id', String(payload.client_id));
            formData.append('date', payload.date);
            formData.append('invoice_number', payload.invoice_number);
            formData.append('payment_method', payload.payment_method);
            formData.append('status', payload.status ?? 'Brouillons');
            formData.append('_method', 'PUT');

            if (payload.document) {
                const file = payload.document;
                formData.append('document', {
                    uri: file.fileCopyUri || file.uri,
                    type: file.type || 'application/pdf',
                    name: file.name || 'invoice.pdf',
                } as any);
            }

            payload.articles?.forEach((article: any, index: number) => {
                formData.append(`articles[${index}][designation]`, article.designation);
                formData.append(`articles[${index}][unit_price_ht]`, String(article.unit_price_ht));
                formData.append(`articles[${index}][quantity]`, String(article.quantity));
                formData.append(`articles[${index}][total_price_ht]`, String(article.total_price_ht));
                formData.append(`articles[${index}][tva_percentage]`, String(article.tva_percentage));
            });

            const response = await api.post<any>(`${Api_Endpoints.customerInvoice}/${id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            return response.data;
        } catch (error: any) {
            console.error('Update Invoice error:', error.response?.data || error.message);
            throw error;
        }
    }


    async exportInvoices(): Promise<string> {
        try {
            const response = await api.get(Api_Endpoints.customerInvoiceExport);
            // Response shape: { success, message, data: { file_url: '/storage/...' } }
            const filePath: string = response.data?.data?.file_url;
            if (!filePath) throw new Error('No file_url in export response.');
            // Strip trailing /api/ from BASE_URL to get domain root
            const domain = 'https://simply-compta.com';
            return `${domain}${filePath}`;
        } catch (error: any) {
            console.error('Export invoices error:', error.response?.data || error.message);
            throw error;
        }
    }

    async deleteInvoice(id: number) {
        try {
            const response = await api.delete(`${Api_Endpoints.customerInvoice}/${id}`)
            return response.data;
        } catch (error: any) {
            console.error('Invoice delete error:', error.response?.data || error.message);
            throw error;
        }
    }

}


const invoiceService = new InvoiceService();
export default invoiceService;
