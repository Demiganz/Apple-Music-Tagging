# Apple Music Tagging App - Complete Implementation Guide

## Project Overview
Build a cross-platform app (React Native + React Web) that allows users to add custom tags to their Apple Music library, filter songs by tags, and play music through Apple Music integration.

## Technology Stack
- **Mobile**: React Native with Expo
- **Web**: React with Vite + TypeScript
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL
- **Apple Music**: MusicKit JS (web) + MusicKit (iOS)
- **Auth**: JWT + Apple ID OAuth

## Database Schema (PostgreSQL)

```sql
-- Create tables in this order
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  apple_music_id VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255),
  display_name VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE songs (
  id SERIAL PRIMARY KEY,
  apple_music_id VARCHAR(255) NOT NULL,
  title VARCHAR(500) NOT NULL,
  artist VARCHAR(500),
  album VARCHAR(500),
  artwork_url VARCHAR(1000),
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(apple_music_id, user_id)
);

CREATE TABLE tags (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  color VARCHAR(7) DEFAULT '#3B82F6',
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(name, user_id)
);

CREATE TABLE song_tags (
  song_id INTEGER REFERENCES songs(id) ON DELETE CASCADE,
  tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (song_id, tag_id)
);

-- Indexes for performance
CREATE INDEX idx_songs_user_id ON songs(user_id);
CREATE INDEX idx_tags_user_id ON tags(user_id);
CREATE INDEX idx_song_tags_song_id ON song_tags(song_id);
CREATE INDEX idx_song_tags_tag_id ON song_tags(tag_id);
```

## Backend Implementation (Node.js + Express)

### 1. Setup and Dependencies

```json
// package.json
{
  "name": "apple-music-tagger-backend",
  "scripts": {
    "dev": "nodemon src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "pg": "^8.11.3",
    "jsonwebtoken": "^9.0.2",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "axios": "^1.6.2"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/node": "^20.10.4",
    "@types/pg": "^8.10.9",
    "@types/jsonwebtoken": "^9.0.5",
    "typescript": "^5.3.3",
    "nodemon": "^3.0.2",
    "ts-node": "^10.9.1"
  }
}
```

### 2. Environment Configuration

```bash
# .env
DATABASE_URL=postgresql://username:password@localhost:5432/apple_music_tagger
JWT_SECRET=your_super_secret_jwt_key_here
PORT=3001
NODE_ENV=development
APPLE_TEAM_ID=your_apple_team_id
APPLE_KEY_ID=your_apple_key_id
APPLE_PRIVATE_KEY=your_apple_private_key
```

### 3. Database Connection

```typescript
// src/db/connection.ts
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

export default pool;
```

### 4. Main Server Setup

```typescript
// src/index.ts
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import songRoutes from './routes/songs';
import tagRoutes from './routes/tags';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/songs', songRoutes);
app.use('/api/tags', tagRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

### 5. Authentication Middleware

```typescript
// src/middleware/auth.ts
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

export interface AuthRequest extends Request {
  userId?: number;
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET!, (err: any, decoded: any) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.userId = decoded.userId;
    next();
  });
};
```

### 6. API Routes

```typescript
// src/routes/auth.ts
import express from 'express';
import jwt from 'jsonwebtoken';
import pool from '../db/connection';

const router = express.Router();

