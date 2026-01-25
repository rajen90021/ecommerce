import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env.development') });

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);
console.log('API Key:', process.env.CLOUDINARY_API_KEY);
// Masked secret
const sec = process.env.CLOUDINARY_API_SECRET;
console.log('Secret (masked):', sec.substring(0, 3) + '...' + sec.substring(sec.length - 3));

try {
    const res = await cloudinary.uploader.upload('https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png', {
        folder: 'test'
    });
    console.log('✅ Upload Success:', res.secure_url);
} catch (e) {
    console.error('❌ Upload Failed:', e.message);
    if (e.reason) console.error('Reason:', e.reason);
}
