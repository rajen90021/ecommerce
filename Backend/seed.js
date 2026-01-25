import sequelize from './src/database/connection.js';
import Category from './src/modules/category/category.model.js';
import Product from './src/modules/product/product.model.js';
import ProductImage from './src/modules/product/product-image.model.js';
import { v4 as uuidv4 } from 'uuid';

const seedData = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');

        // Clear existing data
        await ProductImage.destroy({ where: {} });
        await Product.destroy({ where: {} });
        await Category.destroy({ where: {} });

        // High-quality clothing category images
        const categories = await Category.bulkCreate([
            { id: uuidv4(), category_name: 'Men', url_slug: 'men', status: 'active', image_url: 'https://images.unsplash.com/photo-1488161628813-04466f872be2?auto=format&fit=crop&w=400&q=80' },
            { id: uuidv4(), category_name: 'Women', url_slug: 'women', status: 'active', image_url: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=400&q=80' },
            { id: uuidv4(), category_name: 'Kids', url_slug: 'kids', status: 'active', image_url: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=400&q=80' },
            { id: uuidv4(), category_name: 'Accessories', url_slug: 'accessories', status: 'active', image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80' }
        ]);

        console.log('Categories seeded!');

        const clothingTypes = [
            { name: 'Casual T-Shirt', price: 25.00, catIdx: 0, imgIds: ['1521572267360-eead09b9721c', '1581655353564-df123a1eb820', '1523381235312-3c1a830dec51'] },
            { name: 'Slim Fit Jeans', price: 55.00, catIdx: 0, imgIds: ['1542272604-787c3835535d', '1541099649105-f69ad21f3246', '1605518216938-7c31b7b14ad0'] },
            { name: 'Business Blazer', price: 145.00, catIdx: 0, imgIds: ['1591047134402-0c0b3d9c812c', '1594932224010-720c7885b5c9', '1507679799987-c73779587ccf'] },
            { name: 'Floral Summer Dress', price: 85.00, catIdx: 1, imgIds: ['1572804013427-4d7ca7268217', '1496747611176-843222e1e57c', '1515372039744-b8f02a3ae446'] },
            { name: 'Silk Party Blouse', price: 95.00, catIdx: 1, imgIds: ['1564202284173-424a89a074c8', '1551163943-3f6a855d1153', '1598554747436-c9293d6a588f'] },
            { name: 'Designer Leather Bag', price: 180.00, catIdx: 3, imgIds: ['1584917865442-de89df76afd3', '1591561954557-26941169b79e', '1548036328-c9fa89d128fa'] }
        ];

        const products = [];
        const productImages = [];

        // Generate 110 products
        for (let i = 0; i < 110; i++) {
            const type = clothingTypes[i % clothingTypes.length];
            const productId = uuidv4();
            const productName = `${type.name} Series ${i + 1}`;
            const slug = productName.toLowerCase().replace(/ /g, '-');
            const primaryImgId = type.imgIds[i % type.imgIds.length];

            products.push({
                id: productId,
                product_name: productName,
                url_slug: slug,
                category_id: categories[type.catIdx].id,
                description: `This ${productName} offers a blend of style and comfort. Perfect for your daily routine or special events. Made with high-quality materials ensures durability and a premium feel.`,
                price: type.price + (i * 0.5),
                stock_quantity: 20 + i,
                status: 'active',
                image_url: `https://images.unsplash.com/photo-${primaryImgId}?auto=format&fit=crop&w=400&q=80`,
                created_At: new Date(),
                updated_At: new Date()
            });

            // Add 4 images for each product
            for (let j = 0; j < 4; j++) {
                // Cycle through the available IDs for this type or use variations
                const imgId = type.imgIds[(i + j) % type.imgIds.length];
                productImages.push({
                    id: uuidv4(),
                    product_id: productId,
                    image_url: `https://images.unsplash.com/photo-${imgId}?auto=format&fit=crop&w=600&q=80`,
                    image_order: j,
                    is_primary: j === 0,
                    status: 'active',
                    created_At: new Date(),
                    updated_At: new Date()
                });
            }
        }

        await Product.bulkCreate(products);
        console.log('✅ 110 Clothing Products seeded!');

        await ProductImage.bulkCreate(productImages);
        console.log('✅ 440 High-quality images seeded!');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding data:', error);
        process.exit(1);
    }
};

seedData();
