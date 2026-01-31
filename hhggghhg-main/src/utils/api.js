const API_URL = 'http://localhost:5000/api';

export const api = {
  async request(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Something went wrong');
    }

    return data;
  },

  // Auth endpoints
  async register(email, password, fullName) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, fullName }),
    });
  },

  async login(email, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  async getMe() {
    return this.request('/auth/me');
  },

  // Property endpoints
  async getProperties() {
    return this.request('/properties');
  },

  async createProperty(propertyData) {
    return this.request('/properties', {
      method: 'POST',
      body: JSON.stringify(propertyData),
    });
  },

  async deleteProperty(id) {
    return this.request(`/properties/${id}`, {
      method: 'DELETE',
    });
  },

  // Tax calculation endpoints
  async getTaxCalculations() {
    return this.request('/tax-calculations');
  },

  async createTaxCalculation(calculationData) {
    return this.request('/tax-calculations', {
      method: 'POST',
      body: JSON.stringify(calculationData),
    });
  },

  // AI endpoints
  async calculateTax(property) {
    return this.request('/ai/calculate-tax', {
      method: 'POST',
      body: JSON.stringify({ property }),
    });
  },

  async taxAssistant(question, properties, taxCalculations) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/ai/tax-assistant`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ question, properties, taxCalculations }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Something went wrong');
    }

    return response;
  },
};
