import express from 'express';
import pool from '../config/database.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Get all tours
router.get('/', async (req, res) => {
  try {
    const { destination, hasVr, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT t.*, d.name as destination_name, 
             u.first_name as operator_first_name, u.last_name as operator_last_name
      FROM tours t
      LEFT JOIN destinations d ON t.destination_id = d.id
      LEFT JOIN users u ON t.operator_id = u.id
      WHERE t.is_active = true
    `;

    const params = [];
    let paramIndex = 1;

    if (destination) {
      query += ` AND t.destination_id = $${paramIndex}`;
      params.push(destination);
      paramIndex++;
    }

    if (hasVr === 'true') {
      query += ` AND t.has_vr = true`;
    }

    query += ` ORDER BY t.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    
    // Get media for each tour
    for (let tour of result.rows) {
      const mediaResult = await pool.query(
        'SELECT * FROM media WHERE entity_type = $1 AND entity_id = $2 ORDER BY is_primary DESC',
        ['tour', tour.id]
      );
      tour.media = mediaResult.rows;
    }

    res.json(result.rows);
  } catch (error) {
    console.error('Get tours error:', error);
    res.status(500).json({ error: 'Failed to fetch tours' });
  }
});

// Get tour by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const tourResult = await pool.query(`
      SELECT t.*, d.name as destination_name,
             u.first_name as operator_first_name, u.last_name as operator_last_name
      FROM tours t
      LEFT JOIN destinations d ON t.destination_id = d.id
      LEFT JOIN users u ON t.operator_id = u.id
      WHERE t.id = $1
    `, [id]);

    if (tourResult.rows.length === 0) {
      return res.status(404).json({ error: 'Tour not found' });
    }

    const mediaResult = await pool.query(`
      SELECT * FROM media WHERE entity_type = 'tour' AND entity_id = $1
      ORDER BY is_primary DESC, created_at ASC
    `, [id]);

    const tour = {
      ...tourResult.rows[0],
      media: mediaResult.rows
    };

    res.json(tour);
  } catch (error) {
    console.error('Get tour error:', error);
    res.status(500).json({ error: 'Failed to fetch tour' });
  }
});

// Create tour
router.post('/', authenticateToken, authorizeRoles('tour_operator', 'admin'), async (req, res) => {
  try {
    const {
      title, description, destinationId, durationHours, maxCapacity,
      price, includes, excludes, hasVr, isRoyalTour, difficultyLevel
    } = req.body;

    const result = await pool.query(
      `INSERT INTO tours (title, description, destination_id, operator_id, duration_hours, max_capacity, price, includes, excludes, has_vr, is_royal_tour, difficulty_level)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
      [title, description, destinationId, req.user.id, durationHours, maxCapacity, price, JSON.stringify(includes), JSON.stringify(excludes), hasVr, isRoyalTour, difficultyLevel]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create tour error:', error);
    res.status(500).json({ error: 'Failed to create tour' });
  }
});

// Update tour
router.put('/:id', authenticateToken, authorizeRoles('tour_operator', 'admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title, description, destinationId, durationHours, maxCapacity,
      price, includes, excludes, hasVr, isRoyalTour, difficultyLevel
    } = req.body;

    // Verify user owns the tour or is admin
    const tourCheck = await pool.query('SELECT * FROM tours WHERE id = $1 AND operator_id = $2', [id, req.user.id]);
    if (tourCheck.rows.length === 0 && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const result = await pool.query(
      `UPDATE tours SET 
       title = $1, description = $2, destination_id = $3, duration_hours = $4, 
       max_capacity = $5, price = $6, includes = $7, excludes = $8, 
       has_vr = $9, is_royal_tour = $10, difficulty_level = $11, updated_at = CURRENT_TIMESTAMP
       WHERE id = $12 RETURNING *`,
      [title, description, destinationId, durationHours, maxCapacity, price, JSON.stringify(includes), JSON.stringify(excludes), hasVr, isRoyalTour, difficultyLevel, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Tour not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update tour error:', error);
    res.status(500).json({ error: 'Failed to update tour' });
  }
});

// Delete tour
router.delete('/:id', authenticateToken, authorizeRoles('tour_operator', 'admin'), async (req, res) => {
  try {
    const { id } = req.params;

    // Verify user owns the tour or is admin
    const tourCheck = await pool.query('SELECT * FROM tours WHERE id = $1 AND operator_id = $2', [id, req.user.id]);
    if (tourCheck.rows.length === 0 && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const result = await pool.query('DELETE FROM tours WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Tour not found' });
    }

    res.json({ message: 'Tour deleted successfully' });
  } catch (error) {
    console.error('Delete tour error:', error);
    res.status(500).json({ error: 'Failed to delete tour' });
  }
});

export default router;