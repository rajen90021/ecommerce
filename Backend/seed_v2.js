import sequelize from './src/database/connection.js';
import Category from './src/modules/category/category.model.js';
import Product from './src/modules/product/product.model.js';
import ProductImage from './src/modules/product/product-image.model.js';
import ProductVariant from './src/modules/product/product-variant.model.js';
import { v4 as uuidv4 } from 'uuid';
import { Op } from 'sequelize';

/**
 * Enhanced Clothing E-commerce Seed Script V2
 */

const seedComprehensiveData = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Database connection established successfully.');

        // Clear existing data
        console.log('🗑️  Clearing existing data...');
        await ProductVariant.destroy({ where: {} });
        await ProductImage.destroy({ where: {} });
        await Product.destroy({ where: {} });
        await Category.destroy({ where: {} });
        console.log('✅ Existing data cleared.');

        // ==================== CATEGORIES ====================
        console.log('📦 Creating categories...');

        const categoryData = [
            {
                name: 'Men',
                slug: 'men',
                image: 'https://images.unsplash.com/photo-1488161628813-04466f872be2?auto=format&fit=crop&w=400&q=80',
                subcategories: ['T-Shirts', 'Shirts', 'Jeans', 'Trousers', 'Shorts', 'Joggers', 'Jackets', 'Hoodies']
            },
            {
                name: 'Women',
                slug: 'women',
                image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=400&q=80',
                subcategories: ['Dresses', 'Tops', 'Jeans', 'Skirts', 'Ethnic Wear', 'Western Wear', 'Activewear']
            },
            {
                name: 'Kids',
                slug: 'kids',
                image: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=400&q=80',
                subcategories: ['Boys Wear', 'Girls Wear', 'Infant Wear', 'Toys', 'Accessories']
            },
            {
                name: 'Accessories',
                slug: 'accessories',
                image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80',
                subcategories: ['Bags', 'Belts', 'Wallets', 'Watches', 'Sunglasses', 'Jewelry']
            },
            {
                name: 'Footwear',
                slug: 'footwear',
                image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=400&q=80',
                subcategories: ['Casual Shoes', 'Formal Shoes', 'Sports Shoes', 'Sandals', 'Slippers']
            }
        ];

        const createdCategories = [];
        const categoryMap = new Map();

        for (const mainCat of categoryData) {
            const mainCategory = await Category.create({
                id: uuidv4(),
                category_name: mainCat.name,
                url_slug: mainCat.slug,
                parent_cat_id: null,
                status: 'active',
                image_url: mainCat.image,
                createdAt: new Date(),
                updatedAt: new Date()
            });

            createdCategories.push(mainCategory);
            categoryMap.set(mainCat.name, mainCategory);

            for (const subCatName of mainCat.subcategories) {
                const subCategory = await Category.create({
                    id: uuidv4(),
                    category_name: subCatName,
                    url_slug: `${mainCat.slug}-${subCatName.toLowerCase().replace(/\s+/g, '-')}`,
                    parent_cat_id: mainCategory.id,
                    status: 'active',
                    image_url: mainCat.image,
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
                createdCategories.push(subCategory);
            }
        }

        console.log(`✅ Created ${createdCategories.length} categories.`);

        // ==================== PRODUCTS ====================
        console.log('🛍️  Creating products...');

        const productTemplates = [
            { name: 'Classic Cotton T-Shirt', basePrice: 25, category: 'Men', subcategory: 'T-Shirts', stock: 100 },
            { name: 'Slim Fit Formal Shirt', basePrice: 45, category: 'Men', subcategory: 'Shirts', stock: 80 },
            { name: 'Summer Floral Dress', basePrice: 85, category: 'Women', subcategory: 'Dresses', stock: 60 },
            { name: 'Casual Denim Jacket', basePrice: 120, category: 'Men', subcategory: 'Jackets', stock: 40 },
            { name: 'Premium Leather Watch', basePrice: 199, category: 'Accessories', subcategory: 'Watches', stock: 25 }
        ];

        const imageCollections = {
            'Default': ['1523381294911-8d3adad43402', '1556821840-3a63f95609a7', '1490481651871-ab68de25d43d']
        };

        let productCount = 0;

        for (let i = 0; i < 100; i++) {
            const template = productTemplates[i % productTemplates.length];
            const variation = i + 1;
            const productName = `${template.name} Vol ${variation}`;
            const slug = productName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

            const mainCat = categoryMap.get(template.category);
            const subCats = createdCategories.filter(c =>
                c.parent_cat_id === mainCat.id &&
                c.category_name === template.subcategory
            );
            const targetCategory = subCats.length > 0 ? subCats[0] : mainCat;

            const price = template.basePrice + (Math.random() * 20);
            const isFeatured = Math.random() > 0.7;
            const isTrending = Math.random() > 0.7;
            const isNewArrival = Math.random() > 0.5;
            const rating = 3.5 + (Math.random() * 1.5);
            const reviews = 5 + Math.floor(Math.random() * 50);

            const imageId = imageCollections.Default[i % imageCollections.Default.length];
            const primaryImageUrl = `https://images.unsplash.com/photo-${imageId}?auto=format&fit=crop&w=600&q=80`;

            const product = await Product.create({
                id: uuidv4(),
                product_name: productName,
                url_slug: `${slug}-${uuidv4().substring(0, 8)}`,
                category_id: targetCategory.id,
                description: `Premium quality ${productName}. Designed for style and comfort. Excellent choice for modern fashion lovers.`,
                price: parseFloat(price.toFixed(2)),
                original_price: parseFloat((price * 1.3).toFixed(2)),
                discount_percentage: 23,
                stock_quantity: template.stock + Math.floor(Math.random() * 50),
                brand: 'SHIV',
                tags: `${template.category.toLowerCase()}, ${template.category.toLowerCase()}s, ${template.subcategory.toLowerCase()}, fashion, clothing, premium`,
                is_featured: isFeatured,
                is_trending: isTrending,
                is_new_arrival: isNewArrival,
                average_rating: parseFloat(rating.toFixed(1)),
                total_reviews: reviews,
                status: 'active',
                image_url: primaryImageUrl,
                createdAt: new Date(),
                updatedAt: new Date()
            });

            productCount++;

            // Simple variant
            await ProductVariant.create({
                id: uuidv4(),
                product_id: product.id,
                variant_name: 'Size',
                variant_value: 'M',
                price_adjustment: 0,
                stock_quantity: 10,
                status: 'active',
                createdAt: new Date(),
                updatedAt: new Date()
            });

            // Create product images (3-5 images per product)
            const numImages = 3 + Math.floor(Math.random() * 3);
            for (let j = 0; j < numImages; j++) {
                const imgId = imageCollections.Default[(i + j) % imageCollections.Default.length];
                await ProductImage.create({
                    id: uuidv4(),
                    product_id: product.id,
                    image_url: `https://images.unsplash.com/photo-${imgId}?auto=format&fit=crop&w=800&q=80`,
                    image_order: j,
                    is_primary: j === 0,
                    status: 'active',
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
            }
        }

        console.log(`✅ Created ${productCount} products.`);
        console.log('\n🎉 SEED COMPLETED!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding data:', error);
        process.exit(1);
    }
};

seedComprehensiveData();