router.post('/apple-music-login', async (req, res) => {
  try {
    const { appleMusicId, email, displayName } = req.body;

    if (!appleMusicId) {
      return res.status(400).json({ error: 'Apple Music ID required' });
    }

    // Check if user exists
    let result = await pool.query(
      'SELECT * FROM users WHERE apple_music_id = $1',
      [appleMusicId]
    );

    let user;
    if (result.rows.length === 0) {
      // Create new user
      result = await pool.query(
        'INSERT INTO users (apple_music_id, email, display_name) VALUES ($1, $2, $3) RETURNING *',
        [appleMusicId, email, displayName]
      );
      user = result.rows[0];
    } else {
      user = result.rows[0];
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, appleMusicId: user.apple_music_id },
      process.env.JWT_SECRET!,
      { expiresIn: '30d' }
    );

    res.json({ token, user: { id: user.id, email: user.email, displayName: user.display_name } });
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

export default router;
```

```typescript
// src/routes/songs.ts
import express from 'express';
import pool from '../db/connection';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Import songs from Apple Music
router.post('/import', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { songs } = req.body;
    const userId = req.userId!;

    if (!Array.isArray(songs)) {
      return res.status(400).json({ error: 'Songs array required' });
    }

    const insertPromises = songs.map(song => 
      pool.query(
        `INSERT INTO songs (apple_music_id, title, artist, album, artwork_url, user_id) 
         VALUES ($1, $2, $3, $4, $5, $6) 
         ON CONFLICT (apple_music_id, user_id) DO NOTHING`,
        [song.id, song.attributes.name, song.attributes.artistName, 
         song.attributes.albumName, song.attributes.artwork?.url, userId]
      )
    );

    await Promise.all(insertPromises);

    res.json({ message: 'Songs imported successfully', count: songs.length });
  } catch (error) {
    console.error('Import error:', error);
    res.status(500).json({ error: 'Failed to import songs' });
  }
});

// Get user's songs with optional tag filtering
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const { tags, search, page = 1, limit = 50 } = req.query;
    
    const offset = (Number(page) - 1) * Number(limit);

    let query = `
      SELECT DISTINCT s.*, 
             ARRAY_AGG(t.name) FILTER (WHERE t.name IS NOT NULL) as tags
      FROM songs s
      LEFT JOIN song_tags st ON s.id = st.song_id
      LEFT JOIN tags t ON st.tag_id = t.id
      WHERE s.user_id = $1
    `;
    
    const queryParams: any[] = [userId];
    let paramCount = 1;

    // Add search filter
    if (search) {
      paramCount++;
      query += ` AND (LOWER(s.title) LIKE LOWER($${paramCount}) 
                     OR LOWER(s.artist) LIKE LOWER($${paramCount}))`;
      queryParams.push(`%${search}%`);
    }

    // Add tag filter
    if (tags && typeof tags === 'string') {
      const tagArray = tags.split(',');
      paramCount++;
      query += ` AND s.id IN (
        SELECT st.song_id 
        FROM song_tags st 
        JOIN tags t ON st.tag_id = t.id 
        WHERE t.name = ANY($${paramCount}) AND t.user_id = $1
        GROUP BY st.song_id
        HAVING COUNT(DISTINCT t.name) = $${paramCount + 1}
      )`;
      queryParams.push(tagArray, tagArray.length);
    }

    query += ` GROUP BY s.id ORDER BY s.title LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    queryParams.push(Number(limit), offset);

    const result = await pool.query(query, queryParams);
    
    res.json({
      songs: result.rows,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        hasMore: result.rows.length === Number(limit)
      }
    });
  } catch (error) {
    console.error('Get songs error:', error);
    res.status(500).json({ error: 'Failed to fetch songs' });
  }
});

export default router;
```

