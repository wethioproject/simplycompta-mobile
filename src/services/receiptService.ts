import api from '../api';
import { Api_Endpoints } from './endpoints';

export interface ReceiptPayload {
  date: string;
  amount: string | number;
  payment_method: string;
  notes?: string;
  remove_document?: number;
  document?: {
    uri: string;
    name: string;
    type: string;
    fileCopyUri?: string;
  } | null;
}

class ReceiptService {

  async createRevenue(payload: ReceiptPayload): Promise<any> {
    try {
      const formData = new FormData();
      console.log('Creating revenue with payload:', payload);
      formData.append('date', payload.date);
      formData.append('amount', String(payload.amount));
      formData.append('payment_method', payload.payment_method);

      if (payload.notes) {
        formData.append('description', payload.notes);
      }

      if (payload.document) {
        const file = payload.document;
        formData.append('add_receipt', {
          uri: file.fileCopyUri || file.uri,
          type: file.type || 'application/pdf',
          name: file.name || 'receipt.pdf',
        } as any);
      }


      const response = await api.post<any>(Api_Endpoints.customerRevenue, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error: any) {
      console.error('Create revenue error:', error.response?.data || error.message);
      throw error;
    }
  }

  async getRevenues(params?: { month?: number; year?: number }): Promise<any> {
    try {
      const response = await api.get(Api_Endpoints.customerRevenues, { params });
      return response.data;
    } catch (error: any) {
      console.error('Get revenues error:', error.response?.data || error.message);
      throw error;
    }
  }

  async updateRevenue(id: number, payload: ReceiptPayload): Promise<any> {
    try {
      const formData = new FormData();
      formData.append('date', payload.date);
      formData.append('amount', String(payload.amount));
      formData.append('payment_method', payload.payment_method);
      formData.append('_method', 'PUT');
      formData.append('remove_document', String(payload.remove_document ?? 0));

      if (payload.notes) {
        formData.append('description', payload.notes);
      }

      if (payload.document) {
        const file = payload.document;
        formData.append('add_receipt', {
          uri: file.fileCopyUri || file.uri,
          type: file.type || 'application/pdf',
          name: file.name || 'receipt.pdf',
        } as any);
      }

      const response = await api.post<any>(`${Api_Endpoints.customerRevenue}/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error: any) {
      console.error('Update revenue error:', error.response?.data || error.message);
      throw error;
    }
  }

  async deleteRevenue(id: number): Promise<any> {
    try {
      const response = await api.delete(`${Api_Endpoints.customerRevenue}/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Delete revenue error:', error.response?.data || error.message);
      throw error;
    }
  }
}

const receiptService = new ReceiptService();
export default receiptService;
