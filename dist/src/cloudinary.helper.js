"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadToCloudinary = uploadToCloudinary;
const cloudinary_1 = require("cloudinary");
const stream_1 = require("stream");
async function uploadToCloudinary(fileBuffer, fileName) {
    cloudinary_1.v2.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'synctab',
        api_key: process.env.CLOUDINARY_API_KEY || 'mock_key',
        api_secret: process.env.CLOUDINARY_API_SECRET || 'mock_secret',
    });
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary_1.v2.uploader.upload_stream({
            folder: 'synctab_wallpapers',
            public_id: `${Date.now()}_${fileName.replace(/\.[^/.]+$/, '')}`,
        }, (error, result) => {
            if (error) {
                return reject(error);
            }
            if (!result)
                return reject(new Error('Cloudinary upload returned undefined result'));
            resolve(result.secure_url);
        });
        const stream = new stream_1.Readable();
        stream.push(fileBuffer);
        stream.push(null);
        stream.pipe(uploadStream);
    });
}
//# sourceMappingURL=cloudinary.helper.js.map