// Mock Apple Music service for testing without real Apple Music account

class MockAppleMusicService {
  private isAuthorized = true; // Auto-authorize for demo
  private currentPlayingSong: string | null = null;

  async initialize(): Promise<boolean> {
    // Simulate initialization delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Mock Apple Music service initialized and auto-authorized');
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
          albumName: 'Midnights'
        }
      },
      {
        id: 'mock_song_2',
        attributes: {
          name: 'Flowers',
          artistName: 'Miley Cyrus',
          albumName: 'Endless Summer Vacation'
        }
      },
      {
        id: 'mock_song_3',
        attributes: {
          name: 'Unholy',
          artistName: 'Sam Smith & Kim Petras',
          albumName: 'Gloria'
        }
      },
      {
        id: 'mock_song_4',
        attributes: {
          name: 'As It Was',
          artistName: 'Harry Styles',
          albumName: "Harry's House"
        }
      },
      {
        id: 'mock_song_5',
        attributes: {
          name: 'Bad Habit',
          artistName: 'Steve Lacy',
          albumName: 'Gemini Rights'
        }
      },
      {
        id: 'mock_song_6',
        attributes: {
          name: 'About Damn Time',
          artistName: 'Lizzo',
          albumName: 'Special'
        }
      },
      {
        id: 'mock_song_7',
        attributes: {
          name: 'Running Up That Hill',
          artistName: 'Kate Bush',
          albumName: 'Hounds of Love'
        }
      },
      {
        id: 'mock_song_8',
        attributes: {
          name: 'First Class',
          artistName: 'Jack Harlow',
          albumName: 'Come Home the Kids Miss You'
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
    console.log(`Mock playSong called with songId: ${songId}, isAuthorized: ${this.isAuthorized}`);
    if (!this.isAuthorized) {
      console.log('Mock service not authorized, returning false');
      return false;
    }

    // Map of song IDs to YouTube video IDs
    const songToYouTubeMap: { [key: string]: string } = {
      // Imported songs (from Apple Music mock library)
      'mock_song_1': 'b1kbLWvqugk', // Anti-Hero - Taylor Swift
      'mock_song_2': 'G7KNmW9a75Y', // Flowers - Miley Cyrus
      'mock_song_3': 'Uq9gPaIzbe8', // Unholy - Sam Smith & Kim Petras
      'mock_song_4': 'H5v3kku4y6Q', // As It Was - Harry Styles
      'mock_song_5': 'kiEGkl5nkDY', // Bad Habit - Steve Lacy
      'mock_song_6': 'nPLV7lGbmT4', // About Damn Time - Lizzo
      'mock_song_7': 'wp43OdtAAkM', // Running Up That Hill - Kate Bush
      'mock_song_8': 'fLb9UrQz7Nc', // First Class - Jack Harlow
      // Pre-loaded songs (from backend mock data)
      'song_1': '4NRXx6U8ABQ', // Blinding Lights - The Weeknd
      'song_2': 'JGwWNGJdvx8', // Shape of You - Ed Sheeran
      'song_3': 'E07s5ZYygMg', // Watermelon Sugar - Harry Styles
      'song_4': 'gNi_6U5Pm_o', // Good 4 U - Olivia Rodrigo
      'song_5': 'TUVcZfQe-Kw', // Levitating - Dua Lipa
      'song_6': '8sIJdYOUkjo', // drivers license - Olivia Rodrigo
      'song_7': 'kTJczUoc26U', // Stay - The Kid LAROI & Justin Bieber
      'song_8': 'UTHLKHL_whs', // Industry Baby - Lil Nas X & Jack Harlow
      'song_9': 'mRD0-GxqHVo', // Heat Waves - Glass Animals
      'song_10': 'H5v3kku4y6Q', // As It Was - Harry Styles
    };

    // Simulate playback
    this.currentPlayingSong = songId;
    
    const youtubeId = songToYouTubeMap[songId];
    if (youtubeId) {
      const youtubeUrl = `https://www.youtube.com/watch?v=${youtubeId}`;
      console.log(`Mock: Opening YouTube video for song ${songId}: ${youtubeUrl}`);
      
      // Open YouTube video in new tab
      window.open(youtubeUrl, '_blank');
    } else {
      console.log(`Mock: No YouTube mapping found for song ${songId}`);
      alert(`Mock playback: Would play song ${songId} (no YouTube mapping available)`);
    }
    
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