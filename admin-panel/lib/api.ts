import axios, { AxiosInstance, AxiosResponse } from 'axios';

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  total?: number;
  limit?: number;
  offset?: number;
}

export class ApiClient {
  private _token: string | null = null;
  private _userId: string | null = null;
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
      timeout: 8000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Interceptor to add auth and user headers
    this.client.interceptors.request.use((config) => {
      if (this._token) {
        config.headers.Authorization = `Bearer ${this._token}`;
      }
      if (this._userId) {
        config.headers['X-User-ID'] = this._userId;
      }
      return config;
    });
  }

  get token() {
    return this._token;
  }

  setToken(token: string | null, userId?: string) {
    this._token = token;
    if (userId) this._userId = userId;
  }

  clearToken() {
    this._token = null;
    this._userId = null;
  }

  private async handleRequest<T>(requestFn: () => Promise<AxiosResponse<any>>): Promise<ApiResponse<T>> {
    try {
      const response = await requestFn();
      return response.data as ApiResponse<T>;
    } catch (error: any) {
      if (error.response) {
        const data = error.response.data;
        return { error: data?.error || data?.message || 'An error occurred' };
      }
      return { error: error.message || 'Network error' };
    }
  }

  async register(input: any) {
    return this.handleRequest<any>(() => this.client.post('/auth/register', input));
  }

  async login(email: string, password: string) {
    return this.handleRequest<any>(() => this.client.post('/auth/login', { email, password }));
  }

  async logout() {
    return this.handleRequest<any>(() => this.client.post('/auth/logout'));
  }

  async getProducts(params?: Record<string, string>) {
    return this.handleRequest<any>(() => this.client.get('/catalog/products', { params }));
  }

  async getProduct(slug: string) {
    return this.handleRequest<any>(() => this.client.get(`/catalog/products/${slug}`));
  }

  async getCart() {
    return this.handleRequest<any>(() => this.client.get('/customers/cart'));
  }

  async addToCart(productId: string, quantity: number, customizationData?: Record<string, unknown>) {
    return this.handleRequest<any>(() => this.client.post('/customers/cart/items', { productId, quantity, customizationData }));
  }

  async updateCartItem(itemId: string, quantity: number) {
    return this.handleRequest<any>(() => this.client.patch(`/customers/cart/items/${itemId}`, { quantity }));
  }

  async removeFromCart(itemId: string) {
    return this.handleRequest<any>(() => this.client.delete(`/customers/cart/items/${itemId}`));
  }

  async getOrders(params?: Record<string, string>) {
    return this.handleRequest<any>(() => this.client.get('/orders/orders', { params }));
  }

  async getOrder(orderNumber: string) {
    return this.handleRequest<any>(() => this.client.get(`/orders/orders/${orderNumber}`));
  }

  async trackOrder(orderNumber: string) {
    return this.handleRequest<any>(() => this.client.get(`/orders/track/${orderNumber}`));
  }

  async createOrder(orderData: Record<string, unknown>) {
    return this.handleRequest<any>(() => this.client.post('/orders/orders', orderData));
  }

  async getStripeConfig() {
    return this.handleRequest<any>(() => this.client.get('/payments/stripe/config'));
  }

  async createStripePaymentIntent(deliveryMethod: string) {
    return this.handleRequest<any>(() => this.client.post('/payments/stripe/create-payment-intent', { deliveryMethod }));
  }

  async confirmStripeOrder(data: {
    paymentIntentId: string;
    shippingInfo: Record<string, string>;
    deliveryMethod: string;
    saveInfo?: boolean;
  }) {
    return this.handleRequest<any>(() => this.client.post('/payments/stripe/confirm-order', data));
  }

  async getAddresses() {
    return this.handleRequest<any>(() => this.client.get('/customers/addresses'));
  }

  async createAddress(data: Record<string, unknown>) {
    return this.handleRequest<any>(() => this.client.post('/customers/addresses', data));
  }

  async deleteAddress(addressId: string) {
    return this.handleRequest<any>(() => this.client.delete(`/customers/addresses/${addressId}`));
  }

  async getProfile() {
    return this.handleRequest<any>(() => this.client.get('/customers/profile'));
  }

  async updateProfile(data: Record<string, string>) {
    return this.handleRequest<any>(() => this.client.patch('/customers/profile', data));
  }

  // --- Admin Methods ---

  async getAnalyticsSummary() {
    return this.handleRequest<any>(() => this.client.get('/orders/analytics/summary'));
  }

  async getTopProducts() {
    return this.handleRequest<any>(() => this.client.get('/orders/analytics/top-products'));
  }

  async updateOrderStatus(orderNumber: string, status: string) {
    return this.handleRequest<any>(() => this.client.patch(`/orders/orders/${orderNumber}/status`, { status }));
  }

  async getCoupons() {
    return this.handleRequest<any>(() => this.client.get('/orders/coupons'));
  }

  async createCoupon(data: { code: string; discountType: string; discountValue: number }) {
    return this.handleRequest<any>(() => this.client.post('/orders/coupons', data));
  }

  async getStaff() {
    return this.handleRequest<any>(() => this.client.get('/customers/staff'));
  }

  async inviteStaff(email: string, role: string) {
    return this.handleRequest<any>(() => this.client.post('/auth/invite', { email, role }));
  }
}

export const apiClient = new ApiClient();
