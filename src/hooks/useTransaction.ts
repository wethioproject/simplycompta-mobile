import { useCallback } from 'react';
import transactionService, { TransactionPayload } from '../services/transactionService';

export const useTransaction = () => {

    const getTransactions = useCallback(async () => {
        try {
            const response = await transactionService.getTransactions();
            return {
                transactions: response.data,
                success: true
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Failed to fetch transactions.';
            return {
                transactions: [],
                success: false,
                error: errorMessage
            };
        }
    }, []);

    const getTransaction = useCallback(async (id: number) => {
        try {
            const response = await transactionService.getTransaction(id);
            return {
                transaction: response.data,
                success: true
            };
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Failed to fetch transaction.';
            return {
                transaction: null,
                success: false,
                error: errorMessage
            };
        }
    }, []);

    const getResources = useCallback(async () => {
        try {
            const response = await transactionService.getTransactionResources();

            return {
                accounts: response.data.accounts,
                categories: response.data.categories,
                success: true
            };
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Failed to fetch resources.';
            return {
                accounts: [],
                categories: [],
                success: false,
                error: errorMessage
            };
        }
    }, []);

    const createTransaction = useCallback(async (payload: TransactionPayload) => {
        try {
            const response = await transactionService.createTransaction(payload);

            return {
                data: response.data,
                message: response.message,
                success: true
            };
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Failed to create transaction.';
            return {
                success: false,
                error: errorMessage
            };
        }
    }, []);

    return {
        getTransactions,
        getTransaction,
        getResources,
        createTransaction,
    };
};
