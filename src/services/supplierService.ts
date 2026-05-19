import api from '../api';
import { Api_Endpoints } from './endpoints';

export interface SupplierPayload {
  company_name: string;
  supplier_name?: string;
  email?: string;
  telephone?: string;
  postal_code?: string;
  city?: string;
  commercial_register?: string;
  ice_number?: string;
  if_number?: string;
  cnss_number?: string;
  billing_address?: string;
}

class SupplierService {

  async getSuppliers(params?: { like?: string }) {
    try {
      const response = await api.get(Api_Endpoints.customerSuppliers, { params });
      return response.data;
    } catch (error: any) {
      console.error('Suppliers fetch error:', error.response?.data || error.message);
      throw error;
    }
  }

  async getSupplierById(id: number) {
    try {
      const response = await api.get(`${Api_Endpoints.customerSupplier}/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Supplier fetch error:', error.response?.data || error.message);
      throw error;
    }
  }

  async createSupplier(payload: SupplierPayload) {
    try {
      const response = await api.post(Api_Endpoints.customerSupplier, payload);
      return response.data;
    } catch (error: any) {
      console.error('Create supplier error:', error.response?.data || error.message);
      throw error;
    }
  }

  async updateSupplier(id: number, payload: SupplierPayload) {
    try {
      const response = await api.put(`${Api_Endpoints.customerSupplier}/${id}`, payload);
      return response.data;
    } catch (error: any) {
      console.error('Update supplier error:', error.response?.data || error.message);
      throw error;
    }
  }

  async deleteSupplier(id: number) {
    try {
      const response = await api.delete(`${Api_Endpoints.customerSupplier}/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Delete supplier error:', error.response?.data || error.message);
      throw error;
    }
  }

  async getSupplierExpenses(id: number) {
    try {
      const response = await api.get(`${Api_Endpoints.customerSupplierExpenses}/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Supplier expenses fetch error:', error.response?.data || error.message);
      throw error;
    }
  }
}

const supplierService = new SupplierService();
export default supplierService;
