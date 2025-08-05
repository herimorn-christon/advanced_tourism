import ffmpeg from 'fluent-ffmpeg';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

export class MediaConverter {
  static async convertToVR(inputPath, outputPath, mediaType) {
    try {
      if (mediaType.startsWith('image/')) {
        return await this.convertImageToVR(inputPath, outputPath);
      } else if (mediaType.startsWith('video/')) {
        return await this.convertVideoToVR(inputPath, outputPath);
      }
      throw new Error('Unsupported media type for VR conversion');
    } catch (error) {
      console.error('VR conversion error:', error);
      throw error;
    }
  }

  static async convertImageToVR(inputPath, outputPath) {
    return new Promise((resolve, reject) => {
      sharp(inputPath)
        .resize(4096, 2048, { 
          fit: 'fill',
          kernel: sharp.kernel.lanczos3 
        })
        .jpeg({ quality: 85 })
        .toFile(outputPath)
        .then(() => resolve(outputPath))
        .catch(reject);
    });
  }

  static async convertVideoToVR(inputPath, outputPath) {
    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .videoFilter([
          'scale=3840:1920',
          'setsar=1:1'
        ])
        .outputOptions([
          '-c:v libx264',
          '-preset medium',
          '-crf 23',
          '-movflags +faststart'
        ])
        .output(outputPath)
        .on('end', () => resolve(outputPath))
        .on('error', reject)
        .run();
    });
  }

  static async generateThumbnail(inputPath, outputPath, mediaType) {
    if (mediaType.startsWith('image/')) {
      return await sharp(inputPath)
        .resize(300, 200, { fit: 'cover' })
        .jpeg({ quality: 80 })
        .toFile(outputPath);
    } else if (mediaType.startsWith('video/')) {
      return new Promise((resolve, reject) => {
        ffmpeg(inputPath)
          .screenshots({
            timestamps: ['00:00:01'],
            filename: path.basename(outputPath),
            folder: path.dirname(outputPath),
            size: '300x200'
          })
          .on('end', () => resolve(outputPath))
          .on('error', reject);
      });
    }
  }
}