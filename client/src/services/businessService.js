const API_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';

class BusinessService {
  async getAllBusinesses(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = `${API_URL}/api/businesses${queryString ? `?${queryString}` : ''}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch businesses');
    }
    return response.json();
  }

  async getBusinessById(id) {
    const response = await fetch(`${API_URL}/api/businesses/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch business');
    }
    return response.json();
  }

  async createBusiness(businessData, token) {
    const response = await fetch(`${API_URL}/api/businesses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(businessData)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create business');
    }
    
    return response.json();
  }

  async updateBusiness(id, businessData, token) {
    const response = await fetch(`${API_URL}/api/businesses/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(businessData)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update business');
    }
    
    return response.json();
  }

  async deleteBusiness(id, token) {
    const response = await fetch(`${API_URL}/api/businesses/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete business');
    }
    
    return response.json();
  }

  async getBusinessReviews(businessId, params = {}) {
    const queryString = new URLSearchParams({
      businessId,
      ...params
    }).toString();
    
    const response = await fetch(`${API_URL}/api/reviews?${queryString}`);
    if (!response.ok) {
      throw new Error('Failed to fetch reviews');
    }
    return response.json();
  }

  async createReview(reviewData, token) {
    const response = await fetch(`${API_URL}/api/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(reviewData)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create review');
    }
    
    return response.json();
  }

  async toggleFavorite(businessId, token) {
    const response = await fetch(`${API_URL}/api/businesses/${businessId}/favorite`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to toggle favorite');
    }
    
    return response.json();
  }

  async searchBusinesses(query, filters = {}) {
    const params = {
      search: query,
      ...filters
    };
    
    return this.getAllBusinesses(params);
  }

  async getBusinessesByCategory(category, params = {}) {
    return this.getAllBusinesses({
      category,
      ...params
    });
  }

  async getBusinessesByLocation(location, params = {}) {
    return this.getAllBusinesses({
      location,
      ...params
    });
  }

  async uploadBusinessImages(businessId, images, token) {
    const formData = new FormData();
    images.forEach((image, index) => {
      formData.append('images', image);
    });

    const response = await fetch(`${API_URL}/api/businesses/${businessId}/images`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: formData
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to upload images');
    }
    
    return response.json();
  }
}

export const businessService = new BusinessService();
