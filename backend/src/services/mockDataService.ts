// Mock data service to simulate database operations
interface User {
  id: number;
  apple_music_id: string;
  email: string;
  display_name: string;
  created_at: string;
}

interface Song {
  id: number;
  apple_music_id: string;
  title: string;
  artist: string;
  album: string;
  artwork_url?: string; // Made optional since we're removing artwork
  youtube_id?: string;
  user_id: number;
  created_at: string;
  tags?: string[];
}

interface Tag {
  id: number;
  name: string;
  color: string;
  user_id: number;
  created_at: string;
  song_count?: number;
}

interface SongTag {
  song_id: number;
  tag_id: number;
  created_at: string;
}

class MockDataService {
  private users: User[] = [
    {
      id: 1,
      apple_music_id: 'demo_user_123',
      email: 'demo@example.com',
      display_name: 'Demo User',
      created_at: new Date().toISOString()
    }
  ];

  private songs: Song[] = [
    {
      id: 1,
      apple_music_id: 'song_1',
      title: 'Blinding Lights',
      artist: 'The Weeknd',
      album: 'After Hours',
      youtube_id: '4NRXx6U8ABQ',
      user_id: 1,
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      apple_music_id: 'song_2',
      title: 'Shape of You',
      artist: 'Ed Sheeran',
      album: '÷ (Divide)',
      youtube_id: 'JGwWNGJdvx8',
      user_id: 1,
      created_at: new Date().toISOString()
    },
    {
      id: 3,
      apple_music_id: 'song_3',
      title: 'Watermelon Sugar',
      artist: 'Harry Styles',
      album: 'Fine Line',
      youtube_id: 'E07s5ZYygMg',
      user_id: 1,
      created_at: new Date().toISOString()
    },
    {
      id: 4,
      apple_music_id: 'song_4',
      title: 'Good 4 U',
      artist: 'Olivia Rodrigo',
      album: 'SOUR',
      youtube_id: 'gNi_6U5Pm_o',
      user_id: 1,
      created_at: new Date().toISOString()
    },
    {
      id: 5,
      apple_music_id: 'song_5',
      title: 'Levitating',
      artist: 'Dua Lipa',
      album: 'Future Nostalgia',
      youtube_id: 'TUVcZfQe-Kw',
      user_id: 1,
      created_at: new Date().toISOString()
    },
    {
      id: 6,
      apple_music_id: 'song_6',
      title: 'drivers license',
      artist: 'Olivia Rodrigo',
      album: 'SOUR',
      youtube_id: '8sIJdYOUkjo',
      user_id: 1,
      created_at: new Date().toISOString()
    },
    {
      id: 7,
      apple_music_id: 'song_7',
      title: 'Stay',
      artist: 'The Kid LAROI & Justin Bieber',
      album: 'F*CK LOVE 3: OVER YOU',
      youtube_id: 'kTJczUoc26U',
      user_id: 1,
      created_at: new Date().toISOString()
    },
    {
      id: 8,
      apple_music_id: 'song_8',
      title: 'Industry Baby',
      artist: 'Lil Nas X & Jack Harlow',
      album: 'MONTERO',
      youtube_id: 'UTHLKHL_whs',
      user_id: 1,
      created_at: new Date().toISOString()
    },
    {
      id: 9,
      apple_music_id: 'song_9',
      title: 'Heat Waves',
      artist: 'Glass Animals',
      album: 'Dreamland',
      youtube_id: 'mRD0-GxqHVo',
      user_id: 1,
      created_at: new Date().toISOString()
    },
    {
      id: 10,
      apple_music_id: 'song_10',
      title: 'As It Was',
      artist: 'Harry Styles',
      album: "Harry's House",
      youtube_id: 'H5v3kku4y6Q',
      user_id: 1,
      created_at: new Date().toISOString()
    }
  ];

  private tags: Tag[] = [
    {
      id: 1,
      name: 'Pop',
      color: '#FF6B6B',
      user_id: 1,
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      name: 'Favorites',
      color: '#4ECDC4',
      user_id: 1,
      created_at: new Date().toISOString()
    },
    {
      id: 3,
      name: 'Workout',
      color: '#45B7D1',
      user_id: 1,
      created_at: new Date().toISOString()
    },
    {
      id: 4,
      name: 'Chill',
      color: '#96CEB4',
      user_id: 1,
      created_at: new Date().toISOString()
    },
    {
      id: 5,
      name: 'Road Trip',
      color: '#FECA57',
      user_id: 1,
      created_at: new Date().toISOString()
    }
  ];

