import express from 'express';
import pool from '../config/database.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Get all users (admin only)
router.get('/', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, email, first_name, last_name, phone, role, country, 
             is_verified, created_at, updated_at
      FROM users 
      ORDER BY created_at DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get user by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Users can only view their own profile unless they're admin
    if (req.user.id !== id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const result = await pool.query(`
      SELECT id, email, first_name, last_name, phone, role, country, 
             is_verified, created_at, updated_at
      FROM users 
      WHERE id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Update user role (admin only)
router.patch('/:id/role', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const validRoles = ['tourist', 'hotel_owner', 'tour_operator', 'tour_guide', 'admin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const result = await pool.query(
      'UPDATE users SET role = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, email, first_name, last_name, role',
      [role, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ error: 'Failed to update user role' });
  }
});

// Toggle user verification (admin only)
router.patch('/:id/verify', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { is_verified } = req.body;

    const result = await pool.query(
      'UPDATE users SET is_verified = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, email, first_name, last_name, is_verified',
      [is_verified, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update user verification error:', error);
    res.status(500).json({ error: 'Failed to update user verification' });
  }
});

// Update user profile
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, phone, country } = req.body;

    // Users can only update their own profile unless they're admin
    if (req.user.id !== id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const result = await pool.query(
      `UPDATE users SET 
       first_name = $1, last_name = $2, phone = $3, country = $4, updated_at = CURRENT_TIMESTAMP
       WHERE id = $5 RETURNING id, email, first_name, last_name, phone, role, country, is_verified`,
      [firstName, lastName, phone, country, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Delete user (admin only)
router.delete('/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent admin from deleting themselves
    if (req.user.id === id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Get user statistics (admin only)
router.get('/stats/overview', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const totalUsers = await pool.query('SELECT COUNT(*) as count FROM users');
    const verifiedUsers = await pool.query('SELECT COUNT(*) as count FROM users WHERE is_verified = true');
    const adminUsers = await pool.query('SELECT COUNT(*) as count FROM users WHERE role = $1', ['admin']);
    const hotelOwners = await pool.query('SELECT COUNT(*) as count FROM users WHERE role = $1', ['hotel_owner']);
    const tourOperators = await pool.query('SELECT COUNT(*) as count FROM users WHERE role = $1', ['tour_operator']);
    const tourists = await pool.query('SELECT COUNT(*) as count FROM users WHERE role = $1', ['tourist']);

    const stats = {
      total: parseInt(totalUsers.rows[0].count),
      verified: parseInt(verifiedUsers.rows[0].count),
      admins: parseInt(adminUsers.rows[0].count),
      hotelOwners: parseInt(hotelOwners.rows[0].count),
      tourOperators: parseInt(tourOperators.rows[0].count),
      tourists: parseInt(tourists.rows[0].count)
    };

    res.json(stats);
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ error: 'Failed to fetch user statistics' });
  }
});

export default router;