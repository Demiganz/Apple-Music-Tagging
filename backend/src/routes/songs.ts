import express from 'express';
import pool from '../db/connection';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { mockDataService } from '../services/mockDataService';

const router = express.Router();

// Import songs from Apple Music
router.post('/import', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { songs } = req.body;
    const userId = req.userId!;

    if (!Array.isArray(songs)) {
      return res.status(400).json({ error: 'Songs array required' });
    }

    const useMockData = process.env.USE_MOCK_DATA === 'true' || !process.env.DATABASE_URL;

    if (useMockData) {
      // Use mock data service
      await mockDataService.importSongs(songs, userId);
    } else {
      // Original database logic
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
    }

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
    
    const useMockData = process.env.USE_MOCK_DATA === 'true' || !process.env.DATABASE_URL;

    if (useMockData) {
      // Use mock data service
      const result = await mockDataService.getSongs(userId, {
        search: search as string,
        tags: tags as string,
        page: Number(page),
        limit: Number(limit)
      });

      res.json({
        songs: result.songs,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          hasMore: result.hasMore
        }
      });
    } else {
      // Original database logic
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
        paramCount++;
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
    }
  } catch (error) {
    console.error('Get songs error:', error);
    res.status(500).json({ error: 'Failed to fetch songs' });
  }
});

// Get organized lists (albums, artists)
router.get('/organize/:type', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const { type } = req.params;
    
    const useMockData = process.env.USE_MOCK_DATA === 'true' || !process.env.DATABASE_URL;

    if (useMockData) {
      // Use mock data service
      const result = await mockDataService.getOrganizedData(userId, type as 'albums' | 'artists');
      res.json(result);
    } else {
      // Original database logic
      let query: string;
      let orderBy: string;
      
      if (type === 'albums') {
        query = `
          SELECT DISTINCT album as name, artist, COUNT(*) as song_count,
                 ARRAY_AGG(DISTINCT artwork_url) FILTER (WHERE artwork_url IS NOT NULL) as artwork_urls
          FROM songs 
          WHERE user_id = $1 AND album IS NOT NULL AND album != ''
          GROUP BY album, artist
        `;
        orderBy = ' ORDER BY album';
      } else if (type === 'artists') {
        query = `
          SELECT DISTINCT artist as name, COUNT(*) as song_count,
                 ARRAY_AGG(DISTINCT artwork_url) FILTER (WHERE artwork_url IS NOT NULL) as artwork_urls
          FROM songs 
          WHERE user_id = $1 AND artist IS NOT NULL AND artist != ''
          GROUP BY artist
        `;
        orderBy = ' ORDER BY artist';
      } else {
        return res.status(400).json({ error: 'Invalid organization type. Use "albums" or "artists"' });
      }

      const result = await pool.query(query + orderBy, [userId]);
      res.json(result.rows);
    }
  } catch (error) {
    console.error('Get organized data error:', error);
    res.status(500).json({ error: 'Failed to fetch organized data' });
  }
});

// Get songs by album or artist
router.get('/by/:type/:name', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const { type, name } = req.params;
    const { artist } = req.query; // For album filtering by specific artist
    
    const useMockData = process.env.USE_MOCK_DATA === 'true' || !process.env.DATABASE_URL;

    if (useMockData) {
      // Use mock data service
      const result = await mockDataService.getSongsByCategory(userId, type as 'album' | 'artist', decodeURIComponent(name), artist as string);
      res.json({ songs: result });
    } else {
      // Original database logic
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

      if (type === 'album') {
        paramCount++;
        query += ` AND s.album = $${paramCount}`;
        queryParams.push(decodeURIComponent(name));
        
        if (artist) {
          paramCount++;
          query += ` AND s.artist = $${paramCount}`;
          queryParams.push(decodeURIComponent(artist as string));
        }
        
        query += ` GROUP BY s.id ORDER BY s.title`; // Could be track order if we had that data
      } else if (type === 'artist') {
        paramCount++;
        query += ` AND s.artist = $${paramCount}`;
        queryParams.push(decodeURIComponent(name));
        query += ` GROUP BY s.id ORDER BY s.album, s.title`;
      } else {
        return res.status(400).json({ error: 'Invalid type. Use "album" or "artist"' });
      }

      const result = await pool.query(query, queryParams);
      res.json({ songs: result.rows });
    }
  } catch (error) {
    console.error('Get songs by category error:', error);
    res.status(500).json({ error: 'Failed to fetch songs by category' });
  }
});

export default router;