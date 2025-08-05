import express from 'express';
import pool from '../config/database.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Get all royal tours
router.get('/', async (req, res) => {
  try {
    const { country } = req.query;
    
    let query = `
      SELECT rt.*, c.name as country_name, c.code as country_code
      FROM royal_tours rt
      LEFT JOIN countries c ON rt.country_id = c.id
      WHERE rt.is_active = true
    `;

    const params = [];
    if (country) {
      query += ' AND rt.country_id = $1';
      params.push(country);
    }

    query += ' ORDER BY rt.created_at DESC';

    const result = await pool.query(query, params);
    
    // Get media for each royal tour
    for (let tour of result.rows) {
      const mediaResult = await pool.query(
        'SELECT * FROM media WHERE entity_type = $1 AND entity_id = $2 ORDER BY is_primary DESC',
        ['royal-tour', tour.id]
      );
      tour.media = mediaResult.rows;
    }

    res.json(result.rows);
  } catch (error) {
    console.error('Get royal tours error:', error);
    res.status(500).json({ error: 'Failed to fetch royal tours' });
  }
});

// Create royal tour
router.post('/', authenticateToken, authorizeRoles('admin', 'content_creator'), async (req, res) => {
  try {
    const { title, description, countryId, placesIncluded, featuredImage } = req.body;

    const result = await pool.query(
      `INSERT INTO royal_tours (title, description, country_id, places_included, featured_image)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [title, description, countryId, JSON.stringify(placesIncluded), featuredImage]
    );

    // Auto-create media record for featured image/video
    if (featuredImage) {
      await pool.query(
        `INSERT INTO media (entity_type, entity_id, file_name, original_name, file_path, vr_file_path, file_type, is_vr, is_primary)
         VALUES ('royal-tour', $1, $2, 'featured-media', $3, $4, $5, true, true)`,
        [
          result.rows[0].id,
          `royal-tour-${result.rows[0].id}-featured`,
          featuredImage,
          featuredImage, // VR version same as original for now
          featuredImage.includes('youtube') ? 'video/mp4' : 'image/jpeg'
        ]
      );
    }

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create royal tour error:', error);
    res.status(500).json({ error: 'Failed to create royal tour' });
  }
});

// Update royal tour
router.put('/:id', authenticateToken, authorizeRoles('admin', 'content_creator'), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, countryId, placesIncluded, featuredImage } = req.body;

    const result = await pool.query(
      `UPDATE royal_tours SET 
       title = $1, description = $2, country_id = $3, places_included = $4, featured_image = $5, updated_at = CURRENT_TIMESTAMP
       WHERE id = $6 RETURNING *`,
      [title, description, countryId, JSON.stringify(placesIncluded), featuredImage, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Royal tour not found' });
    }

    // Update media record
    if (featuredImage) {
      await pool.query(
        `INSERT INTO media (entity_type, entity_id, file_name, original_name, file_path, vr_file_path, file_type, is_vr, is_primary)
         VALUES ('royal-tour', $1, $2, 'featured-media', $3, $4, $5, true, true)
         ON CONFLICT (entity_type, entity_id, file_name) 
         DO UPDATE SET file_path = $3, vr_file_path = $4, file_type = $5`,
        [
          id,
          `royal-tour-${id}-featured`,
          featuredImage,
          featuredImage,
          featuredImage.includes('youtube') ? 'video/mp4' : 'image/jpeg'
        ]
      );
    }

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Update royal tour error:', error);
    res.status(500).json({ error: 'Failed to update royal tour' });
  }
});

// Get royal tour by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(`
      SELECT rt.*, c.name as country_name, c.code as country_code
      FROM royal_tours rt
      LEFT JOIN countries c ON rt.country_id = c.id
      WHERE rt.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Royal tour not found' });
    }

    const mediaResult = await pool.query(
      'SELECT * FROM media WHERE entity_type = $1 AND entity_id = $2 ORDER BY is_primary DESC',
      ['royal-tour', id]
    );

    const royalTour = {
      ...result.rows[0],
      media: mediaResult.rows
    };

    res.json(royalTour);
  } catch (error) {
    console.error('Get royal tour error:', error);
    res.status(500).json({ error: 'Failed to fetch royal tour' });
  }
});

// Get royal tour places
router.get('/:id/places', async (req, res) => {
  try {
    const { id } = req.params;

    const tourResult = await pool.query('SELECT places_included FROM royal_tours WHERE id = $1', [id]);
    
    if (tourResult.rows.length === 0) {
      return res.status(404).json({ error: 'Royal tour not found' });
    }

    const places = tourResult.rows[0].places_included || [];
    res.json(places);
  } catch (error) {
    console.error('Get royal tour places error:', error);
    res.status(500).json({ error: 'Failed to fetch places' });
  }
});

export default router;