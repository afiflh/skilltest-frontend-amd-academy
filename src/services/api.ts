import type {
    LoginRequest,
    LoginResponse,
    ProductsResponse,
    Product,
    CreateProductRequest,
    UpdateProductRequest,
  } from '../types';
  import { getToken } from '../utils/auth';
  
  const BASE_URL = 'https://dummyjson.com';
  
  // Helper function untuk handle response
  const handleResponse = async <T>(response: Response): Promise<T> => {
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(error.message || 'Something went wrong');
    }
    return response.json();
  };
  
  // Helper function untuk headers dengan token
  const getHeaders = (includeAuth = false): HeadersInit => {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (includeAuth) {
      const token = getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }
    
    return headers;
  };
  
  // ========== AUTHENTICATION ==========
  
  export const login = async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(credentials),
    });
    
    return handleResponse<LoginResponse>(response);
  };
  
  // ========== PRODUCTS ==========
  
  export const getProducts = async (
    limit = 30,
    skip = 0
  ): Promise<ProductsResponse> => {
    const response = await fetch(
      `${BASE_URL}/products?limit=${limit}&skip=${skip}`,
      {
        headers: getHeaders(true),
      }
    );
    
    return handleResponse<ProductsResponse>(response);
  };
  
  export const getProduct = async (id: number): Promise<Product> => {
    const response = await fetch(`${BASE_URL}/products/${id}`, {
      headers: getHeaders(true),
    });
    
    return handleResponse<Product>(response);
  };
  
  export const searchProducts = async (query: string): Promise<ProductsResponse> => {
    const response = await fetch(
      `${BASE_URL}/products/search?q=${encodeURIComponent(query)}`,
      {
        headers: getHeaders(true),
      }
    );
    
    return handleResponse<ProductsResponse>(response);
  };
  
  export const createProduct = async (
    product: CreateProductRequest
  ): Promise<Product> => {
    const response = await fetch(`${BASE_URL}/products/add`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(product),
    });
    
    return handleResponse<Product>(response);
  };
  
  export const updateProduct = async (
    product: UpdateProductRequest
  ): Promise<Product> => {
    const response = await fetch(`${BASE_URL}/products/${product.id}`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(product),
    });
    
    return handleResponse<Product>(response);
  };
  
  export const deleteProduct = async (id: number): Promise<{ isDeleted: boolean }> => {
    const response = await fetch(`${BASE_URL}/products/${id}`, {
      method: 'DELETE',
      headers: getHeaders(true),
    });
    
    return handleResponse<{ isDeleted: boolean }>(response);
  };