import express from 'express';
import pool from '../db/connection';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { mockDataService } from '../services/mockDataService';

const router = express.Router();

// Get user's tags
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const useMockData = process.env.USE_MOCK_DATA === 'true' || !process.env.DATABASE_URL;
    
    if (useMockData) {
      // Use mock data service
      const tags = await mockDataService.getTags(userId);
      res.json(tags);
    } else {
      // Original database logic
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
    }
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

    const useMockData = process.env.USE_MOCK_DATA === 'true' || !process.env.DATABASE_URL;

    if (useMockData) {
      // Use mock data service
      try {
        const tag = await mockDataService.createTag(name.trim(), color, userId);
        res.status(201).json(tag);
      } catch (mockError: any) {
        if (mockError.message === 'Tag name already exists') {
          return res.status(409).json({ error: 'Tag name already exists' });
        }
        throw mockError;
      }
    } else {
      // Original database logic
      const result = await pool.query(
        'INSERT INTO tags (name, color, user_id) VALUES ($1, $2, $3) RETURNING *',
        [name.trim(), color, userId]
      );
      res.status(201).json(result.rows[0]);
    }
  } catch (error: any) {
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
    const useMockData = process.env.USE_MOCK_DATA === 'true' || !process.env.DATABASE_URL;

    if (useMockData) {
      // Use mock data service
      try {
        await mockDataService.assignTag(songId, tagId, userId);
        res.json({ message: 'Tag assigned successfully' });
      } catch (mockError: any) {
        if (mockError.message === 'Song or tag not found') {
          return res.status(404).json({ error: mockError.message });
        }
        throw mockError;
      }
    } else {
      // Original database logic
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
    }
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
    const useMockData = process.env.USE_MOCK_DATA === 'true' || !process.env.DATABASE_URL;

    if (useMockData) {
      // Use mock data service
      await mockDataService.removeTag(songId, tagId, userId);
      res.json({ message: 'Tag removed successfully' });
    } else {
      // Original database logic
      await pool.query(
        `DELETE FROM song_tags 
         WHERE song_id = $1 AND tag_id = $2 
         AND EXISTS (SELECT 1 FROM songs WHERE id = $1 AND user_id = $3)
         AND EXISTS (SELECT 1 FROM tags WHERE id = $2 AND user_id = $3)`,
        [songId, tagId, userId]
      );
      res.json({ message: 'Tag removed successfully' });
    }
  } catch (error) {
    console.error('Remove tag error:', error);
    res.status(500).json({ error: 'Failed to remove tag' });
  }
});

// Update tag order
router.put('/order', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const { tagIds } = req.body;

    if (!Array.isArray(tagIds)) {
      return res.status(400).json({ error: 'tagIds must be an array' });
    }

    const useMockData = process.env.USE_MOCK_DATA === 'true' || !process.env.DATABASE_URL;

    if (useMockData) {
      // Use mock data service
      await mockDataService.updateTagOrder(tagIds, userId);
      res.json({ message: 'Tag order updated successfully' });
    } else {
      // Original database logic - update order_index for each tag
      const updatePromises = tagIds.map((tagId, index) => 
        pool.query(
          'UPDATE tags SET order_index = $1 WHERE id = $2 AND user_id = $3',
          [index, tagId, userId]
        )
      );

      await Promise.all(updatePromises);
      res.json({ message: 'Tag order updated successfully' });
    }
  } catch (error: any) {
    console.error('Update tag order error:', error);
    res.status(500).json({ error: error.message || 'Failed to update tag order' });
  }
});

// Update tag visibility
router.put('/:id/visibility', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const tagId = parseInt(req.params.id);
    const { isVisible } = req.body;

    if (typeof isVisible !== 'boolean') {
      return res.status(400).json({ error: 'isVisible must be a boolean' });
    }

    const useMockData = process.env.USE_MOCK_DATA === 'true' || !process.env.DATABASE_URL;

    if (useMockData) {
      // Use mock data service
      await mockDataService.updateTagVisibility(tagId, isVisible, userId);
      res.json({ message: 'Tag visibility updated successfully' });
    } else {
      // Original database logic
      const result = await pool.query(
        'UPDATE tags SET is_visible = $1 WHERE id = $2 AND user_id = $3',
        [isVisible, tagId, userId]
      );

      if (result.rowCount === 0) {
        return res.status(404).json({ error: 'Tag not found' });
      }

      res.json({ message: 'Tag visibility updated successfully' });
    }
  } catch (error: any) {
    console.error('Update tag visibility error:', error);
    res.status(500).json({ error: error.message || 'Failed to update tag visibility' });
  }
});

export default router;