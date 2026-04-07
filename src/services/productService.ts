import api from '../api';
import { Api_Endpoints } from './endpoints';

class ProductService {

    async getCustomerProducts(params?: { like?: string }) {
        try {
            const response = await api.get(Api_Endpoints.customerProducts, { params });
            return response.data;
        } catch (error) {
            console.error('Customer products fetch error:', error);
            throw error;
        }
    }

    async getCustomerProduct(id: number) {
        try {
            const response = await api.get(`${Api_Endpoints.customerProduct}/${id}`)
            return response.data;
        } catch (error: any) {
            console.error('Customer product fetch error:', error.response?.data || error.message);
            throw error;
        }
    }

    async createCustomerProduct(payload: any): Promise<any> {
        try {
            const body = {
                customer_id: String(payload.customer_id),
                designation: payload.designation,
                description: payload.description,
                reference: payload.reference,
                category: payload.category,
                unit_price_ht: String(payload.unit_price_ht),
                tva_percent: String(payload.tva_percent),
                quantity: String(payload.quantity),
                total_price_ht: String(payload.total_price_ht),
            };

            const response = await api.post(
                Api_Endpoints.customerProduct,
                body
            );

            return response.data;
        } catch (error: any) {
            console.error(
                'Create Customer product error:',
                error.response?.data || error.message
            );
            throw error;
        }
    }


    async updateCustomerProduct(id: number, payload: any): Promise<any> {
        try {
            const body = {
                customer_id: String(payload.customer_id),
                designation: payload.designation,
                description: payload.description,
                reference: payload.reference,
                category: payload.category,
                unit_price_ht: String(payload.unit_price_ht),
                tva_percent: String(payload.tva_percent),
                quantity: String(payload.quantity),
                total_price_ht: String(payload.total_price_ht),
            };

            const response = await api.put(
                `${Api_Endpoints.customerProduct}/${id}`,
                body
            );

            return response.data;
        } catch (error: any) {
            console.error(
                'Update Customer Product error:',
                error.response?.data || error.message
            );
            throw error;
        }
    }

    async deleteCustomerProduct(id: number) {
        try {
            const response = await api.delete(`${Api_Endpoints.customerProduct}/${id}`)
            return response.data;
        } catch (error: any) {
            console.error('Customer Product delete error:', error.response?.data || error.message);
            throw error;
        }
    }

}


const productService = new ProductService();
export default productService;

