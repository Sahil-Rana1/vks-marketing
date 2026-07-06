import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure Cloudinary if keys are provided
const isCloudinaryConfigured =
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name' &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET;

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
} else {
  console.log('Cloudinary not configured. Uploads will fallback to local folder: server/uploads/');
}

/**
 * Uploads a file buffer or local path to Cloudinary, or falls back to local storage.
 * @param {Object} file - The file object from multer (file.path or file.buffer)
 * @returns {Promise<string>} - The public URL of the uploaded image
 */
export const uploadImage = async (file) => {
  if (!file) return null;

  if (isCloudinaryConfigured) {
    try {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: 'vks_marketing',
      });
      // Clean up the local temp file after uploading to Cloudinary
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      return result.secure_url;
    } catch (error) {
      console.error('Cloudinary Upload Error:', error);
      // Fallback to local storage on error
    }
  }

  // Fallback / Local development storage
  try {
    const uploadsDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const fileName = `${Date.now()}-${path.basename(file.path)}`;
    const destinationPath = path.join(uploadsDir, fileName);

    fs.copyFileSync(file.path, destinationPath);

    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }

    // Return path relative to server root
    return `/uploads/${fileName}`;
  } catch (error) {
    console.error('Local File Backup Upload Error:', error);
    throw new Error('Image upload failed');
  }
};

export default cloudinary;
