import api, { TOKEN_KEY } from '../api';
import AsyncStorage from '@react-native-async-storage/async-storage';


export interface Customer {
  id: number;
  customer_id: number;
  name: string;
  email: string;
  tax_number: string | null;
  contact: string;
  avatar: string;
  created_by: number;
  is_active: number;
  is_enable_login: number;
  email_verified_at: string | null;
  billing_name: string;
  billing_country: string;
  billing_state: string;
  billing_city: string;
  billing_phone: string;
  billing_zip: string;
  billing_address: string;
  shipping_name: string;
  shipping_country: string;
  shipping_state: string;
  shipping_city: string;
  shipping_phone: string;
  shipping_zip: string;
  shipping_address: string;
  lang: string;
  balance: string;
  last_login_at: string;
  created_at: string;
  updated_at: string;
}

export interface LoginResponse {
  token: string;
  customer: Customer;
}

export interface LoginCredentials {
  email: string;
  password: string;
}


class AuthService {
  /**
   * Login user with email and password
   * Stores token in AsyncStorage and returns user data
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const response = await api.post<LoginResponse>('/customer/login', credentials);
      const { token, customer } = response.data;

      // Store token in AsyncStorage
      await AsyncStorage.setItem(TOKEN_KEY, token);
      
      // Store customer data in AsyncStorage
      await AsyncStorage.setItem('@customer_data', JSON.stringify(customer));

      return response.data;
    } catch (error: any) {
      console.error('Login error:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Logout user
   * Calls logout API and clears all stored data
   */
  async logout(): Promise<void> {
    try {
      // Call logout API endpoint
      await api.post('/customer/logout');
    } catch (error) {
      console.error('Logout API error:', error);
      // Continue with local cleanup even if API call fails
    } finally {
      // Clear all stored auth data
      await this.clearAuthData();
    }
  }

  /**
   * Get stored token
   */
  async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(TOKEN_KEY);
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  }

  /**
   * Get stored customer data
   */
  async getCustomer(): Promise<Customer | null> {
    try {
      const customerData = await AsyncStorage.getItem('@customer_data');
      return customerData ? JSON.parse(customerData) : null;
    } catch (error) {
      console.error('Error getting customer data:', error);
      return null;
    }
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    const token = await this.getToken();
    return !!token;
  }

  /**
   * Clear all authentication data from storage
   */
  async clearAuthData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([TOKEN_KEY, '@customer_data']);
    } catch (error) {
      console.error('Error clearing auth data:', error);
    }
  }
}


const authService = new AuthService();
export default authService;