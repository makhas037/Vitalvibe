import apiClient from '../../api/clients/apiClient';

class BaseService {
  constructor(endpoint, cacheKey) {
    this.endpoint = endpoint;
    this.cacheKey = cacheKey;
  }

  async getAll(options = {}) {
    return apiClient.get(this.endpoint, {
      useCache: true,
      cacheKey: this.cacheKey,
      ...options
    });
  }

  async getById(id, options = {}) {
    return apiClient.get(`${this.endpoint}/${id}`, {
      useCache: true,
      cacheKey: `${this.cacheKey}_${id}`,
      ...options
    });
  }

  async create(data, options = {}) {
    const response = await apiClient.post(this.endpoint, data, { useCache: false, ...options });
    apiClient.clearCache(this.cacheKey);
    return response;
  }

  async update(id, data, options = {}) {
    const response = await apiClient.put(`${this.endpoint}/${id}`, data, { useCache: false, ...options });
    apiClient.clearCache(this.cacheKey);
    apiClient.clearCache(`${this.cacheKey}_${id}`);
    return response;
  }

  async delete(id, options = {}) {
    const response = await apiClient.delete(`${this.endpoint}/${id}`, { useCache: false, ...options });
    apiClient.clearCache(this.cacheKey);
    apiClient.clearCache(`${this.cacheKey}_${id}`);
    return response;
  }

  clearCache(id = null) {
    if (id) {
      apiClient.clearCache(`${this.cacheKey}_${id}`);
    } else {
      apiClient.clearCache(this.cacheKey);
    }
  }
}

export default BaseService;
