import { useCallback } from 'react';
import productService from '../services/productService';

export const useProducts = () => {

    const getProducts = useCallback(async (params?: { like?: string }) => {
        try {
            const response = await productService.getCustomerProducts(params);
            return {
                products: response,
                success: true
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Failed to fetch products.';
            return {
                products: [],
                success: false,
                error: errorMessage
            }
        }
    }, [])

    const getProduct = useCallback(async (id: number) => {
        try {
            const result = await productService.getCustomerProduct(id);
            return {
                product: result,
                success: true
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Failed to fetch product.';
            return {
                product: null,
                success: false,
                error: errorMessage
            }
        }
    }, [])

    const createProduct = useCallback(async (payload: any) => {
        try {
            const response = await productService.createCustomerProduct(payload);
            return {
                data: response,
                success: true
            };
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Failed to create product.';
            return {
                success: false,
                error: errorMessage
            };
        }
    }, []);

    const updateProduct = useCallback(async (id: number, payload: any) => {
        try {
            const response = await productService.updateCustomerProduct(id, payload);
            return {
                data: response,
                success: true
            };
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Failed to update product.';
            return {
                success: false,
                error: errorMessage
            };      
        }            
    }, [])

    const deleteProduct = useCallback(async (id: number) => {
        try {
            await productService.deleteCustomerProduct(id);
            return { success: true };
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Failed to delete product.';
            return { success: false, error: errorMessage };
        }
    }, [])

    return {
        getProducts,
        getProduct,
        createProduct,
        updateProduct,
        deleteProduct,
    }
};
