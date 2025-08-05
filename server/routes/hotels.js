import express from 'express';
import pool from '../config/database.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Get all hotels
router.get('/', async (req, res) => {
  try {
    const { destination, hasVr, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT h.*, d.name as destination_name, 
             COUNT(r.id) as total_rooms,
             COUNT(CASE WHEN r.has_vr = true THEN 1 END) as vr_rooms,
             AVG(rv.rating) as avg_rating
      FROM hotels h
      LEFT JOIN destinations d ON h.destination_id = d.id
      LEFT JOIN rooms r ON h.id = r.hotel_id
      LEFT JOIN reviews rv ON rv.entity_type = 'hotel' AND rv.entity_id = h.id
      WHERE h.is_active = true
    `;

    const params = [];
    let paramIndex = 1;

    if (destination) {
      query += ` AND h.destination_id = $${paramIndex}`;
      params.push(destination);
      paramIndex++;
    }

    if (hasVr === 'true') {
      query += ` AND EXISTS (SELECT 1 FROM rooms WHERE hotel_id = h.id AND has_vr = true)`;
    }

    query += ` GROUP BY h.id, d.name ORDER BY h.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Get hotels error:', error);
    res.status(500).json({ error: 'Failed to fetch hotels' });
  }
});

// Create hotel
router.post('/', authenticateToken, authorizeRoles('hotel_owner', 'admin'), async (req, res) => {
  try {
    const {
      name, description, address, destinationId, amenities,
      contactPhone, contactEmail, checkInTime, checkOutTime
    } = req.body;

    const result = await pool.query(
      `INSERT INTO hotels (name, description, address, destination_id, owner_id, amenities, contact_phone, contact_email, check_in_time, check_out_time)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [name, description, address, destinationId, req.user.id, JSON.stringify(amenities), contactPhone, contactEmail, checkInTime, checkOutTime]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create hotel error:', error);
    res.status(500).json({ error: 'Failed to create hotel' });
  }
});

// Get hotel by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const hotelResult = await pool.query(`
      SELECT h.*, d.name as destination_name, d.country_id,
             u.first_name as owner_first_name, u.last_name as owner_last_name
      FROM hotels h
      LEFT JOIN destinations d ON h.destination_id = d.id
      LEFT JOIN users u ON h.owner_id = u.id
      WHERE h.id = $1
    `, [id]);

    if (hotelResult.rows.length === 0) {
      return res.status(404).json({ error: 'Hotel not found' });
    }

    const roomsResult = await pool.query(`
      SELECT * FROM rooms WHERE hotel_id = $1 AND is_available = true
      ORDER BY price_per_night ASC
    `, [id]);

    const mediaResult = await pool.query(`
      SELECT * FROM media WHERE entity_type = 'hotel' AND entity_id = $1
      ORDER BY is_primary DESC, created_at ASC
    `, [id]);

    const reviewsResult = await pool.query(`
      SELECT r.*, u.first_name, u.last_name
      FROM reviews r
      LEFT JOIN users u ON r.user_id = u.id
      WHERE r.entity_type = 'hotel' AND r.entity_id = $1 AND r.is_approved = true
      ORDER BY r.created_at DESC
    `, [id]);

    const hotel = {
      ...hotelResult.rows[0],
      rooms: roomsResult.rows,
      media: mediaResult.rows,
      reviews: reviewsResult.rows
    };

    res.json(hotel);
  } catch (error) {
    console.error('Get hotel error:', error);
    res.status(500).json({ error: 'Failed to fetch hotel' });
  }
});

export default router;