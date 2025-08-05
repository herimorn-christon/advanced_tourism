import express from 'express';
import pool from '../config/database.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Create room
router.post('/', authenticateToken, authorizeRoles('hotel_owner', 'admin'), async (req, res) => {
  try {
    const { hotelId, roomNumber, roomType, description, capacity, pricePerNight, amenities, hasVr } = req.body;

    // Verify user owns the hotel
    const hotelCheck = await pool.query('SELECT * FROM hotels WHERE id = $1 AND owner_id = $2', [hotelId, req.user.id]);
    if (hotelCheck.rows.length === 0 && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const result = await pool.query(
      `INSERT INTO rooms (hotel_id, room_number, room_type, description, capacity, price_per_night, amenities, has_vr)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [hotelId, roomNumber, roomType, description, capacity, pricePerNight, JSON.stringify(amenities), hasVr]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create room error:', error);
    res.status(500).json({ error: 'Failed to create room' });
  }
});

// Get room details with VR media
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const roomResult = await pool.query(`
      SELECT r.*, h.name as hotel_name, h.address, d.name as destination_name
      FROM rooms r
      LEFT JOIN hotels h ON r.hotel_id = h.id
      LEFT JOIN destinations d ON h.destination_id = d.id
      WHERE r.id = $1
    `, [id]);

    if (roomResult.rows.length === 0) {
      return res.status(404).json({ error: 'Room not found' });
    }

    const mediaResult = await pool.query(`
      SELECT * FROM media WHERE entity_type = 'room' AND entity_id = $1
      ORDER BY is_primary DESC, created_at ASC
    `, [id]);

    const room = {
      ...roomResult.rows[0],
      media: mediaResult.rows
    };

    res.json(room);
  } catch (error) {
    console.error('Get room error:', error);
    res.status(500).json({ error: 'Failed to fetch room' });
  }
});

// Check room availability
router.post('/:id/check-availability', async (req, res) => {
  try {
    const { id } = req.params;
    const { checkInDate, checkOutDate } = req.body;

    const result = await pool.query(`
      SELECT COUNT(*) as booking_count
      FROM bookings
      WHERE room_id = $1 
      AND status IN ('confirmed', 'pending')
      AND (
        (check_in_date <= $2 AND check_out_date > $2) OR
        (check_in_date < $3 AND check_out_date >= $3) OR
        (check_in_date >= $2 AND check_out_date <= $3)
      )
    `, [id, checkInDate, checkOutDate]);

    const isAvailable = parseInt(result.rows[0].booking_count) === 0;
    res.json({ available: isAvailable });
  } catch (error) {
    console.error('Check availability error:', error);
    res.status(500).json({ error: 'Failed to check availability' });
  }
});

export default router;