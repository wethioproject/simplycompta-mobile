import api from '../api';


export interface Account {
    id: number;
    name: string;
}

export interface Category {
    id: number;
    name: string;
}

export interface TransactionResourcesResponse {
    status: string;
    data: {
        accounts: Account[];
        categories: Category[];
    };
}

export interface TransactionPayload {
    type: 'expense' | 'income';
    transaction_date: string;
    amount: string;
    customer_id: string;
    account_id: string;
    category_id: string;
    description: string;
    reference: string;
    payment_receipt?: any;
}

export interface TransactionResponse {
    status: string;
    message: string;
    data?: any;
}


class TransactionService {


    async getTransactions() {
        try {
            const response = await api.get('/customer/transactions');
            return response.data;
        } catch (error) {
            console.error('Transactions fetch error:', error);
            throw error;
        }
    }

    async getTransaction(id: number) {
        try {
            const response = await api.get(`/customer/transaction/${id}`);
            return response.data;
        } catch (error: any) {
            console.error('Transaction fetch error:', error.response?.data || error.message);
            throw error;
        }
    }

    async getTransactionResources(): Promise<TransactionResourcesResponse> {
        try {
            const response = await api.get<TransactionResourcesResponse>('/customer/transaction-resources');
            return response.data;
        } catch (error: any) {
            console.error('Transaction resources error:', error.response?.data || error.message);
            throw error;
        }
    }

    async createTransaction(payload: TransactionPayload): Promise<TransactionResponse> {
        try {
            const hasFile = payload.payment_receipt && typeof payload.payment_receipt === 'object';

            if (hasFile) {
                const formData = new FormData();
                formData.append('type', payload.type);
                formData.append('transaction_date', payload.transaction_date);
                formData.append('amount', payload.amount);
                formData.append('customer_id', payload.customer_id);
                formData.append('account_id', payload.account_id);
                formData.append('category_id', payload.category_id);
                formData.append('description', payload.description);
                formData.append('reference', payload.reference);
                const file = payload.payment_receipt;
                formData.append('payment_receipt', {
                    uri: file.fileCopyUri || file.uri,
                    type: file.type || 'image/jpeg',
                    name: file.name || 'receipt.jpg',
                } as any);
                const response = await api.post<TransactionResponse>('/customer/transaction', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
                return response.data;
            } else {
                const response = await api.post<TransactionResponse>('/customer/transaction', payload);
                return response.data;
            }
        } catch (error: any) {
            console.error('Create transaction error:', error.response?.data || error.message);
            throw error;
        }
    }
}


const transactionService = new TransactionService();
export default transactionService;
