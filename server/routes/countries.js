import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

// Get all countries
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM countries ORDER BY name ASC');
    res.json(result.rows);
  } catch (error) {
    console.error('Get countries error:', error);
    res.status(500).json({ error: 'Failed to fetch countries' });
  }
});

// Get country by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM countries WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Country not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get country error:', error);
    res.status(500).json({ error: 'Failed to fetch country' });
  }
});

export default router;