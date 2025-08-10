// Mock Apple Music service for testing without real Apple Music account

class MockAppleMusicService {
  private isAuthorized = false;
  private currentPlayingSong: string | null = null;

  async initialize(): Promise<boolean> {
    // Simulate initialization delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Mock Apple Music service initialized');
    return true;
  }

  async authorize(): Promise<boolean> {
    // Simulate authorization flow
    await new Promise(resolve => setTimeout(resolve, 500));
    this.isAuthorized = true;
    console.log('Mock Apple Music authorization successful');
    return true;
  }

  async getUserLibrary(offset: number = 0, limit: number = 100) {
    if (!this.isAuthorized) return null;

    // Mock library data
    const mockLibrary = [
      {
        id: 'mock_song_1',
        attributes: {
          name: 'Anti-Hero',
          artistName: 'Taylor Swift',
          albumName: 'Midnights',
          artwork: {
            url: 'https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/h5/8e/b5/h58eb5d7-8f8b-2c2e-7c6f-8b8b8b8b8b8b/886449895496.jpg/{w}x{h}bb.jpg'
          }
        }
      },
      {
        id: 'mock_song_2',
        attributes: {
          name: 'Flowers',
          artistName: 'Miley Cyrus',
          albumName: 'Endless Summer Vacation',
          artwork: {
            url: 'https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/i6/8e/b5/i68eb5d7-8f8b-2c2e-7c6f-8b8b8b8b8b8b/886449895503.jpg/{w}x{h}bb.jpg'
          }
        }
      },
      {
        id: 'mock_song_3',
        attributes: {
          name: 'Unholy',
          artistName: 'Sam Smith & Kim Petras',
          albumName: 'Gloria',
          artwork: {
            url: 'https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/j7/8e/b5/j78eb5d7-8f8b-2c2e-7c6f-8b8b8b8b8b8b/886449895510.jpg/{w}x{h}bb.jpg'
          }
        }
      },
      {
        id: 'mock_song_4',
        attributes: {
          name: 'As It Was',
          artistName: 'Harry Styles',
          albumName: "Harry's House",
          artwork: {
            url: 'https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/g4/8e/b5/g48eb5d7-8f8b-2c2e-7c6f-8b8b8b8b8b8b/886449895489.jpg/{w}x{h}bb.jpg'
          }
        }
      },
      {
        id: 'mock_song_5',
        attributes: {
          name: 'Bad Habit',
          artistName: 'Steve Lacy',
          albumName: 'Gemini Rights',
          artwork: {
            url: 'https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/k5/8e/b5/k58eb5d7-8f8b-2c2e-7c6f-8b8b8b8b8b8b/886449895517.jpg/{w}x{h}bb.jpg'
          }
        }
      },
      {
        id: 'mock_song_6',
        attributes: {
          name: 'About Damn Time',
          artistName: 'Lizzo',
          albumName: 'Special',
          artwork: {
            url: 'https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/l6/8e/b5/l68eb5d7-8f8b-2c2e-7c6f-8b8b8b8b8b8b/886449895524.jpg/{w}x{h}bb.jpg'
          }
        }
      },
      {
        id: 'mock_song_7',
        attributes: {
          name: 'Running Up That Hill',
          artistName: 'Kate Bush',
          albumName: 'Hounds of Love',
          artwork: {
            url: 'https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/m7/8e/b5/m78eb5d7-8f8b-2c2e-7c6f-8b8b8b8b8b8b/886449895531.jpg/{w}x{h}bb.jpg'
          }
        }
      },
      {
        id: 'mock_song_8',
        attributes: {
          name: 'First Class',
          artistName: 'Jack Harlow',
          albumName: 'Come Home the Kids Miss You',
          artwork: {
            url: 'https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/n8/8e/b5/n88eb5d7-8f8b-2c2e-7c6f-8b8b8b8b8b8b/886449895538.jpg/{w}x{h}bb.jpg'
          }
        }
      }
    ];

    // Simulate pagination
    const paginatedData = mockLibrary.slice(offset, offset + limit);
    
    return {
      data: paginatedData,
      meta: {
        total: mockLibrary.length
      }
    };
  }

  async playSong(songId: string): Promise<boolean> {
    if (!this.isAuthorized) return false;

    // Simulate playback
    this.currentPlayingSong = songId;
    console.log(`Mock: Now playing song ${songId}`);
    
    // Simulate a brief delay for "buffering"
    await new Promise(resolve => setTimeout(resolve, 200));
    
    return true;
  }

  getCurrentPlaybackState() {
    return {
      isPlaying: !!this.currentPlayingSong,
      nowPlayingItem: this.currentPlayingSong ? {
        id: this.currentPlayingSong,
        title: 'Mock Song'
      } : null
    };
  }

  getUserId(): string | null {
    return this.isAuthorized ? 'demo_user_123' : null;
  }

  isAppleMusicAuthorized(): boolean {
    return this.isAuthorized;
  }

  // Mock method to simulate subscription check
  hasActiveSubscription(): boolean {
    return true; // Always return true for mock
  }
}

export const mockAppleMusicService = new MockAppleMusicService();