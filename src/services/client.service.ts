import api from '../api';
import { Api_Endpoints } from './endpoints';
import { ClientFormValues } from '../types/client.types';

export const getClients = async (): Promise<any[]> => {
  const res = await api.get(Api_Endpoints.customerClients);
  return res.data?.data ?? [];
};

export const searchClients = async (query: string): Promise<any[]> => {
  const res = await api.get(Api_Endpoints.customerClientsSearch, {
    params: { like: query },
  });
  return res.data?.data ?? [];
};

export const createClient = async (data: ClientFormValues) => {
  return api.post(Api_Endpoints.createCustomerClient, {
    company_name: data.companyName,
    client_name: data.clientName,
    email: data.email,
    telephone: data.telephone ?? '',
    postal_code: data.postalCode ?? '',
    city: data.city ?? '',
    commercial_register: data.commercialRegister ?? '',
    ice: data.ice ?? '',
    customer_type: data.customerType ?? 'Company',
    notes: data.notes ?? '',
  });
};

export const updateClient = async (
  id: number,
  data: {
    company_name: string;
    client_name: string;
    email: string;
    telephone: string;
    postal_code: string;
    city: string;
    commercial_register: string;
    ice: string;
  },
) => {
  return api.post(`${Api_Endpoints.createCustomerClient}/${id}`, {
    _method: 'PUT',
    ...data,
  });
};

export const deleteClient = async (id: number) => {
  return api.delete(`${Api_Endpoints.createCustomerClient}/${id}`);
};

export const getClientDetails = async (id: number) => {
  return api.get(`${Api_Endpoints.customerClient}/${id}`);
};

export const getClientInvoices = async (clientId: number) => {
  return api.get(`${Api_Endpoints.customerClientInvoice}/${clientId}`);
};

export const getInvoiceDetail = async (id: number) => {
  return api.get(`${Api_Endpoints.customerInvoice}/${id}`);
};
