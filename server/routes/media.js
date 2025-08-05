import express from 'express';
import path from 'path';
import pool from '../config/database.js';
import { upload } from '../middleware/upload.js';
import { MediaConverter } from '../services/mediaConverter.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Upload media from URL
router.post('/upload-url', authenticateToken, async (req, res) => {
  try {
    const { entityType, entityId, mediaUrl, mediaType, isVRConversion = true } = req.body;

    // Create media record
    const result = await pool.query(
      `INSERT INTO media (entity_type, entity_id, file_name, original_name, file_path, vr_file_path, file_type, is_vr, is_primary)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [
        entityType,
        entityId,
        `url-${Date.now()}`,
        'uploaded-media',
        mediaUrl,
        isVRConversion ? mediaUrl : null, // For VR, we'll use the same URL for now
        mediaType === 'video' ? 'video/mp4' : 'image/jpeg',
        isVRConversion,
        true
      ]
    );

    res.json({ files: [result.rows[0]] });
  } catch (error) {
    console.error('Upload URL error:', error);
    res.status(500).json({ error: 'Failed to upload media URL' });
  }
});

// Upload media with VR conversion
router.post('/upload/:entityType/:entityId', authenticateToken, upload.array('files', 10), async (req, res) => {
  try {
    const { entityType, entityId } = req.params;
    const { isVRConversion = false } = req.body;
    const uploadedFiles = [];

    for (const file of req.files) {
      const mediaRecord = {
        entity_type: entityType,
        entity_id: entityId,
        file_name: file.filename,
        original_name: file.originalname,
        file_path: file.path,
        file_type: file.mimetype,
        file_size: file.size,
        is_vr: false
      };

      // Convert to VR if requested
      if (isVRConversion) {
        const vrOutputPath = path.join(
          process.cwd(), 
          'uploads', 
          'converted', 
          entityType, 
          `vr-${file.filename}`
        );

        try {
          await MediaConverter.convertToVR(file.path, vrOutputPath, file.mimetype);
          mediaRecord.vr_file_path = vrOutputPath;
          mediaRecord.is_vr = true;
        } catch (error) {
          console.error('VR conversion failed:', error);
        }
      }

      // Generate thumbnail
      const thumbnailPath = path.join(
        process.cwd(),
        'uploads',
        'thumbnails',
        `thumb-${file.filename.split('.')[0]}.jpg`
      );

      try {
        await MediaConverter.generateThumbnail(file.path, thumbnailPath, file.mimetype);
      } catch (error) {
        console.error('Thumbnail generation failed:', error);
      }

      // Save to database
      const result = await pool.query(
        `INSERT INTO media (entity_type, entity_id, file_name, original_name, file_path, vr_file_path, file_type, file_size, is_vr)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
        [
          mediaRecord.entity_type,
          mediaRecord.entity_id,
          mediaRecord.file_name,
          mediaRecord.original_name,
          mediaRecord.file_path,
          mediaRecord.vr_file_path,
          mediaRecord.file_type,
          mediaRecord.file_size,
          mediaRecord.is_vr
        ]
      );

      uploadedFiles.push(result.rows[0]);
    }

    res.json({ files: uploadedFiles });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// Get media for entity
router.get('/:entityType/:entityId', async (req, res) => {
  try {
    const { entityType, entityId } = req.params;
    
    const result = await pool.query(
      'SELECT * FROM media WHERE entity_type = $1 AND entity_id = $2 ORDER BY created_at DESC',
      [entityType, entityId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get media error:', error);
    res.status(500).json({ error: 'Failed to fetch media' });
  }
});

// Serve files
router.get('/files/:folder/:filename', (req, res) => {
  const { folder, filename } = req.params;
  const filePath = path.join(process.cwd(), 'uploads', folder, filename);
  res.sendFile(filePath);
});

router.get('/files/:folder/:subfolder/:filename', (req, res) => {
  const { folder, subfolder, filename } = req.params;
  const filePath = path.join(process.cwd(), 'uploads', folder, subfolder, filename);
  res.sendFile(filePath);
});

export default router;