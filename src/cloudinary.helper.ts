import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

export async function uploadToCloudinary(
  fileBuffer: Buffer,
  fileName: string,
): Promise<string> {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'synctab',
    api_key: process.env.CLOUDINARY_API_KEY || 'mock_key',
    api_secret: process.env.CLOUDINARY_API_SECRET || 'mock_secret',
  });

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'synctab_wallpapers',
        public_id: `${Date.now()}_${fileName.replace(/\.[^/.]+$/, '')}`,
      },
      (error, result) => {
        if (error) return reject(error);
        if (!result)
          return reject(
            new Error('Cloudinary upload returned undefined result'),
          );
        resolve(result.secure_url);
      },
    );

    const stream = new Readable();
    stream.push(fileBuffer);
    stream.push(null);
    stream.pipe(uploadStream);
  });
}
