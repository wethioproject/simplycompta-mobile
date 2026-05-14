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


export interface CheckEmailResponse {
  exists: boolean;
  message?: string;
}

export interface VerifyOtpResponse {
  success: boolean;
  message?: string;
}

export interface RegisterPayload {
  first_name: string;
  last_name?: string;
  email: string;
  contact: string;
  password: string;
  company_type: string;
  billing_name: string;
  billing_city: string;
  billing_address?: string;
  billing_zip?: string;
  website?: string;
  ice_number?: string;
  patent_number?: string;
  rc_number?: string;
  cnss?: string;
  if_number?: string;
  rib?: string;
  vat_number?: string;
  avatar?: { uri: string; name: string; type: string };
  signature?: { uri: string; name: string; type: string };
}

class AuthService {
  /**
   * Check if a customer email already exists
   */
  async checkEmail(email: string): Promise<CheckEmailResponse> {
    try {
      const response = await api.post<CheckEmailResponse>('/customer/check-email', { email });
      return response.data;
    } catch (error: any) {
      console.error('Check email error:', error.response?.data || error.message);
      throw error;
    }
  }

  async verifyOtp(email: string, otp: string): Promise<VerifyOtpResponse> {
    try {
      const response = await api.post<VerifyOtpResponse>('/customer/verify-otp', { email, otp });
      return response.data;
    } catch (error: any) {
      console.error('Verify OTP error:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Register a new customer (multipart for file uploads)
   */
  async register(payload: RegisterPayload): Promise<LoginResponse> {
    try {
      const formData = new FormData();

      formData.append('first_name', payload.first_name);
      formData.append('email', payload.email);
      formData.append('contact', payload.contact);
      formData.append('password', payload.password);
      formData.append('company_type', payload.company_type);
      formData.append('billing_name', payload.billing_name);
      formData.append('billing_city', payload.billing_city);

      if (payload.last_name)     formData.append('last_name', payload.last_name);
      if (payload.billing_address) formData.append('billing_address', payload.billing_address);
      if (payload.billing_zip)   formData.append('billing_zip', payload.billing_zip);
      if (payload.website)       formData.append('website', payload.website);
      if (payload.ice_number)    formData.append('ice_number', payload.ice_number);
      if (payload.patent_number) formData.append('patent_number', payload.patent_number);
      if (payload.rc_number)     formData.append('rc_number', payload.rc_number);
      if (payload.cnss)          formData.append('cnss', payload.cnss);
      if (payload.if_number)     formData.append('if_number', payload.if_number);
      if (payload.rib)           formData.append('rib', payload.rib);
      if (payload.vat_number)    formData.append('vat_number', payload.vat_number);

      if (payload.avatar) {
        formData.append('avatar', payload.avatar as any);
      }
      if (payload.signature) {
        formData.append('signature', payload.signature as any);
      }
      console.log('Registering with formData:', formData);
      const response = await api.post<LoginResponse>('/customer/register', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const { token, customer } = response.data;
      await AsyncStorage.setItem(TOKEN_KEY, token);
      await AsyncStorage.setItem('@customer_data', JSON.stringify(customer));

      return response.data;
    } catch (error: any) {
      console.error('Register error:', error.response?.data || error.message);
      throw error;
    }
  }

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

  async resetPassword(current_password: string, new_password: string, new_password_confirmation: string): Promise<void> {
    try {
      const response = await api.post('/customer/reset-password', {
        current_password,
        new_password,
        new_password_confirmation
      })

      return response.data;
    } catch (error: any) {
      console.error('Reset password error:', error.response?.data || error.message);
      throw error;
    }
  }

  async forgotPassword(email: string): Promise<any> {
    try {
      const response = await api.post('/customer/forgot-password', { email })
      return response.data;
    } catch (error: any) {
      console.error('Forgot password error:', error.response?.data || error.message);
      throw error;
    }
  }

  async forgotPasswordOtp(email: string, otp: string, password: string, password_confirmation: string): Promise<void> {
    try {
      const response = await api.post('/customer/forgot-password-otp', {
        email,
        otp,
        password,
        password_confirmation
      })
      return response.data;
    } catch (error: any) {
      console.error('Forgot password OTP error:', error.response?.data || error.message);
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