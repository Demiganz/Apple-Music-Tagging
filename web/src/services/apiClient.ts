import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api'; // Change for production

class ApiClient {
  private token: string | null = null;

  constructor() {
    this.loadToken();
  }

  private loadToken() {
    try {
      this.token = localStorage.getItem('auth_token');
    } catch (error) {
      console.error('Failed to load token:', error);
    }
  }

  private saveToken(token: string) {
    this.token = token;
    try {
      localStorage.setItem('auth_token', token);
    } catch (error) {
      console.error('Failed to save token:', error);
    }
  }

  private getHeaders() {
    return {
      'Content-Type': 'application/json',
      ...(this.token && { Authorization: `Bearer ${this.token}` })
    };
  }

  async login(appleMusicId: string, email?: string, displayName?: string) {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/apple-music-login`, {
        appleMusicId,
        email,
        displayName
      });

      const { token, user } = response.data;
      this.saveToken(token);
      return { success: true, user };
    } catch (error: any) {
      console.error('Login failed:', error);
      return { success: false, error: error.response?.data?.error || 'Login failed' };
    }
  }

  async importSongs(songs: any[]) {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/songs/import`,
        { songs },
        { headers: this.getHeaders() }
      );
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error('Import failed:', error);
      return { success: false, error: error.response?.data?.error || 'Import failed' };
    }
  }

  async getSongs(params: { tags?: string; search?: string; page?: number; limit?: number } = {}) {
    try {
      const response = await axios.get(`${API_BASE_URL}/songs`, {
        headers: this.getHeaders(),
        params
      });
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error('Get songs failed:', error);
      return { success: false, error: error.response?.data?.error || 'Failed to fetch songs' };
    }
  }

  async getTags() {
    try {
      const response = await axios.get(`${API_BASE_URL}/tags`, {
        headers: this.getHeaders()
      });
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error('Get tags failed:', error);
      return { success: false, error: error.response?.data?.error || 'Failed to fetch tags' };
    }
  }

  async createTag(name: string, color?: string) {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/tags`,
        { name, color },
        { headers: this.getHeaders() }
      );
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error('Create tag failed:', error);
      return { success: false, error: error.response?.data?.error || 'Failed to create tag' };
    }
  }

  async assignTag(songId: number, tagId: number) {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/tags/assign`,
        { songId, tagId },
        { headers: this.getHeaders() }
      );
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error('Assign tag failed:', error);
      return { success: false, error: error.response?.data?.error || 'Failed to assign tag' };
    }
  }

  async removeTag(songId: number, tagId: number) {
    try {
      const response = await axios.delete(`${API_BASE_URL}/tags/assign`, {
        headers: this.getHeaders(),
        data: { songId, tagId }
      });
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error('Remove tag failed:', error);
      return { success: false, error: error.response?.data?.error || 'Failed to remove tag' };
    }
  }

  async getOrganizedData(type: 'albums' | 'artists') {
    try {
      const response = await axios.get(`${API_BASE_URL}/songs/organize/${type}`, {
        headers: this.getHeaders()
      });
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error(`Get ${type} failed:`, error);
      return { success: false, error: error.response?.data?.error || `Failed to fetch ${type}` };
    }
  }

  async getSongsByCategory(type: 'album' | 'artist', name: string, artist?: string) {
    try {
      const params = artist ? { artist } : {};
      const response = await axios.get(`${API_BASE_URL}/songs/by/${type}/${encodeURIComponent(name)}`, {
        headers: this.getHeaders(),
        params
      });
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error(`Get songs by ${type} failed:`, error);
      return { success: false, error: error.response?.data?.error || `Failed to fetch songs by ${type}` };
    }
  }

  logout() {
    this.token = null;
    try {
      localStorage.removeItem('auth_token');
    } catch (error) {
      console.error('Failed to clear token:', error);
    }
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }
}

export const apiClient = new ApiClient();