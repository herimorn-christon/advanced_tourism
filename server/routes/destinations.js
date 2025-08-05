import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

// Get all destinations
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT d.*, c.name as country_name 
      FROM destinations d
      LEFT JOIN countries c ON d.country_id = c.id
      ORDER BY d.name ASC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Get destinations error:', error);
    res.status(500).json({ error: 'Failed to fetch destinations' });
  }
});

// Get destination by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      SELECT d.*, c.name as country_name 
      FROM destinations d
      LEFT JOIN countries c ON d.country_id = c.id
      WHERE d.id = $1
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Destination not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get destination error:', error);
    res.status(500).json({ error: 'Failed to fetch destination' });
  }
});

export default router;