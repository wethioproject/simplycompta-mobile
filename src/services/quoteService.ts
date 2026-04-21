import api from '../api';
import { Api_Endpoints } from './endpoints';

class QuoteService {

    async getQuotes(params?: { month?: number; year?: number }) {
        try {
            const response = await api.get(Api_Endpoints.customerQuotes, { params });
            return response.data;
        } catch (error) {
            console.error('Quotes fetch error:', error);
            throw error;
        }
    }

    async getQuote(id: number) {
        try {
            const response = await api.get(`${Api_Endpoints.customerQuote}/${id}`)
            return response.data;
        } catch (error: any) {
            console.error('Quote fetch error:', error.response?.data || error.message);
            throw error;
        }
    }

    async getQuoteResources() {
        try {
            const response = await api.get(Api_Endpoints.customerInvoiceResources);
            return response.data;
        } catch (error: any) {
            console.error('Quote resources fetch error:', error.response?.data || error.message);
            throw error;
        }
    }

    async getProductResources() {
        try {
            const response = await api.get(Api_Endpoints.customerProductResources);
            return response.data;
        } catch (error: any) {
            console.error('Product resources fetch error:', error.response?.data || error.message);
            throw error;
        }
    }

    async createQuote(payload: any): Promise<any> {
        try {
            const formData = new FormData();
            console.log('Creating quote with payload:', payload);
            formData.append('customer_id', String(payload.customer_id));
            formData.append('client_id', String(payload.client_id));
            formData.append('date', payload.date);
            formData.append('quote_number', payload.quote_number);
            formData.append('payment_method', payload.payment_method);
            formData.append('status', payload.status ?? 'Brouillons');
            formData.append('notes', payload.notes);
            formData.append('due_date', payload.due_date);

            if (payload.document) {
                const file = payload.document;
                formData.append('document', {
                    uri: file.fileCopyUri || file.uri,
                    type: file.type || 'application/pdf',
                    name: file.name || 'quote.pdf',
                } as any);
            }

            payload.articles?.forEach((article: any, index: number) => {
                formData.append(`articles[${index}][designation]`, article.designation);
                formData.append(`articles[${index}][unit_price_ht]`, String(article.unit_price_ht));
                formData.append(`articles[${index}][quantity]`, String(article.quantity));
                formData.append(`articles[${index}][total_price_ht]`, String(article.total_price_ht));
                formData.append(`articles[${index}][tva_percentage]`, String(article.tva_percentage));
                formData.append(`articles[${index}][product_id]`, String(article.product_id));
                if (article.unit_id != null) formData.append(`articles[${index}][unit_id]`, String(article.unit_id));
                if (article.discount != null) formData.append(`articles[${index}][discount]`, String(article.discount));
            });

            console.log('Create quote request payload', formData);
            const response = await api.post<any>(Api_Endpoints.customerQuote, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            console.log('Create quote request response', response);
            return response.data;
        } catch (error: any) {
            console.error('Create Quote error:', error.response?.data || error.message);
            throw error;
        }
    }

    async createProduct(payload: any): Promise<any> {
        try {
            const body: any = {
                customer_id: String(payload.customer_id),
                designation: payload.designation,
                description: payload.description,
                reference: payload.reference,
                category: payload.category,
                unit_price_ht: String(payload.unit_price_ht),
                tva_percentage: String(payload.tva_percentage),
                quantity: String(payload.quantity),
                total_price_ht: String(payload.total_price_ht),
            };
            if (payload.unit_id != null) body.unit_id = String(payload.unit_id);

            const response = await api.post(
                Api_Endpoints.customerProduct,
                body
            );

            return response.data;
        } catch (error: any) {
            console.error(
                'Create Product error:',
                error.response?.data || error.message
            );
            throw error;
        }
    }

    async updateQuote(id: number, payload: any): Promise<any> {
        try {
            const formData = new FormData();
            formData.append('customer_id', String(payload.customer_id));
            formData.append('client_id', String(payload.client_id));
            formData.append('date', payload.date);
            formData.append('quote_number', payload.quote_number);
            formData.append('payment_method', payload.payment_method);
            formData.append('status', payload.status ?? 'Brouillons');
            if (payload.due_date) formData.append('due_date', payload.due_date);
            formData.append('_method', 'PUT');

            if (payload.document) {
                const file = payload.document;
                formData.append('document', {
                    uri: file.fileCopyUri || file.uri,
                    type: file.type || 'application/pdf',
                    name: file.name || 'quote.pdf',
                } as any);
            }

            payload.articles?.forEach((article: any, index: number) => {
                formData.append(`articles[${index}][designation]`, article.designation);
                formData.append(`articles[${index}][unit_price_ht]`, String(article.unit_price_ht));
                formData.append(`articles[${index}][quantity]`, String(article.quantity));
                formData.append(`articles[${index}][total_price_ht]`, String(article.total_price_ht));
                formData.append(`articles[${index}][tva_percentage]`, String(article.tva_percentage));
                if (article.product_id != null) {
                    formData.append(`articles[${index}][product_id]`, String(article.product_id));
                }
                if (article.unit_id != null) formData.append(`articles[${index}][unit_id]`, String(article.unit_id));
                if (article.discount != null) formData.append(`articles[${index}][discount]`, String(article.discount));
            });

            const response = await api.post<any>(`${Api_Endpoints.customerQuote}/${id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            return response.data;
        } catch (error: any) {
            console.error('Update Quote error:', error.response?.data || error.message);
            throw error;
        }
    }

    async deleteQuote(id: number) {
        try {
            const response = await api.delete(`${Api_Endpoints.customerQuote}/${id}`)
            return response.data;
        } catch (error: any) {
            console.error('Quote delete error:', error.response?.data || error.message);
            throw error;
        }
    }

    async convertToInvoice(id: number): Promise<any> {
        try {
            const response = await api.post(`${Api_Endpoints.quoteToInvoice}/${id}`);
            return response.data;
        } catch (error: any) {
            console.error('Convert to invoice error:', error.response?.data || error.message);
            throw error;
        }
    }

    getPdfDownloadUrl(id: number): string {
        const base = (api.defaults.baseURL ?? 'https://simply-compta.com/api/').replace(/\/$/, '');
        return `${base}/customer/customer-quotes/pdf/${id}`;
    }

}

const quoteService = new QuoteService();
export default quoteService;
