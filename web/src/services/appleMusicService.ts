import { mockAppleMusicService } from './mockAppleMusicService';

declare global {
  interface Window {
    MusicKit: any;
  }
}

class AppleMusicService {
  private musicKit: any = null;
  private useMockData = true; // Set to false when you have real Apple Music credentials

  async initialize(): Promise<boolean> {
    if (this.useMockData) {
      return await mockAppleMusicService.initialize();
    }

    try {
      if (typeof window === 'undefined' || !window.MusicKit) {
        console.error('MusicKit not available');
        return false;
      }

      await window.MusicKit.configure({
        developerToken: 'YOUR_APPLE_DEVELOPER_TOKEN', // Generate this from Apple
        app: {
          name: 'Apple Music Tagger',
          build: '1.0.0'
        }
      });

      this.musicKit = window.MusicKit.getInstance();
      return true;
    } catch (error) {
      console.error('MusicKit initialization failed:', error);
      return false;
    }
  }

  async authorize(): Promise<boolean> {
    if (this.useMockData) {
      return await mockAppleMusicService.authorize();
    }

    if (!this.musicKit) return false;
    
    try {
      await this.musicKit.authorize();
      return this.musicKit.isAuthorized;
    } catch (error) {
      console.error('Apple Music authorization failed:', error);
      return false;
    }
  }

  async getUserLibrary(offset: number = 0, limit: number = 100) {
    if (this.useMockData) {
      return await mockAppleMusicService.getUserLibrary(offset, limit);
    }

    if (!this.musicKit?.isAuthorized) return null;

    try {
      const response = await this.musicKit.api.library.songs(null, {
        offset,
        limit,
        include: 'albums,artists'
      });
      return response;
    } catch (error) {
      console.error('Failed to fetch user library:', error);
      return null;
    }
  }

  async playSong(songId: string) {
    if (this.useMockData) {
      return await mockAppleMusicService.playSong(songId);
    }

    if (!this.musicKit?.isAuthorized) return false;

    try {
      await this.musicKit.setQueue({ song: songId });
      await this.musicKit.play();
      return true;
    } catch (error) {
      console.error('Failed to play song:', error);
      return false;
    }
  }

  getCurrentPlaybackState() {
    if (this.useMockData) {
      return mockAppleMusicService.getCurrentPlaybackState();
    }
    return this.musicKit?.player || null;
  }

  getUserId(): string | null {
    if (this.useMockData) {
      return mockAppleMusicService.getUserId();
    }
    return this.musicKit?.isAuthorized ? this.musicKit.api.storefrontId : null;
  }

  isAuthorized(): boolean {
    if (this.useMockData) {
      return mockAppleMusicService.isAppleMusicAuthorized();
    }
    return this.musicKit?.isAuthorized || false;
  }
}

export const appleMusicService = new AppleMusicService();