  private songTags: SongTag[] = [
    { song_id: 1, tag_id: 1, created_at: new Date().toISOString() }, // Blinding Lights - Pop
    { song_id: 1, tag_id: 2, created_at: new Date().toISOString() }, // Blinding Lights - Favorites
    { song_id: 2, tag_id: 1, created_at: new Date().toISOString() }, // Shape of You - Pop
    { song_id: 2, tag_id: 3, created_at: new Date().toISOString() }, // Shape of You - Workout
    { song_id: 3, tag_id: 1, created_at: new Date().toISOString() }, // Watermelon Sugar - Pop
    { song_id: 3, tag_id: 4, created_at: new Date().toISOString() }, // Watermelon Sugar - Chill
    { song_id: 4, tag_id: 1, created_at: new Date().toISOString() }, // Good 4 U - Pop
    { song_id: 4, tag_id: 2, created_at: new Date().toISOString() }, // Good 4 U - Favorites
    { song_id: 5, tag_id: 1, created_at: new Date().toISOString() }, // Levitating - Pop
    { song_id: 5, tag_id: 3, created_at: new Date().toISOString() }, // Levitating - Workout
    { song_id: 5, tag_id: 5, created_at: new Date().toISOString() }, // Levitating - Road Trip
    { song_id: 7, tag_id: 2, created_at: new Date().toISOString() }, // Stay - Favorites
    { song_id: 8, tag_id: 3, created_at: new Date().toISOString() }, // Industry Baby - Workout
    { song_id: 9, tag_id: 4, created_at: new Date().toISOString() }, // Heat Waves - Chill
    { song_id: 10, tag_id: 2, created_at: new Date().toISOString() }, // As It Was - Favorites
    { song_id: 10, tag_id: 4, created_at: new Date().toISOString() }  // As It Was - Chill
  ];

  private nextUserId = 2;
  private nextSongId = 11;
  private nextTagId = 6;

  // User methods
  async findUserByAppleMusicId(appleMusicId: string): Promise<User | null> {
    return this.users.find(user => user.apple_music_id === appleMusicId) || null;
  }

  async createUser(appleMusicId: string, email?: string, displayName?: string): Promise<User> {
    const user: User = {
      id: this.nextUserId++,
      apple_music_id: appleMusicId,
      email: email || '',
      display_name: displayName || 'User',
      created_at: new Date().toISOString()
    };
    this.users.push(user);
    return user;
  }

  // Song methods
  async importSongs(songs: any[], userId: number): Promise<void> {
    for (const song of songs) {
      const existingSong = this.songs.find(s => 
        s.apple_music_id === song.id && s.user_id === userId
      );
      
      if (!existingSong) {
        const newSong: Song = {
          id: this.nextSongId++,
          apple_music_id: song.id,
          title: song.attributes?.name || song.title || 'Unknown Title',
          artist: song.attributes?.artistName || song.artist || 'Unknown Artist',
          album: song.attributes?.albumName || song.album || 'Unknown Album',
          artwork_url: song.attributes?.artwork?.url || song.artwork_url || '',
          user_id: userId,
          created_at: new Date().toISOString()
        };
        this.songs.push(newSong);
      }
    }
  }

