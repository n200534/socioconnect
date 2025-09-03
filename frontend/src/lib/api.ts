/**
 * API client for communicating with the FastAPI backend
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface User {
  id: number;
  email: string;
  username: string;
  full_name: string;
  bio?: string;
  location?: string;
  website?: string;
  avatar_url?: string;
  is_private: boolean;
  is_active: boolean;
  created_at: string;
  followers_count: number;
  following_count: number;
}

export interface Post {
  id: number;
  content: string;
  author_id: number;
  parent_id?: number;
  media_url?: string;
  media_type?: string;
  is_reply: boolean;
  created_at: string;
  updated_at: string;
  likes_count: number;
  comments_count: number;
  reposts_count: number;
  author: User;
  is_liked?: boolean;
  is_reposted?: boolean;
}

export interface PostCreate {
  content: string;
  parent_id?: number;
  media_url?: string;
  media_type?: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  username: string;
  full_name: string;
  password: string;
  bio?: string;
  location?: string;
  website?: string;
  is_private?: boolean;
}

class ApiClient {
  private baseURL: string;
  private accessToken: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    // Load token from localStorage on initialization
    if (typeof window !== 'undefined') {
      this.accessToken = localStorage.getItem('access_token');
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Add authorization header if token exists
    if (this.accessToken) {
      headers.Authorization = `Bearer ${this.accessToken}`;
    }

    try {
      console.log(`Making request to: ${url}`);
      console.log('Request headers:', headers);
      console.log('Request options:', options);

      const response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include', // Include credentials for CORS
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      let data;
      try {
        const responseText = await response.text();
        console.log('Raw response text:', responseText);
        console.log('Response status:', response.status);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));
        
        if (responseText.trim() === '') {
          data = { detail: `Empty response from server (${response.status})` };
        } else {
          data = JSON.parse(responseText);
        }
        
        // Handle empty object responses
        if (data && typeof data === 'object' && Object.keys(data).length === 0) {
          data = { detail: `Empty response object from server (${response.status})` };
        }
      } catch (e) {
        console.error('Failed to parse response:', e);
        data = { detail: `HTTP ${response.status}: ${response.statusText}` };
      }

      // Check for successful status codes (200-299)
      if (response.status < 200 || response.status >= 300) {
        console.error('API Error:', data);
        
        // Handle different error formats
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        
        if (data.detail) {
          if (Array.isArray(data.detail)) {
            // Handle validation errors array
            errorMessage = data.detail.map((err: any) => err.msg || err.message || 'Validation error').join(', ');
          } else if (typeof data.detail === 'string') {
            errorMessage = data.detail;
          }
        } else if (data.message) {
          errorMessage = data.message;
        }
        
        return {
          error: errorMessage,
        };
      }

      return { data };
    } catch (error) {
      console.error('Network Error:', error);
      return {
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // Authentication methods
  async login(credentials: LoginCredentials): Promise<ApiResponse<AuthTokens>> {
    const response = await this.request<AuthTokens>('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (response.data) {
      this.setAccessToken(response.data.access_token);
    }

    return response;
  }

  async register(userData: RegisterData): Promise<ApiResponse<AuthTokens>> {
    const response = await this.request<AuthTokens>('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    if (response.data) {
      this.setAccessToken(response.data.access_token);
    }

    return response;
  }

  async refreshToken(): Promise<ApiResponse<AuthTokens>> {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      return { error: 'No refresh token available' };
    }

    const response = await this.request<AuthTokens>('/api/v1/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (response.data) {
      this.setAccessToken(response.data.access_token);
    }

    return response;
  }

  async getCurrentUser(): Promise<ApiResponse<User>> {
    return this.request<User>('/api/v1/auth/me');
  }

  async logout(): Promise<ApiResponse<{ message: string }>> {
    const response = await this.request<{ message: string }>('/api/v1/auth/logout', {
      method: 'POST',
    });

    this.clearTokens();
    return response;
  }

  // Post methods
  async getPosts(page = 1, size = 20): Promise<ApiResponse<{ posts: Post[]; total: number; page: number; size: number; has_next: boolean; has_prev: boolean }>> {
    // Try public endpoint first to test if authentication is the issue
    return this.request(`/api/v1/posts/public?page=${page}&size=${size}`);
  }

  async getPost(postId: number): Promise<ApiResponse<Post>> {
    return this.request<Post>(`/api/v1/posts/${postId}`);
  }

  async testPostsEndpoint(): Promise<ApiResponse<any>> {
    return this.request(`/api/v1/posts/test`);
  }

  async createPost(postData: PostCreate): Promise<ApiResponse<Post>> {
    return this.request<Post>('/api/v1/posts/', {
      method: 'POST',
      body: JSON.stringify(postData),
    });
  }

  async getUserPosts(userId: number, page = 1, size = 20): Promise<ApiResponse<{ posts: Post[]; total: number; page: number; size: number; has_next: boolean; has_prev: boolean }>> {
    return this.request(`/api/v1/posts/user/${userId}?page=${page}&size=${size}`);
  }

  // Interaction methods
  async likePost(postId: number): Promise<ApiResponse<{ message: string; liked: boolean }>> {
    return this.request(`/api/v1/interactions/posts/${postId}/like`, {
      method: 'POST',
    });
  }

  async repost(postId: number): Promise<ApiResponse<{ message: string; reposted: boolean }>> {
    return this.request(`/api/v1/interactions/posts/${postId}/repost`, {
      method: 'POST',
    });
  }

  async followUser(userId: number): Promise<ApiResponse<{ message: string; following: boolean }>> {
    return this.request(`/api/v1/interactions/users/${userId}/follow`, {
      method: 'POST',
    });
  }

  // Token management
  setAccessToken(token: string): void {
    this.accessToken = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', token);
    }
  }

  setRefreshToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('refresh_token', token);
    }
  }

  setTokens(accessToken: string, refreshToken: string): void {
    this.setAccessToken(accessToken);
    this.setRefreshToken(refreshToken);
  }

  clearTokens(): void {
    this.accessToken = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
  }

  isAuthenticated(): boolean {
    return !!this.accessToken;
  }
}

// Create and export a singleton instance
export const apiClient = new ApiClient(API_BASE_URL);
