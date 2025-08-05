import express from 'express';
import pool from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Create booking
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      bookingType, roomId, tourId, checkInDate, checkOutDate,
      tourDate, guests, specialRequests
    } = req.body;

    // Generate booking reference
    const bookingReference = `TMS-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    let totalPrice = 0;

    // Calculate price based on booking type
    if (bookingType === 'room' && roomId) {
      const roomResult = await pool.query('SELECT price_per_night FROM rooms WHERE id = $1', [roomId]);
      if (roomResult.rows.length === 0) {
        return res.status(404).json({ error: 'Room not found' });
      }
      
      const nights = Math.ceil((new Date(checkOutDate) - new Date(checkInDate)) / (1000 * 60 * 60 * 24));
      totalPrice = roomResult.rows[0].price_per_night * nights * guests;
    } else if (bookingType === 'tour' && tourId) {
      const tourResult = await pool.query('SELECT price FROM tours WHERE id = $1', [tourId]);
      if (tourResult.rows.length === 0) {
        return res.status(404).json({ error: 'Tour not found' });
      }
      
      totalPrice = tourResult.rows[0].price * guests;
    }

    const result = await pool.query(
      `INSERT INTO bookings (user_id, booking_type, room_id, tour_id, check_in_date, check_out_date, tour_date, guests, total_price, special_requests, booking_reference)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [req.user.id, bookingType, roomId, tourId, checkInDate, checkOutDate, tourDate, guests, totalPrice, specialRequests, bookingReference]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

// Get user bookings
router.get('/my-bookings', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT b.*, 
             r.room_number, r.room_type,
             h.name as hotel_name, h.address as hotel_address,
             t.title as tour_title, t.description as tour_description,
             d.name as destination_name
      FROM bookings b
      LEFT JOIN rooms r ON b.room_id = r.id
      LEFT JOIN hotels h ON r.hotel_id = h.id
      LEFT JOIN tours t ON b.tour_id = t.id
      LEFT JOIN destinations d ON (h.destination_id = d.id OR t.destination_id = d.id)
      WHERE b.user_id = $1
      ORDER BY b.created_at DESC
    `, [req.user.id]);

    res.json(result.rows);
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// Update booking status
router.patch('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, paymentStatus } = req.body;

    const result = await pool.query(
      'UPDATE bookings SET status = $1, payment_status = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
      [status, paymentStatus, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update booking error:', error);
    res.status(500).json({ error: 'Failed to update booking' });
  }
});

// Get all bookings (admin/hotel owner only) - moved before export
router.get('/all', authenticateToken, async (req, res) => {
  try {
    // Check if user has permission
    if (!['admin', 'hotel_owner', 'tour_operator'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const userId = req.user.role === 'admin' ? null : req.user.id;

    let query = `
      SELECT b.*, 
             r.room_number, r.room_type,
             h.name as hotel_name, h.address as hotel_address,
             t.title as tour_title, t.description as tour_description,
             d.name as destination_name,
             u.first_name, u.last_name, u.email
      FROM bookings b
      LEFT JOIN rooms r ON b.room_id = r.id
      LEFT JOIN hotels h ON r.hotel_id = h.id
      LEFT JOIN tours t ON b.tour_id = t.id
      LEFT JOIN destinations d ON (h.destination_id = d.id OR t.destination_id = d.id)
      LEFT JOIN users u ON b.user_id = u.id
    `;

    const params = [];
    if (userId) {
      query += ` WHERE h.owner_id = $1 OR t.operator_id = $1`;
      params.push(userId);
    }

    query += ` ORDER BY b.created_at DESC`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Get all bookings error:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

export default router;