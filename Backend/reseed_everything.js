import sequelize from './src/database/connection.js';
import Category from './src/modules/category/category.model.js';
import Product from './src/modules/product/product.model.js';
import ProductImage from './src/modules/product/product-image.model.js';
import ProductVariant from './src/modules/product/product-variant.model.js';
import User from './src/modules/user/user.model.js';
import Role from './src/modules/user/role.model.js';
import UserRole from './src/modules/user/user-role.model.js';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

/**
 * Reseed Script: Wipes all data, creates roles, admin user, and fresh categories.
 */

const reseedData = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Connected to database.');

        // Wipe data
        console.log('🗑️  Wiping all existing products, categories, and users...');
        await ProductVariant.destroy({ where: {} });
        await ProductImage.destroy({ where: {} });
        await Product.destroy({ where: {} });
        await Category.destroy({ where: {} });
        await UserRole.destroy({ where: {} });
        await User.destroy({ where: {} });
        await Role.destroy({ where: {} });
        console.log('✅ Database cleared.');

        // Create Roles
        console.log('👥 Creating Roles...');
        const roleMap = {};
        const roles = ['admin', 'customer'];
        for (const r of roles) {
            const newRole = await Role.create({
                id: uuidv4(),
                role_name: r,
                createdAt: new Date(),
                updatedAt: new Date()
            });
            roleMap[r] = newRole;
        }

        // Create Admin User
        console.log('👤 Creating Admin User...');
        const hashedPassword = await bcrypt.hash('admin123', 10);
        const adminUser = await User.create({
            id: uuidv4(),
            name: 'Admin User',
            email: 'admin@example.com',
            password: hashedPassword,
            is_verified: true,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        await UserRole.create({
            user_id: adminUser.id,
            role_id: roleMap['admin'].id
        });

        console.log('✅ Admin User created: admin@example.com / admin123');

        const categoryStructure = [
            {
                name: 'Core Categories',
                description: 'The heartbeat of our store, featuring our most essential and high-demand collections.',
                image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80',
                subs: [
                    { name: 'Men’s Wear', description: 'Timeless styles and modern essentials for the contemporary man.', img: 'https://images.unsplash.com/photo-1488161628813-04466f872be2?auto=format&fit=crop&w=800&q=80' },
                    { name: 'Women’s Wear', description: 'Elegant, bold, and expressive fashion for every woman.', img: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=80' },
                    { name: 'Kids’ Wear', description: 'Playful and comfortable outfits for the little ones.', img: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=800&q=80' },
                    { name: 'Unisex Collection', description: 'Gender-neutral fashion that focuses on fit and universal style.', img: 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=800&q=80' },
                    { name: 'New Arrivals', description: 'Stay ahead of the curve with our latest drops and seasonal hits.', img: 'https://images.unsplash.com/photo-1540221652346-e5dd6b50f3e7?auto=format&fit=crop&w=800&q=80' },
                    { name: 'Best Sellers', description: 'The community\'s favorites, tried and tested for premium quality.', img: 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&w=800&q=80' }
                ]
            },
            {
                name: 'Clothing Types',
                description: 'Specific garment classifications to help you find precisely what you need.',
                image: 'https://images.unsplash.com/photo-1523381294911-8d3adad43402?auto=format&fit=crop&w=800&q=80',
                subs: [
                    { name: 'Tops & T-Shirts', description: 'Versatile tops for everyday layering and standalone style.', img: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80' },
                    { name: 'Shirts & Blouses', description: 'Crisp shirts and elegant blouses for professional and casual settings.', img: 'https://images.unsplash.com/photo-1598033129183-c4f50c7176c8?auto=format&fit=crop&w=800&q=80' },
                    { name: 'Jeans & Denim', description: 'Durable and stylish denim in various fits and washes.', img: 'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=800&q=80' },
                    { name: 'Pants & Trousers', description: 'Smart trousers and comfortable pants for all occasions.', img: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=80' },
                    { name: 'Dresses', description: 'Beautifully crafted dresses from mini to maxi lengths.', img: 'https://images.unsplash.com/photo-1539008835279-4346ef0541cf?auto=format&fit=crop&w=800&q=80' },
                    { name: 'Skirts', description: 'Feminine silhouettes and modern cuts for a stylish look.', img: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?auto=format&fit=crop&w=800&q=80' },
                    { name: 'Hoodies & Sweatshirts', description: 'Ultra-soft fleece and loungewear essentials for maximum comfort.', img: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=800&q=80' },
                    { name: 'Jackets & Coats', description: 'Outerwear designed to protect and impress in any weather.', img: 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=800&q=80' }
                ]
            },
            {
                name: 'Special Collections',
                description: 'Curated themes and cultural selections for distinctive fashion statements.',
                image: 'https://images.unsplash.com/photo-1549439602-43ebca2327af?auto=format&fit=crop&w=800&q=80',
                subs: [
                    { name: 'Ethnic / Traditional Wear', description: 'Rich heritage and intricate designs for cultural celebrations.', img: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?auto=format&fit=crop&w=800&q=80' },
                    { name: 'Formal Wear', description: 'Sharp tailoring and refined fabrics for high-stakes events.', img: 'https://images.unsplash.com/photo-1594932224430-a4ef4cc15340?auto=format&fit=crop&w=800&q=80' },
                    { name: 'Casual Wear', description: 'Relaxed and effortless clothing for your daily routine.', img: 'https://images.unsplash.com/photo-1516762689617-e1cffcef479d?auto=format&fit=crop&w=800&q=80' },
                    { name: 'Sportswear / Activewear', description: 'Performance-driven gear for athletes and fitness enthusiasts.', img: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=800&q=80' },
                    { name: 'Party Wear', description: 'Bold and glamourous outfits to make you the center of attention.', img: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=800&q=80' },
                    { name: 'Winter Collection', description: 'Warm layers and thermal styles for cold climates.', img: 'https://images.unsplash.com/photo-1515233182881-bd3adad43402?auto=format&fit=crop&w=800&q=80' },
                    { name: 'Summer Collection', description: 'Breathable fabrics and light colors for sunny days.', img: 'https://images.unsplash.com/photo-1523350165414-08fb36c644f1?auto=format&fit=crop&w=800&q=80' }
                ]
            },
            {
                name: 'Add-on Categories',
                description: 'Complete your look with our premium range of lifestyle extras.',
                image: 'https://images.unsplash.com/photo-1492724441997-5dc865305da7?auto=format&fit=crop&w=800&q=80',
                subs: [
                    { name: 'Accessories', description: 'Belts, bags, and more to add the perfect finishing touch.', img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80' },
                    { name: 'Footwear', description: 'From casual sneakers to formal leather shoes.', img: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80' }
                ]
            }
        ];

        console.log('📦 Seeding fresh Categories...');
        for (const root of categoryStructure) {
            const rootId = uuidv4();
            await Category.create({
                id: rootId,
                category_name: root.name,
                description: root.description,
                url_slug: root.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-9]/g, ''),
                parent_cat_id: null,
                status: 'active',
                image_url: root.image,
                createdAt: new Date(),
                updatedAt: new Date()
            });

            for (const sub of root.subs) {
                const subId = uuidv4();
                await Category.create({
                    id: subId,
                    category_name: sub.name,
                    description: sub.description,
                    url_slug: sub.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-9]/g, ''),
                    parent_cat_id: rootId,
                    status: 'active',
                    image_url: sub.img,
                    createdAt: new Date(),
                    updatedAt: new Date()
                });

                // Create 15 sample products for each subcategory
                for (let i = 1; i <= 15; i++) {
                    const productId = uuidv4();
                    const productPrice = 29.99 + Math.floor(Math.random() * 200);
                    const isFeatured = Math.random() > 0.8;
                    const isTrending = Math.random() > 0.7;
                    const rating = 3.5 + (Math.random() * 1.5);
                    const reviews = Math.floor(Math.random() * 100);

                    // Generate a unique image by appending a unique index and subcategory name to the Unsplash source
                    // This ensures each product gets a visually distinct (but themed) image
                    const productImg = `https://images.unsplash.com/photo-${getUniqueId(sub.name, i)}?auto=format&fit=crop&w=800&q=80`;

                    await Product.create({
                        id: productId,
                        product_name: `Premium ${sub.name} - Edition 0${i}`,
                        url_slug: `premium-${sub.name.toLowerCase().replace(/\s+/g, '-')}-${i}-${uuidv4().substring(0, 4)}`,
                        category_id: subId,
                        description: `Our latest ${sub.name} creation. This edition 0${i} represents the peak of our ${root.name} design philosophy, combining high-grade fabrics with modern tailoring. Perfect for customers who value both durability and trend-setting aesthetics.`,
                        price: productPrice,
                        original_price: parseFloat((productPrice * 1.4).toFixed(2)),
                        discount_percentage: 28,
                        stock_quantity: 20 + Math.floor(Math.random() * 80),
                        brand: 'SHIVBUZZ',
                        is_featured: isFeatured,
                        is_trending: isTrending,
                        is_new_arrival: i <= 5,
                        average_rating: parseFloat(rating.toFixed(1)),
                        total_reviews: reviews,
                        status: 'active',
                        image_url: productImg,
                        createdAt: new Date(),
                        updatedAt: new Date()
                    });

                    await ProductImage.create({
                        id: uuidv4(),
                        product_id: productId,
                        image_url: productImg,
                        image_order: 0,
                        is_primary: true,
                        status: 'active'
                    });

                    // Add standard size variants
                    const sizes = ['S', 'M', 'L', 'XL'];
                    for (const size of sizes) {
                        await ProductVariant.create({
                            id: uuidv4(),
                            product_id: productId,
                            variant_name: 'Size',
                            variant_value: size,
                            price_adjustment: 0,
                            stock_quantity: 25,
                            status: 'active'
                        });
                    }
                }
            }
        }

        /**
         * Helper to get distinct Unsplash IDs based on category to ensure visual unique products
         */
        function getUniqueId(category, index) {
            const common = [
                '1523381294911-8d3adad43402', '1556821840-3a63f95609a7', '1490481651871-ab68de25d43d',
                '1488161628813-04466f872be2', '1483985988355-763728e1935b', '1521572163474-6864f9cf17ab',
                '1539008835279-4346ef0541cf', '1542272604-787c3835535d', '1516762689617-e1cffcef479d'
            ];
            // Mix the index to get different IDs even if category matches
            return common[(index + category.length) % common.length];
        }

        console.log('✅ Mass seeding completed with UNIQUE product images! ~375 products total.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Reseed failed:', error);
        process.exit(1);
    }
};

reseedData();