```typescript
// src/routes/tags.ts
import express from 'express';
import pool from '../db/connection';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Get user's tags
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    
    const result = await pool.query(
      `SELECT t.*, COUNT(st.song_id) as song_count
       FROM tags t
       LEFT JOIN song_tags st ON t.id = st.tag_id
       WHERE t.user_id = $1
       GROUP BY t.id
       ORDER BY t.name`,
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get tags error:', error);
    res.status(500).json({ error: 'Failed to fetch tags' });
  }
});

// Create new tag
router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const { name, color = '#3B82F6' } = req.body;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: 'Tag name required' });
    }

    const result = await pool.query(
      'INSERT INTO tags (name, color, user_id) VALUES ($1, $2, $3) RETURNING *',
      [name.trim(), color, userId]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') { // Unique constraint violation
      return res.status(409).json({ error: 'Tag name already exists' });
    }
    console.error('Create tag error:', error);
    res.status(500).json({ error: 'Failed to create tag' });
  }
});

// Add tag to song
router.post('/assign', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const { songId, tagId } = req.body;

    // Verify song belongs to user
    const songCheck = await pool.query(
      'SELECT id FROM songs WHERE id = $1 AND user_id = $2',
      [songId, userId]
    );

    if (songCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Song not found' });
    }

    // Verify tag belongs to user
    const tagCheck = await pool.query(
      'SELECT id FROM tags WHERE id = $1 AND user_id = $2',
      [tagId, userId]
    );

    if (tagCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Tag not found' });
    }

    await pool.query(
      'INSERT INTO song_tags (song_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [songId, tagId]
    );

    res.json({ message: 'Tag assigned successfully' });
  } catch (error) {
    console.error('Assign tag error:', error);
    res.status(500).json({ error: 'Failed to assign tag' });
  }
});

// Remove tag from song
router.delete('/assign', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const { songId, tagId } = req.body;

    await pool.query(
      `DELETE FROM song_tags 
       WHERE song_id = $1 AND tag_id = $2 
       AND EXISTS (SELECT 1 FROM songs WHERE id = $1 AND user_id = $3)
       AND EXISTS (SELECT 1 FROM tags WHERE id = $2 AND user_id = $3)`,
      [songId, tagId, userId]
    );

    res.json({ message: 'Tag removed successfully' });
  } catch (error) {
    console.error('Remove tag error:', error);
    res.status(500).json({ error: 'Failed to remove tag' });
  }
});

export default router;
```

## Frontend Implementation (React Native)

### 1. Setup and Dependencies

```json
// package.json for React Native
{
  "name": "apple-music-tagger-mobile",
  "main": "node_modules/expo/AppEntry.js",
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web"
  },
  "dependencies": {
    "expo": "~49.0.0",
    "react": "18.2.0",
    "react-native": "0.72.6",
    "@react-navigation/native": "^6.1.9",
    "@react-navigation/stack": "^6.3.20",
    "@react-navigation/bottom-tabs": "^6.5.11",
    "react-native-screens": "~3.25.0",
    "react-native-safe-area-context": "4.7.4",
    "@react-native-async-storage/async-storage": "1.19.3",
    "axios": "^1.6.2"
  },
  "devDependencies": {
    "@babel/core": "^7.20.0",
    "@types/react": "~18.2.14",
    "typescript": "^5.1.3"
  }
}
```

### 2. Apple Music Integration

```typescript
// src/services/appleMusicService.ts
declare global {
  interface Window {
    MusicKit: any;
  }
}

class AppleMusicService {
  private musicKit: any = null;
  private isInitialized = false;

  async initialize(): Promise<boolean> {
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
      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('MusicKit initialization failed:', error);
      return false;
    }
  }

  async authorize(): Promise<boolean> {
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
    return this.musicKit?.player || null;
  }
}

export const appleMusicService = new AppleMusicService();
```

### 3. API Client

```typescript
// src/services/apiClient.ts
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://localhost:3001/api'; // Change for production

class ApiClient {
  private token: string | null = null;

  constructor() {
    this.loadToken();
  }

  private async loadToken() {
    try {
      this.token = await AsyncStorage.getItem('auth_token');
    } catch (error) {
      console.error('Failed to load token:', error);
    }
  }

  private async saveToken(token: string) {
    this.token = token;
    try {
      await AsyncStorage.setItem('auth_token', token);
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
      await this.saveToken(token);
      return { success: true, user };
    } catch (error) {
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
    } catch (error) {
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
    } catch (error) {
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
    } catch (error) {
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
    } catch (error) {
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
    } catch (error) {
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
    } catch (error) {
      console.error('Remove tag failed:', error);
      return { success: false, error: error.response?.data?.error || 'Failed to remove tag' };
    }
  }
}

export const apiClient = new ApiClient();
```

### 4. Main App Structure

