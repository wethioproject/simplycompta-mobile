import api from '../api';

interface BankStatementPayload {
    customer_id: string;
    month_year: string;
    statement: any;
}

interface BankStatementResponse {
    message: string;
    data: any;
}

class BankService {


    async getBankStatements(filter?: string) {
        try {
            const url = filter
                ? `/customer/bank-statements?filter=${filter}`
                : '/customer/bank-statements';
            const response = await api.get(url);
            return response.data;
        } catch (error) {
            console.error('Bank statements fetch error:', error);
            throw error;
        }
    }

    async getBankStatement(id: number) {
        try {
            const response = await api.get(`/customer/bank-statement/${id}`)
            return response.data;
        } catch (error: any) {
            console.error('Bank statement fetch error:', error.response?.data || error.message);
            throw error;
        }
    }

    async createBankStatement(payload: BankStatementPayload): Promise<BankStatementResponse> {
        try {
            const formData = new FormData();
            formData.append('customer_id', payload.customer_id);
            formData.append('month_year', payload.month_year);
            
            const file = payload.statement;
            formData.append('statement', {
                uri: file.fileCopyUri || file.uri,
                type: file.type || 'application/pdf',
                name: file.name || 'statement.pdf',
            } as any);

            console.log('formdata101', formData);
            const response = await api.post<BankStatementResponse>('/customer/bank-statement', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            console.log('formdata102', response);
            return response.data;
        } catch (error: any) {
            console.error('Create bank statement error:', error.response?.data || error.message);
            throw error;
        }
    }

    // async getTransaction(id: number) {
    //     try {
    //         const response = await api.get(`/customer/transaction/${id}`);
    //         return response.data;
    //     } catch (error: any) {
    //         console.error('Transaction fetch error:', error.response?.data || error.message);
    //         throw error;
    //     }
    // }

    // async getTransactionResources(): Promise<TransactionResourcesResponse> {
    //     try {
    //         const response = await api.get<TransactionResourcesResponse>('/customer/transaction-resources');
    //         return response.data;
    //     } catch (error: any) {
    //         console.error('Transaction resources error:', error.response?.data || error.message);
    //         throw error;
    //     }
    // }

    // async createTransaction(payload: TransactionPayload): Promise<TransactionResponse> {
    //     try {
    //         const hasFile = payload.payment_receipt && typeof payload.payment_receipt === 'object';

    //         if (hasFile) {
    //             const formData = new FormData();
    //             formData.append('type', payload.type);
    //             formData.append('transaction_date', payload.transaction_date);
    //             formData.append('amount', payload.amount);
    //             formData.append('customer_id', payload.customer_id);
    //             formData.append('account_id', payload.account_id);
    //             formData.append('category_id', payload.category_id);
    //             formData.append('description', payload.description);
    //             formData.append('reference', payload.reference);
    //             const file = payload.payment_receipt;
    //             formData.append('payment_receipt', {
    //                 uri: file.fileCopyUri || file.uri,
    //                 type: file.type || 'image/jpeg',
    //                 name: file.name || 'receipt.jpg',
    //             } as any);
    //             const response = await api.post<TransactionResponse>('/customer/transaction', formData, {
    //                 headers: {
    //                     'Content-Type': 'multipart/form-data',
    //                 },
    //             });
    //             return response.data;
    //         } else {
    //             const response = await api.post<TransactionResponse>('/customer/transaction', payload);
    //             return response.data;
    //         }
    //     } catch (error: any) {
    //         console.error('Create transaction error:', error.response?.data || error.message);
    //         throw error;
    //     }
    // }
}


const bankService = new BankService();
export default bankService;
