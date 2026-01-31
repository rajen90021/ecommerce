import sequelize from './src/database/connection.js';
import Category from './src/modules/category/category.model.js';
import Product from './src/modules/product/product.model.js';
import User from './src/modules/user/user.model.js';
import Role from './src/modules/user/role.model.js';
import Location from './src/modules/location/location.model.js';
import Offer from './src/modules/offer/offer.model.js';
import bcrypt from 'bcryptjs';

// Import all models to establish associations
import './src/database/associations.js';

const createSlug = (name) => {
    return name
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]/g, '');
};

const seedDatabase = async () => {
    try {
        console.log('🔄 Starting database seeding...');

        // Clear existing data using raw SQL for speed and to handle foreign key constraints
        console.log('🗑️  Clearing existing data...');
        const tables = [
            'user_role', 'order_items', 'order_shipping_addresses', 'orders',
            'wishlists', 'addresses', 'product_images', 'product_variants',
            'products', 'categories', 'offers', 'locations', 'users', 'role'
        ];

        for (const table of tables) {
            await sequelize.query(`TRUNCATE TABLE "${table}" RESTART IDENTITY CASCADE`);
        }

        // Seed Roles
        console.log('👥 Seeding roles...');
        const adminRole = await Role.create({
            role_name: 'admin',
            description: 'Administrator with full access',
            createdAt: new Date(),
            updatedAt: new Date()
        });

        const customerRole = await Role.create({
            role_name: 'customer',
            description: 'Regular customer',
            createdAt: new Date(),
            updatedAt: new Date()
        });

        // Seed Users
        console.log('👤 Seeding users...');
        const adminUser = await User.create({
            name: 'Admin User',
            email: 'admin@example.com',
            password: await bcrypt.hash('admin123', 10),
            phone: '+919999999999',
            is_verified: true,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        await adminUser.addRole(adminRole);

        const testUser = await User.create({
            name: 'Test Customer',
            email: 'customer@example.com',
            password: await bcrypt.hash('customer123', 10),
            phone: '+919876543210',
            is_verified: true,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        await testUser.addRole(customerRole);

        // Seed Categories
        console.log('📂 Seeding categories...');
        const categories = [
            {
                category_name: 'Electronics',
                description: 'Electronic devices and gadgets',
                image_url: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400',
                status: 'active'
            },
            {
                category_name: 'Clothing',
                description: 'Fashion and apparel',
                image_url: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=400',
                status: 'active'
            },
            {
                category_name: 'Home & Kitchen',
                description: 'Home essentials and kitchen appliances',
                image_url: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=400',
                status: 'active'
            },
            {
                category_name: 'Books',
                description: 'Books and literature',
                image_url: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400',
                status: 'active'
            }
        ];

        const createdCategories = {};
        for (const cat of categories) {
            const category = await Category.create({
                ...cat,
                url_slug: createSlug(cat.category_name),
                createdAt: new Date(),
                updatedAt: new Date()
            });
            createdCategories[cat.category_name] = category;
            console.log(`  ✓ Created: ${cat.category_name}`);
        }

        // Seed Products
        console.log('📦 Seeding products...');
        const products = [
            // Electronics
            {
                product_name: 'Wireless Bluetooth Headphones',
                category: 'Electronics',
                description: 'Premium noise-cancelling wireless headphones with 30-hour battery life',
                price: 79.99,
                original_price: 129.99,
                discount_percentage: 38.46,
                stock_quantity: 50,
                brand: 'AudioTech',
                tags: 'wireless, bluetooth, headphones, music',
                is_featured: true,
                is_trending: true,
                is_new_arrival: false,
                image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
                average_rating: 4.5,
                total_reviews: 128
            },
            {
                product_name: 'Smart Watch Series X',
                category: 'Electronics',
                description: 'Advanced fitness tracking smartwatch with heart rate monitor and GPS',
                price: 299.99,
                stock_quantity: 30,
                brand: 'TechPro',
                tags: 'smartwatch, fitness, health, GPS',
                is_featured: true,
                is_trending: false,
                is_new_arrival: true,
                image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500',
                average_rating: 4.8,
                total_reviews: 256
            },
            {
                product_name: 'Portable Bluetooth Speaker',
                category: 'Electronics',
                description: 'Waterproof portable speaker with 360° sound and 12-hour battery',
                price: 49.99,
                stock_quantity: 75,
                brand: 'SoundWave',
                tags: 'speaker, bluetooth, portable, waterproof',
                is_featured: false,
                is_trending: true,
                is_new_arrival: false,
                image_url: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500',
                average_rating: 4.3,
                total_reviews: 89
            },
            // Clothing
            {
                product_name: 'Classic Denim Jacket',
                category: 'Clothing',
                description: 'Timeless denim jacket with vintage wash and comfortable fit',
                price: 89.99,
                stock_quantity: 40,
                brand: 'UrbanStyle',
                tags: 'jacket, denim, casual, fashion',
                is_featured: false,
                is_trending: false,
                is_new_arrival: true,
                image_url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500',
                average_rating: 4.6,
                total_reviews: 67
            },
            {
                product_name: 'Premium Cotton T-Shirt Pack',
                category: 'Clothing',
                description: 'Set of 3 premium cotton t-shirts in assorted colors',
                price: 29.99,
                original_price: 49.99,
                discount_percentage: 40,
                stock_quantity: 100,
                brand: 'ComfortWear',
                tags: 't-shirt, cotton, casual, versatile',
                is_featured: true,
                is_trending: true,
                is_new_arrival: false,
                image_url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500',
                average_rating: 4.7,
                total_reviews: 342
            },
            // Home & Kitchen
            {
                product_name: 'Stainless Steel Cookware Set',
                category: 'Home & Kitchen',
                description: 'Professional 10-piece stainless steel cookware set with non-stick coating',
                price: 199.99,
                stock_quantity: 25,
                brand: 'ChefMaster',
                tags: 'cookware, kitchen, stainless steel, cooking',
                is_featured: true,
                is_trending: false,
                is_new_arrival: false,
                image_url: 'https://images.unsplash.com/photo-1584990347449-0f2c5e8cd48f?w=500',
                average_rating: 4.9,
                total_reviews: 178
            },
            {
                product_name: 'Electric Coffee Maker',
                category: 'Home & Kitchen',
                description: 'Programmable coffee maker with thermal carafe and auto-brew function',
                price: 79.99,
                stock_quantity: 45,
                brand: 'BrewPro',
                tags: 'coffee, maker, kitchen, appliance',
                is_featured: false,
                is_trending: true,
                is_new_arrival: true,
                image_url: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=500',
                average_rating: 4.4,
                total_reviews: 223
            },
            // Books
            {
                product_name: 'The Art of Programming',
                category: 'Books',
                description: 'Comprehensive guide to modern programming principles and best practices',
                price: 39.99,
                stock_quantity: 60,
                brand: 'TechBooks Publishing',
                tags: 'programming, coding, technology, education',
                is_featured: false,
                is_trending: false,
                is_new_arrival: true,
                image_url: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=500',
                average_rating: 4.8,
                total_reviews: 156
            },
            {
                product_name: 'Mindfulness for Beginners',
                category: 'Books',
                description: 'A practical guide to incorporating mindfulness into daily life',
                price: 16.99,
                stock_quantity: 80,
                brand: 'Wellness Press',
                tags: 'mindfulness, meditation, self-help, wellness',
                is_featured: true,
                is_trending: true,
                is_new_arrival: false,
                image_url: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500',
                average_rating: 4.6,
                total_reviews: 412
            }
        ];

        for (const prod of products) {
            const category = createdCategories[prod.category];
            if (!category) {
                console.log(`  ⚠️  Category not found for product: ${prod.product_name}`);
                continue;
            }

            await Product.create({
                product_name: prod.product_name,
                url_slug: createSlug(prod.product_name),
                category_id: category.id,
                description: prod.description,
                price: prod.price,
                original_price: prod.original_price || null,
                discount_percentage: prod.discount_percentage || 0,
                stock_quantity: prod.stock_quantity,
                brand: prod.brand,
                tags: prod.tags,
                is_featured: prod.is_featured || false,
                is_trending: prod.is_trending || false,
                is_new_arrival: prod.is_new_arrival || false,
                image_url: prod.image_url,
                average_rating: prod.average_rating || 0,
                total_reviews: prod.total_reviews || 0,
                status: 'active',
                createdAt: new Date(),
                updatedAt: new Date()
            });
            console.log(`  ✓ Created: ${prod.product_name}`);
        }

        // Seed Locations
        console.log('📍 Seeding locations...');
        const locations = [
            { state: 'Maharashtra', city_name: 'Mumbai', pincode: '400001', delivery_charge: 50, min_order_amount: 0 },
            { state: 'Maharashtra', city_name: 'Pune', pincode: '411001', delivery_charge: 50, min_order_amount: 0 },
            { state: 'Karnataka', city_name: 'Bangalore', pincode: '560001', delivery_charge: 60, min_order_amount: 0 },
            { state: 'Delhi', city_name: 'New Delhi', pincode: '110001', delivery_charge: 40, min_order_amount: 0 },
            { state: 'Tamil Nadu', city_name: 'Chennai', pincode: '600001', delivery_charge: 60, min_order_amount: 0 }
        ];

        for (const loc of locations) {
            await Location.create({
                ...loc,
                is_active: true,
                createdAt: new Date(),
                updatedAt: new Date()
            });
            console.log(`  ✓ Created: ${loc.city_name}, ${loc.pincode}`);
        }

        // Seed Offers (Coupons)
        console.log('🎫 Seeding offers...');
        const offers = [
            {
                code: 'WELCOME10',
                description: 'Get 10% off on your first order over ₹500',
                discount_type: 'percentage',
                discount_value: 10,
                min_order_amount: 500,
                max_discount_amount: 200,
                start_date: new Date(),
                end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
                usage_limit: 1000,
                status: 'active'
            },
            {
                code: 'SAVE50',
                description: 'Flat ₹50 off on orders over ₹200',
                discount_type: 'fixed',
                discount_value: 50,
                min_order_amount: 200,
                start_date: new Date(),
                end_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
                usage_limit: 500,
                status: 'active'
            },
            {
                code: 'FESTIVE25',
                description: 'Special Festive Offer: 25% off on all products',
                discount_type: 'percentage',
                discount_value: 25,
                min_order_amount: 1000,
                max_discount_amount: 500,
                start_date: new Date(),
                end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
                usage_limit: 200,
                status: 'active'
            }
        ];

        for (const off of offers) {
            await Offer.create({
                ...off,
                createdAt: new Date(),
                updatedAt: new Date()
            });
            console.log(`  ✓ Created: ${off.code}`);
        }

        console.log('\n✅ Database seeding completed successfully!');
        console.log(`\n📊 Summary:`);
        console.log(`  - Roles: 2`);
        console.log(`  - Users: 2 (Admin & Customer)`);
        console.log(`  - Categories: ${categories.length}`);
        console.log(`  - Products: ${products.length}`);
        console.log(`  - Locations: ${locations.length}`);
        console.log(`  - Offers: ${offers.length}`);
        console.log(`\n🔑 Admin Credentials:`);
        console.log(`  Email: admin@example.com`);
        console.log(`  Password: admin123`);
        console.log(`\n🔑 Customer Credentials:`);
        console.log(`  Email: customer@example.com`);
        console.log(`  Password: customer123`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
};

seedDatabase();