  async getSongs(userId: number, options: {
    search?: string;
    tags?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<{ songs: Song[]; hasMore: boolean }> {
    const { search, tags, page = 1, limit = 50 } = options;
    
    let filteredSongs = this.songs.filter(song => song.user_id === userId);

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filteredSongs = filteredSongs.filter(song =>
        song.title.toLowerCase().includes(searchLower) ||
        song.artist.toLowerCase().includes(searchLower)
      );
    }

    // Apply tag filter (AND logic - songs must have ALL selected tags)
    if (tags) {
      const tagArray = tags.split(',');
      
      filteredSongs = filteredSongs.filter(song => {
        // Get all tag names for this song
        const songTagIds = this.songTags
          .filter(st => st.song_id === song.id)
          .map(st => st.tag_id);
        
        const songTagNames = this.tags
          .filter(tag => songTagIds.includes(tag.id))
          .map(tag => tag.name);
        
        // Check if song has ALL required tags
        return tagArray.every(requiredTag => songTagNames.includes(requiredTag));
      });
    }

    // Add tags to songs
    const songsWithTags = filteredSongs.map(song => {
      const songTagIds = this.songTags
        .filter(st => st.song_id === song.id)
        .map(st => st.tag_id);
      
      const songTags = this.tags
        .filter(tag => songTagIds.includes(tag.id))
        .map(tag => tag.name);

      return { ...song, tags: songTags };
    });

    // Pagination
    const offset = (page - 1) * limit;
    const paginatedSongs = songsWithTags.slice(offset, offset + limit);
    
    return {
      songs: paginatedSongs,
      hasMore: paginatedSongs.length === limit
    };
  }

  // Tag methods
  async getTags(userId: number): Promise<Tag[]> {
    const userTags = this.tags.filter(tag => tag.user_id === userId);
    
    return userTags.map(tag => {
      const songCount = this.songTags.filter(st => st.tag_id === tag.id).length;
      return { ...tag, song_count: songCount };
    });
  }

  async createTag(name: string, color: string, userId: number): Promise<Tag> {
    // Check for duplicate
    const existingTag = this.tags.find(tag => 
      tag.name.toLowerCase() === name.toLowerCase() && tag.user_id === userId
    );
    
    if (existingTag) {
      throw new Error('Tag name already exists');
    }

    const tag: Tag = {
      id: this.nextTagId++,
      name,
      color,
      user_id: userId,
      created_at: new Date().toISOString()
    };
    
    this.tags.push(tag);
    return tag;
  }

  async assignTag(songId: number, tagId: number, userId: number): Promise<void> {
    // Verify song and tag belong to user
    const song = this.songs.find(s => s.id === songId && s.user_id === userId);
    const tag = this.tags.find(t => t.id === tagId && t.user_id === userId);
    
    if (!song || !tag) {
      throw new Error('Song or tag not found');
    }

    // Check if already assigned
    const existing = this.songTags.find(st => 
      st.song_id === songId && st.tag_id === tagId
    );
    
    if (!existing) {
      this.songTags.push({
        song_id: songId,
        tag_id: tagId,
        created_at: new Date().toISOString()
      });
    }
  }

  async removeTag(songId: number, tagId: number, userId: number): Promise<void> {
    // Verify ownership through song and tag
    const song = this.songs.find(s => s.id === songId && s.user_id === userId);
    const tag = this.tags.find(t => t.id === tagId && t.user_id === userId);
    
    if (song && tag) {
      this.songTags = this.songTags.filter(st => 
        !(st.song_id === songId && st.tag_id === tagId)
      );
    }
  }

  // Organization methods
  async getOrganizedData(userId: number, type: 'albums' | 'artists'): Promise<any[]> {
    const userSongs = this.songs.filter(song => song.user_id === userId);
    
    if (type === 'albums') {
      const albumsMap = new Map<string, any>();
      
      userSongs.forEach(song => {
        const albumKey = `${song.album}_${song.artist}`;
        if (!albumsMap.has(albumKey)) {
          albumsMap.set(albumKey, {
            name: song.album,
            artist: song.artist,
            song_count: 0,
            artwork_urls: []
          });
        }
        const album = albumsMap.get(albumKey)!;
        album.song_count++;
        if (song.artwork_url && !album.artwork_urls.includes(song.artwork_url)) {
          album.artwork_urls.push(song.artwork_url);
        }
      });
      
      return Array.from(albumsMap.values()).sort((a, b) => a.name.localeCompare(b.name));
    } else if (type === 'artists') {
      const artistsMap = new Map<string, any>();
      
      userSongs.forEach(song => {
        if (!artistsMap.has(song.artist)) {
          artistsMap.set(song.artist, {
            name: song.artist,
            song_count: 0,
            artwork_urls: []
          });
        }
        const artist = artistsMap.get(song.artist)!;
        artist.song_count++;
        if (song.artwork_url && !artist.artwork_urls.includes(song.artwork_url)) {
          artist.artwork_urls.push(song.artwork_url);
        }
      });
      
      return Array.from(artistsMap.values()).sort((a, b) => a.name.localeCompare(b.name));
    }
    
    return [];
  }

  async getSongsByCategory(userId: number, type: 'album' | 'artist', name: string, artist?: string): Promise<Song[]> {
    let filteredSongs = this.songs.filter(song => song.user_id === userId);
    
    if (type === 'album') {
      filteredSongs = filteredSongs.filter(song => song.album === name);
      if (artist) {
        filteredSongs = filteredSongs.filter(song => song.artist === artist);
      }
      // Sort by title since we don't have track numbers
      filteredSongs.sort((a, b) => a.title.localeCompare(b.title));
    } else if (type === 'artist') {
      filteredSongs = filteredSongs.filter(song => song.artist === name);
      // Sort by album, then title
      filteredSongs.sort((a, b) => {
        const albumCompare = a.album.localeCompare(b.album);
        return albumCompare !== 0 ? albumCompare : a.title.localeCompare(b.title);
      });
    }

    // Add tags to songs
    return filteredSongs.map(song => {
      const songTagIds = this.songTags
        .filter(st => st.song_id === song.id)
        .map(st => st.tag_id);
      
      const songTags = this.tags
        .filter(tag => songTagIds.includes(tag.id))
        .map(tag => tag.name);

      return { ...song, tags: songTags };
    });
  }

  // Mock Apple Music library data
  getMockAppleMusicLibrary(): any[] {
    return [
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
      }
    ];
  }
}

export const mockDataService = new MockDataService();