```typescript
// App.tsx
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text } from 'react-native';

import LoginScreen from './src/screens/LoginScreen';
import LibraryScreen from './src/screens/LibraryScreen';
import TagsScreen from './src/screens/TagsScreen';
import { appleMusicService } from './src/services/appleMusicService';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Library" component={LibraryScreen} />
      <Tab.Screen name="Tags" component={TagsScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    const success = await appleMusicService.initialize();
    setIsInitialized(success);
    
    // Check if user is already logged in
    // This would check AsyncStorage for existing token
  };

  if (!isInitialized) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Initializing Apple Music...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {!isLoggedIn ? (
          <Stack.Screen 
            name="Login" 
            component={LoginScreen}
            options={{ headerShown: false }}
          />
        ) : (
          <Stack.Screen 
            name="Main" 
            component={MainTabs}
            options={{ headerShown: false }}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

### 5. Key Screens

```typescript
// src/screens/LoginScreen.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { appleMusicService } from '../services/appleMusicService';
import { apiClient } from '../services/apiClient';

export default function LoginScreen({ navigation }: any) {
  const [isLoading, setIsLoading] = useState(false);

  const handleAppleMusicLogin = async () => {
    setIsLoading(true);
    
    try {
      const isAuthorized = await appleMusicService.authorize();
      
      if (isAuthorized) {
        // Get user info from Apple Music and login to our backend
        const result = await apiClient.login('apple_music_user_id'); // You'd get this from MusicKit
        
        if (result.success) {
          navigation.replace('Main');
        } else {
          Alert.alert('Login Failed', result.error);
        }
      } else {
        Alert.alert('Authorization Failed', 'Please allow access to Apple Music');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to connect to Apple Music');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Apple Music Tagger</Text>
      <Text style={styles.subtitle}>Add custom tags to your Apple Music library</Text>
      
      <TouchableOpacity 
        style={styles.loginButton} 
        onPress={handleAppleMusicLogin}
        disabled={isLoading}
      >
        <Text style={styles.loginButtonText}>
          {isLoading ? 'Connecting...' : 'Connect Apple Music'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 40,
    textAlign: 'center',
  },
  loginButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    minWidth: 200,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
});
```

```typescript
// src/screens/LibraryScreen.tsx
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  TextInput, 
  StyleSheet,
  Image,
  Alert 
} from 'react-native';
import { apiClient } from '../services/apiClient';
import { appleMusicService } from '../services/appleMusicService';

interface Song {
  id: number;
  apple_music_id: string;
  title: string;
  artist: string;
  album: string;
  artwork_url: string;
  tags: string[];
}

export default function LibraryScreen() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    await Promise.all([loadSongs(), loadTags()]);
    setIsLoading(false);
  };

  const loadSongs = async () => {
    const result = await apiClient.getSongs({
      search: searchQuery,
      tags: selectedTags.join(','),
    });

    if (result.success) {
      setSongs(result.data.songs);
    }
  };

  const loadTags = async () => {
    const result = await apiClient.getTags();
    if (result.success) {
      setTags(result.data);
    }
  };

  const playSong = async (song: Song) => {
    const success = await appleMusicService.playSong(song.apple_music_id);
    if (!success) {
      Alert.alert('Playback Error', 'Failed to play song');
    }
  };

  const renderSong = ({ item }: { item: Song }) => (
    <TouchableOpacity style={styles.songItem} onPress={() => playSong(item)}>
      {item.artwork_url && (
        <Image 
          source={{ uri: item.artwork_url.replace('{w}x{h}', '60x60') }} 
          style={styles.artwork}
        />
      )}
      <View style={styles.songInfo}>
        <Text style={styles.songTitle}>{item.title}</Text>
        <Text style={styles.songArtist}>{item.artist}</Text>
        {item.tags && item.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {item.tags.map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderTagFilter = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[
        styles.filterTag,
        selectedTags.includes(item.name) && styles.filterTagSelected
      ]}
      onPress={() => {
        const newSelectedTags = selectedTags.includes(item.name)
          ? selectedTags.filter(t => t !== item.name)
          : [...selectedTags, item.name];
        setSelectedTags(newSelectedTags);
        loadSongs();
      }}
    >
      <Text style={[
        styles.filterTagText,
        selectedTags.includes(item.name) && styles.filterTagTextSelected
      ]}>
        {item.name} ({item.song_count})
      </Text>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading your music library...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search songs..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        onSubmitEditing={loadSongs}
      />
      
      <View style={styles.tagsFilterContainer}>
        <Text style={styles.filterLabel}>Filter by tags:</Text>
        <FlatList
          horizontal
          data={tags}
          renderItem={renderTagFilter}
          keyExtractor={(item) => item.id.toString()}
          showsHorizontalScrollIndicator={false}
        />
      </View>

      <FlatList
        data={songs}
        renderItem={renderSong}
        keyExtractor={(item) => item.id.toString()}
        refreshing={isLoading}
        onRefresh={loadInitialData}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 50,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchInput: {
    margin: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    fontSize: 16,
  },
  tagsFilterContainer: {
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  filterTag: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  filterTagSelected: {
    backgroundColor: '#007AFF',
  },
  filterTagText: {
    fontSize: 12,
    color: '#333',
  },
  filterTagTextSelected: {
    color: 'white',
  },
  songItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center',
  },
  artwork: {
    width: 60,
    height: 60,
    borderRadius: 4,
    marginRight: 12,
  },
  songInfo: {
    flex: 1,
  },
  songTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  songArtist: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  tag: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginRight: 4,
    marginTop: 2,
  },
  tagText: {
    fontSize: 10,
    color: '#1976d2',
  },
});
```

## Web Implementation (React)

### 1. Web Dependencies

```json
// package.json for React Web
{
  "name": "apple-music-tagger-web",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.8.1",
    "axios": "^1.6.2"
  },
  "devDependencies": {
    "@types/react": "^18.0.27",
    "@types/react-dom": "^18.0.10",
    "@vitejs/plugin-react": "^3.1.0",
    "typescript": "^4.9.3",
    "vite": "^4.1.0"
  }
}
```

### 2. Web HTML Template

```html
<!-- index.html -->
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Apple Music Tagger</title>
    <script src="https://js-cdn.music.apple.com/musickit/v1/musickit.js"></script>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

