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