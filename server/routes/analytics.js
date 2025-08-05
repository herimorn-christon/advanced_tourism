import express from 'express';
import pool from '../config/database.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Get complete analytics report
router.get('/complete-report', authenticateToken, authorizeRoles('admin', 'hotel_owner', 'tour_operator'), async (req, res) => {
  try {
    const userId = req.user.role === 'admin' ? null : req.user.id;

    // Get comprehensive analytics data
    const totalBookings = await pool.query(
      userId 
        ? `SELECT COUNT(*) as total FROM bookings b 
           LEFT JOIN rooms r ON b.room_id = r.id 
           LEFT JOIN hotels h ON r.hotel_id = h.id 
           LEFT JOIN tours t ON b.tour_id = t.id 
           WHERE h.owner_id = $1 OR t.operator_id = $1`
        : 'SELECT COUNT(*) as total FROM bookings',
      userId ? [userId] : []
    );

    const totalRevenue = await pool.query(
      userId
        ? `SELECT COALESCE(SUM(b.total_price), 0) as total FROM bookings b 
           LEFT JOIN rooms r ON b.room_id = r.id 
           LEFT JOIN hotels h ON r.hotel_id = h.id 
           LEFT JOIN tours t ON b.tour_id = t.id 
           WHERE (h.owner_id = $1 OR t.operator_id = $1) AND b.payment_status = 'completed'`
        : `SELECT COALESCE(SUM(total_price), 0) as total FROM bookings WHERE payment_status = 'completed'`,
      userId ? [userId] : []
    );

    const vrViews = await pool.query(
      `SELECT COUNT(*) as total FROM analytics 
       WHERE event_type = 'vr_view' ${userId ? 'AND metadata->>\'owner_id\' = $1' : ''}`,
      userId ? [userId] : []
    );

    const report = {
      generatedAt: new Date().toISOString(),
      summary: {
        totalBookings: parseInt(totalBookings.rows[0].total),
        totalRevenue: parseFloat(totalRevenue.rows[0].total),
        vrViews: parseInt(vrViews.rows[0].total),
        reportPeriod: 'All Time'
      }
    };

    res.json(report);
  } catch (error) {
    console.error('Complete report error:', error);
    res.status(500).json({ error: 'Failed to generate complete report' });
  }
});

// Get dashboard analytics
router.get('/dashboard', authenticateToken, authorizeRoles('admin', 'hotel_owner', 'tour_operator'), async (req, res) => {
  try {
    const userId = req.user.role === 'admin' ? null : req.user.id;

    // Total bookings
    const bookingsQuery = userId 
      ? `SELECT COUNT(*) as total FROM bookings b 
         LEFT JOIN rooms r ON b.room_id = r.id 
         LEFT JOIN hotels h ON r.hotel_id = h.id 
         LEFT JOIN tours t ON b.tour_id = t.id 
         WHERE h.owner_id = $1 OR t.operator_id = $1`
      : 'SELECT COUNT(*) as total FROM bookings';
    
    const bookingsResult = await pool.query(bookingsQuery, userId ? [userId] : []);

    // Total revenue
    const revenueQuery = userId
      ? `SELECT COALESCE(SUM(b.total_price), 0) as total FROM bookings b 
         LEFT JOIN rooms r ON b.room_id = r.id 
         LEFT JOIN hotels h ON r.hotel_id = h.id 
         LEFT JOIN tours t ON b.tour_id = t.id 
         WHERE (h.owner_id = $1 OR t.operator_id = $1) AND b.payment_status = 'completed'`
      : `SELECT COALESCE(SUM(total_price), 0) as total FROM bookings WHERE payment_status = 'completed'`;
    
    const revenueResult = await pool.query(revenueQuery, userId ? [userId] : []);

    // VR content views
    const vrViewsResult = await pool.query(
      `SELECT COUNT(*) as total FROM analytics 
       WHERE event_type = 'vr_view' ${userId ? 'AND metadata->>\'owner_id\' = $1' : ''}`,
      userId ? [userId] : []
    );

    // Recent bookings
    const recentBookingsQuery = userId
      ? `SELECT b.*, r.room_number, h.name as hotel_name, t.title as tour_title 
         FROM bookings b 
         LEFT JOIN rooms r ON b.room_id = r.id 
         LEFT JOIN hotels h ON r.hotel_id = h.id 
         LEFT JOIN tours t ON b.tour_id = t.id 
         WHERE h.owner_id = $1 OR t.operator_id = $1 
         ORDER BY b.created_at DESC LIMIT 10`
      : `SELECT b.*, r.room_number, h.name as hotel_name, t.title as tour_title 
         FROM bookings b 
         LEFT JOIN rooms r ON b.room_id = r.id 
         LEFT JOIN hotels h ON r.hotel_id = h.id 
         LEFT JOIN tours t ON b.tour_id = t.id 
         ORDER BY b.created_at DESC LIMIT 10`;
    
    const recentBookingsResult = await pool.query(recentBookingsQuery, userId ? [userId] : []);

    // Monthly revenue chart data
    const monthlyRevenueQuery = userId
      ? `SELECT DATE_TRUNC('month', b.created_at) as month, 
         SUM(b.total_price) as revenue
         FROM bookings b 
         LEFT JOIN rooms r ON b.room_id = r.id 
         LEFT JOIN hotels h ON r.hotel_id = h.id 
         LEFT JOIN tours t ON b.tour_id = t.id 
         WHERE (h.owner_id = $1 OR t.operator_id = $1) AND b.payment_status = 'completed'
         AND b.created_at >= NOW() - INTERVAL '12 months'
         GROUP BY month ORDER BY month`
      : `SELECT DATE_TRUNC('month', created_at) as month, 
         SUM(total_price) as revenue
         FROM bookings 
         WHERE payment_status = 'completed'
         AND created_at >= NOW() - INTERVAL '12 months'
         GROUP BY month ORDER BY month`;
    
    const monthlyRevenueResult = await pool.query(monthlyRevenueQuery, userId ? [userId] : []);

    res.json({
      stats: {
        totalBookings: parseInt(bookingsResult.rows[0].total),
        totalRevenue: parseFloat(revenueResult.rows[0].total),
        vrViews: parseInt(vrViewsResult.rows[0].total),
        avgRating: 4.8 // This could be calculated from reviews
      },
      recentBookings: recentBookingsResult.rows,
      monthlyRevenue: monthlyRevenueResult.rows
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Track analytics event
router.post('/track', async (req, res) => {
  try {
    const { eventType, entityType, entityId, metadata } = req.body;
    const userId = req.user?.id;
    const ipAddress = req.ip;
    const userAgent = req.get('User-Agent');

    await pool.query(
      'INSERT INTO analytics (event_type, entity_type, entity_id, user_id, metadata, ip_address, user_agent) VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [eventType, entityType, entityId, userId, JSON.stringify(metadata), ipAddress, userAgent]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Track analytics error:', error);
    res.status(500).json({ error: 'Failed to track event' });
  }
});

export default router;