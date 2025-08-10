import express from 'express';
import jwt from 'jsonwebtoken';
import pool from '../db/connection';
import { mockDataService } from '../services/mockDataService';

const router = express.Router();

router.post('/apple-music-login', async (req, res) => {
  try {
    const { appleMusicId, email, displayName } = req.body;

    if (!appleMusicId) {
      return res.status(400).json({ error: 'Apple Music ID required' });
    }

    // Use mock data service instead of database
    const useMockData = process.env.USE_MOCK_DATA === 'true' || !process.env.DATABASE_URL;
    
    let user;
    
    if (useMockData) {
      // Check if user exists in mock data
      user = await mockDataService.findUserByAppleMusicId(appleMusicId);
      
      if (!user) {
        // Create new user in mock data
        user = await mockDataService.createUser(appleMusicId, email, displayName);
      }
    } else {
      // Original database logic
      let result = await pool.query(
        'SELECT * FROM users WHERE apple_music_id = $1',
        [appleMusicId]
      );

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
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, appleMusicId: user.apple_music_id },
      process.env.JWT_SECRET || 'mock_jwt_secret',
      { expiresIn: '30d' }
    );

    res.json({ 
      token, 
      user: { 
        id: user.id, 
        email: user.email, 
        displayName: user.display_name 
      } 
    });
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

export default router;