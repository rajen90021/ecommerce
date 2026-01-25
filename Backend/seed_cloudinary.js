import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import sequelize from './src/database/connection.js';
import Category from './src/modules/category/category.model.js';
import Product from './src/modules/product/product.model.js';
import ProductImage from './src/modules/product/product-image.model.js';
import { uploadToCloudinary } from './src/integrations/storage/cloudinary.utils.js';
import { v4 as uuidv4 } from 'uuid';

// Load Env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env.development') });

const downloadImageAsBuffer = async (url) => {
    try {
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        return Buffer.from(response.data, 'binary');
    } catch (e) {
        console.error(`Failed to download: ${url}`);
        return null;
    }
};

const seedCloudinary = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Connected to DB. Starting Cloudinary Seeding...');

        // Clear existing
        await ProductImage.destroy({ where: {} });
        await Product.destroy({ where: {} });
        await Category.destroy({ where: {} });

        const catData = [
            { name: 'Men Fashion', slug: 'men-fashion', img: 'https://images.unsplash.com/photo-1488161628813-04466f872be2' },
            { name: 'Women Fashion', slug: 'women-fashion', img: 'https://images.unsplash.com/photo-1483985988355-763728e1935b' },
            { name: 'Accessories', slug: 'accessories', img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30' }
        ];

        const seededCategories = [];
        for (const cat of catData) {
            console.log(`🚀 Uploading category image for: ${cat.name}`);
            const buffer = await downloadImageAsBuffer(`${cat.img}?auto=format&fit=crop&w=800&q=80`);
            let cloudUrl = cat.img; // fallback
            if (buffer) {
                const res = await uploadToCloudinary(buffer, 'categories');
                cloudUrl = res.url;
            }

            const newCat = await Category.create({
                id: uuidv4(),
                category_name: cat.name,
                url_slug: cat.slug,
                image_url: cloudUrl,
                status: 'active'
            });
            seededCategories.push(newCat);
        }

        const productSamples = [
            { name: 'Premium Navy Blazer', price: 129, catIdx: 0, imgBase: '1594932224010-720c7885b5c9' },
            { name: 'White Silk Shirt', price: 75, catIdx: 0, imgBase: '1521572267360-eead09b9721c' },
            { name: 'Summer Red Dress', price: 89, catIdx: 1, imgBase: '1572804013427-4d7ca7268217' },
            { name: 'Black Leather Handbag', price: 150, catIdx: 2, imgBase: '1584917865442-de89df76afd3' },
            { name: 'Luxury Silver Watch', price: 299, catIdx: 2, imgBase: '1524592094714-0f0654e20314' }
        ];

        for (const prod of productSamples) {
            console.log(`🚀 Uploading product images for: ${prod.name}`);
            const buffer = await downloadImageAsBuffer(`https://images.unsplash.com/photo-${prod.imgBase}?auto=format&fit=crop&w=1000&q=80`);

            let primaryUrl = `https://images.unsplash.com/photo-${prod.imgBase}`;
            if (buffer) {
                const res = await uploadToCloudinary(buffer, 'products');
                primaryUrl = res.url;
            }

            const newProd = await Product.create({
                id: uuidv4(),
                product_name: prod.name,
                url_slug: prod.name.toLowerCase().replace(/ /g, '-'),
                category_id: seededCategories[prod.catIdx].id,
                description: `Beautifully crafted ${prod.name} that fits perfectly into your high-end lifestyle.`,
                price: prod.price,
                stock_quantity: 50,
                image_url: primaryUrl,
                status: 'active'
            });

            // Add 3 variants to product images in Cloudinary
            const variations = ['?w=1000&q=80', '?w=800&sat=-100', '?w=800&hue=180'];
            for (let i = 0; i < variations.length; i++) {
                const vBuffer = await downloadImageAsBuffer(`https://images.unsplash.com/photo-${prod.imgBase}${variations[i]}`);
                if (vBuffer) {
                    const vRes = await uploadToCloudinary(vBuffer, 'products');
                    await ProductImage.create({
                        id: uuidv4(),
                        product_id: newProd.id,
                        image_url: vRes.url,
                        image_order: i,
                        is_primary: i === 0,
                        status: 'active'
                    });
                }
            }
        }

        console.log('✨ SUCCESS! Your store is now powered by Cloudinary images.');
        process.exit(0);
    } catch (e) {
        console.error('❌ Seeding failed:', e);
        process.exit(1);
    }
};

seedCloudinary();
