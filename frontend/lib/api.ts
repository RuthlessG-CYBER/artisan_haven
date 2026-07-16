const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

export class ApiClient {
  private baseUrl: string;
  private _token: string | null = null;
  private _userId: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
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

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this._token) {
      headers['Authorization'] = `Bearer ${this._token}`;
    }

    if (this._userId) {
      headers['x-user-id'] = this._userId;
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
      });

      const text = await response.text();
      let data: any;
      try {
        data = JSON.parse(text);
      } catch {
        return { error: text || `HTTP error! status: ${response.status}` };
      }

      if (!response.ok) {
        return { error: data?.error || data?.message || `HTTP error! status: ${response.status}` };
      }

      return { data: data?.data ?? data };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'An error occurred' };
    }
  }

  async register(input: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    password: string;
  }) {
    return this.request<{ user: { id: string; email: string; firstName: string; lastName: string; phone?: string }; token: string }>(
      '/auth/register',
      { method: 'POST', body: JSON.stringify(input) }
    );
  }

  async login(email: string, password: string) {
    return this.request<{ user: { id: string; email: string; firstName: string; lastName: string; phone?: string }; token: string }>(
      '/auth/login',
      { method: 'POST', body: JSON.stringify({ email, password }) }
    );
  }

  async logout() {
    return this.request<void>('/auth/logout', { method: 'POST' });
  }

  async getProducts(params?: Record<string, string>) {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request<Array<Record<string, unknown>>>(`/catalog/products${qs}`);
  }

  async getProduct(slug: string) {
    return this.request<Record<string, unknown>>(`/catalog/products/${slug}`);
  }

  async getCart() {
    return this.request<Array<Record<string, unknown>>>('/customers/cart');
  }

  async addToCart(productId: string, quantity: number, customizationData?: Record<string, unknown>) {
    return this.request<{ message: string }>('/customers/cart/items', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity, customizationData }),
    });
  }

  async updateCartItem(itemId: string, quantity: number) {
    return this.request<{ message: string }>(`/customers/cart/items/${itemId}`, {
      method: 'PATCH',
      body: JSON.stringify({ quantity }),
    });
  }

  async removeFromCart(itemId: string) {
    return this.request<{ message: string }>(`/customers/cart/items/${itemId}`, {
      method: 'DELETE',
    });
  }

  async getOrders(params?: Record<string, string>) {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request<Array<Record<string, unknown>>>(`/orders/orders${qs}`);
  }

  async getOrder(orderNumber: string) {
    return this.request<Record<string, unknown>>(`/orders/orders/${orderNumber}`);
  }

  async trackOrder(orderNumber: string) {
    return this.request<Record<string, unknown>>(`/orders/track/${orderNumber}`);
  }

  async createOrder(orderData: Record<string, unknown>) {
    return this.request<{ orderNumber: string; totalAmount: number; status: string }>('/orders/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  async getStripeConfig() {
    return this.request<{ publishableKey: string }>('/payments/stripe/config');
  }

  async createStripePaymentIntent(deliveryMethod: string) {
    return this.request<{ clientSecret: string; amount: number }>(
      '/payments/stripe/create-payment-intent',
      { method: 'POST', body: JSON.stringify({ deliveryMethod }) }
    );
  }

  async confirmStripeOrder(data: {
    paymentIntentId: string;
    shippingInfo: Record<string, string>;
    deliveryMethod: string;
    saveInfo?: boolean;
  }) {
    return this.request<{ orderNumber: string; totalAmount: number; status: string }>(
      '/payments/stripe/confirm-order',
      { method: 'POST', body: JSON.stringify(data) }
    );
  }

  async getAddresses() {
    return this.request<Array<Record<string, unknown>>>('/customers/addresses');
  }

  async createAddress(data: Record<string, unknown>) {
    return this.request<Record<string, unknown>>('/customers/addresses', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteAddress(addressId: string) {
    return this.request<{ message: string }>(`/customers/addresses/${addressId}`, {
      method: 'DELETE',
    });
  }

  async getProfile() {
    return this.request<Record<string, unknown>>('/customers/profile');
  }

  async updateProfile(data: Record<string, string>) {
    return this.request<{ message: string }>('/customers/profile', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