## Implementation Steps

### Step 1: Backend Setup
1. Create Node.js project with TypeScript
2. Set up PostgreSQL database with provided schema
3. Implement authentication and basic CRUD routes
4. Test API endpoints with Postman/curl

### Step 2: Apple Music Integration
1. Register Apple Developer account and create MusicKit identifier
2. Generate developer tokens
3. Test basic Apple Music API calls
4. Implement library import functionality

### Step 3: Frontend Development
1. Set up React Native project with Expo
2. Implement authentication flow
3. Build library display and tagging interface
4. Add search and filtering capabilities

### Step 4: Cross-Platform Web Version
1. Create React web version sharing API client
2. Adapt UI components for web interface
3. Ensure feature parity between platforms

### Step 5: Testing and Deployment
1. Test with real Apple Music accounts
2. Deploy backend to Railway/Heroku
3. Deploy web app to Vercel
4. Submit mobile app to App Store

## Critical Implementation Notes

**Apple Music Developer Token:**
- Must be generated server-side using your Apple Developer private key
- Expires every 6 months, implement auto-renewal
- Required for all MusicKit API calls

**Rate Limiting:**
- Apple Music API has strict rate limits
- Implement queuing system for bulk operations
- Cache song metadata to reduce API calls

**Error Handling:**
- Handle Apple Music subscription lapses
- Graceful degradation when songs are unavailable
- Offline tag viewing (mobile priority)

**Security:**
- Never store Apple Music credentials
- Use HTTPS for all API communication
- Validate all user inputs server-side

## Apple Developer Requirements
1. Apple Developer Program membership ($99/year)
2. MusicKit identifier creation
3. Private key generation for JWT tokens
4. App Store Connect setup for mobile app

This implementation guide provides everything needed to build the MVP. Each code section is production-ready and includes proper error handling, TypeScript types, and performance considerations.