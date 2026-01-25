import productRepository from './product.repository.js';
import Category from '../category/category.model.js';
import ProductVariant from './product-variant.model.js';
import ProductImage from './product-image.model.js';
import { uploadToCloudinary, deleteFromCloudinary, extractPublicIdFromUrl } from '../../integrations/storage/cloudinary.utils.js';
import sequelize, { Op } from '../../database/connection.js';

class ProductService {
    /**
     * Enhanced getAllProducts with comprehensive filtering, sorting, and pagination
     */
    async getAllProducts(queryParams) {
        const {
            page = 1,
            limit = 20,
            sortBy = 'createdAt',
            sortOrder = 'DESC',
            category_id,
            subcategory_id,
            status = 'active',
            search,
            minPrice,
            maxPrice,
            inStock,
            brand,
            tags,
            is_featured,
            is_trending,
            is_new_arrival,
            sizes,
            colors,
            minRating
        } = queryParams;

        const offset = (page - 1) * limit;
        let whereClause = { status };

        // Category filtering
        if (subcategory_id) {
            whereClause.category_id = subcategory_id;
        } else if (category_id) {
            // Get all subcategories under this parent
            const subcategories = await Category.findAll({
                where: { parent_cat_id: category_id },
                attributes: ['id']
            });
            const categoryIds = [category_id, ...subcategories.map(sc => sc.id)];
            whereClause.category_id = { [Op.in]: categoryIds };
        }

        // Search functionality (case-insensitive, partial match)
        if (search) {
            whereClause[Op.or] = [
                { product_name: { [Op.like]: `%${search}%` } },
                { description: { [Op.like]: `%${search}%` } },
                { tags: { [Op.like]: `%${search}%` } },
                { brand: { [Op.like]: `%${search}%` } }
            ];
        }

        // Price range filtering
        if (minPrice || maxPrice) {
            whereClause.price = {};
            if (minPrice) whereClause.price[Op.gte] = parseFloat(minPrice);
            if (maxPrice) whereClause.price[Op.lte] = parseFloat(maxPrice);
        }

        // Stock filtering
        if (inStock === 'true') {
            whereClause.stock_quantity = { [Op.gt]: 0 };
        }

        // Brand filtering
        if (brand) {
            whereClause.brand = brand;
        }

        // Tags filtering
        if (tags) {
            whereClause.tags = { [Op.like]: `%${tags}%` };
        }

        // Featured/Trending/New Arrival filters
        if (is_featured === 'true') whereClause.is_featured = true;
        if (is_trending === 'true') whereClause.is_trending = true;
        if (is_new_arrival === 'true') whereClause.is_new_arrival = true;

        // Rating filter
        if (minRating) {
            whereClause.average_rating = { [Op.gte]: parseFloat(minRating) };
        }

        // Build include array
        const includeArray = [
            {
                model: Category,
                as: 'category',
                attributes: ['id', 'category_name', 'url_slug', 'parent_cat_id']
            },
            {
                model: ProductImage,
                as: 'images',
                where: { status: 'active' },
                required: false,
                order: [['image_order', 'ASC']]
            },
            {
                model: ProductVariant,
                as: 'variants',
                attributes: ['id', 'variant_name', 'variant_value', 'price_adjustment', 'stock_quantity', 'status'],
                required: false
            }
        ];

        // Size/Color filtering through variants
        if (sizes || colors) {
            const variantWhere = {};
            if (sizes) {
                const sizeArray = sizes.split(',');
                variantWhere[Op.and] = [
                    { variant_name: 'Size' },
                    { variant_value: { [Op.in]: sizeArray } }
                ];
            }
            if (colors) {
                const colorArray = colors.split(',');
                variantWhere[Op.and] = [
                    { variant_name: 'Color' },
                    { variant_value: { [Op.in]: colorArray } }
                ];
            }
            // Update variants include with where clause
            includeArray[2].where = variantWhere;
            includeArray[2].required = true;
        }

        const result = await productRepository.findAndCountAll({
            where: whereClause,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [[sortBy, sortOrder.toUpperCase()]],
            include: includeArray,
            distinct: true
        });

        return {
            products: result.rows,
            pagination: {
                total: result.count,
                currentPage: parseInt(page),
                totalPages: Math.ceil(result.count / limit),
                hasNextPage: parseInt(page) < Math.ceil(result.count / limit),
                hasPrevPage: parseInt(page) > 1,
                limit: parseInt(limit)
            },
            filters: {
                category_id,
                subcategory_id,
                search,
                minPrice,
                maxPrice,
                brand,
                tags,
                is_featured,
                is_trending,
                is_new_arrival
            }
        };
    }

    /**
     * Get Featured Products
     */
    async getFeaturedProducts(queryParams) {
        const { limit = 10, page = 1 } = queryParams;
        const offset = (page - 1) * limit;

        const result = await productRepository.findAndCountAll({
            where: {
                status: 'active',
                is_featured: true
            },
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['createdAt', 'DESC']],
            include: [
                { model: Category, as: 'category', attributes: ['id', 'category_name', 'url_slug'] },
                { model: ProductImage, as: 'images', where: { status: 'active' }, required: false }
            ]
        });

        return {
            products: result.rows,
            total: result.count,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(result.count / limit),
                hasNextPage: parseInt(page) < Math.ceil(result.count / limit)
            }
        };
    }

    /**
     * Get Trending Products
     */
    async getTrendingProducts(queryParams) {
        const { limit = 10, page = 1, period = 'week' } = queryParams;
        const offset = (page - 1) * limit;

        const now = new Date();
        let dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        if (period === 'month') dateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        if (period === 'year') dateFilter = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);

        const result = await productRepository.findAndCountAll({
            where: {
                status: 'active',
                is_trending: true,
                createdAt: { [Op.gte]: dateFilter }
            },
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['average_rating', 'DESC'], ['createdAt', 'DESC']],
            include: [
                { model: Category, as: 'category' },
                { model: ProductImage, as: 'images', where: { status: 'active' }, required: false }
            ]
        });

        return {
            products: result.rows,
            total: result.count,
            period,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(result.count / limit)
            }
        };
    }

    /**
     * Get New Arrivals
     */
    async getNewArrivals(queryParams) {
        const { limit = 10, page = 1, days = 30 } = queryParams;
        const offset = (page - 1) * limit;
        const daysAgo = new Date();
        daysAgo.setDate(daysAgo.getDate() - parseInt(days));

        const result = await productRepository.findAndCountAll({
            where: {
                status: 'active',
                is_new_arrival: true,
                createdAt: { [Op.gte]: daysAgo }
            },
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['createdAt', 'DESC']],
            include: [
                { model: Category, as: 'category' },
                { model: ProductImage, as: 'images', where: { status: 'active' }, required: false }
            ]
        });

        return {
            products: result.rows,
            total: result.count,
            days: parseInt(days),
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(result.count / limit)
            }
        };
    }

    /**
     * Get Best Sellers (based on ratings and reviews)
     */
    async getBestSellers(queryParams) {
        const { limit = 10, page = 1 } = queryParams;
        const offset = (page - 1) * limit;

        const result = await productRepository.findAndCountAll({
            where: {
                status: 'active',
                average_rating: { [Op.gte]: 4.0 },
                total_reviews: { [Op.gte]: 10 }
            },
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['average_rating', 'DESC'], ['total_reviews', 'DESC']],
            include: [
                { model: Category, as: 'category' },
                { model: ProductImage, as: 'images', where: { status: 'active' }, required: false }
            ]
        });

        return {
            products: result.rows,
            total: result.count,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(result.count / limit)
            }
        };
    }

    /**
     * Get Recommended Products
     */
    async getRecommendedProducts(queryParams) {
        const { product_id, category_id, limit = 6, exclude_current = true } = queryParams;

        let whereClause = { status: 'active' };
        let excludeIds = [];

        if (product_id) {
            const current = await productRepository.findByPk(product_id);
            if (current) {
                whereClause.category_id = current.category_id;
                if (exclude_current === 'true' || exclude_current === true) {
                    excludeIds.push(product_id);
                }
            }
        } else if (category_id) {
            whereClause.category_id = category_id;
        }

        if (excludeIds.length > 0) {
            whereClause.id = { [Op.notIn]: excludeIds };
        }

        const result = await productRepository.findAndCountAll({
            where: whereClause,
            limit: parseInt(limit),
            order: [[sequelize.literal('RAND()')]],
            include: [
                { model: Category, as: 'category' },
                { model: ProductImage, as: 'images', where: { status: 'active' }, required: false }
            ]
        });

        return {
            products: result.rows,
            total: result.count,
            type: product_id ? 'similar_product' : 'category_based'
        };
    }

    /**
     * Get Similar Products (based on category and price range)
     */
    async getSimilarProducts(productId, queryParams) {
        const { limit = 6 } = queryParams;

        const currentProduct = await productRepository.findByPk(productId);
        if (!currentProduct) {
            const error = new Error('Product not found');
            error.statusCode = 404;
            throw error;
        }

        const priceRange = currentProduct.price * 0.3; // 30% price range

        const result = await productRepository.findAndCountAll({
            where: {
                status: 'active',
                category_id: currentProduct.category_id,
                id: { [Op.ne]: productId },
                price: {
                    [Op.between]: [
                        currentProduct.price - priceRange,
                        currentProduct.price + priceRange
                    ]
                }
            },
            limit: parseInt(limit),
            order: [[sequelize.literal('RAND()')]],
            include: [
                { model: Category, as: 'category' },
                { model: ProductImage, as: 'images', where: { status: 'active' }, required: false }
            ]
        });

        return {
            products: result.rows,
            total: result.count
        };
    }

    /**
     * Advanced Search with autocomplete support
     */
    async searchProducts(queryParams) {
        const {
            q,
            page = 1,
            limit = 20,
            sortBy = 'relevance',
            sortOrder = 'DESC',
            category_id,
            minPrice,
            maxPrice,
            autocomplete = false
        } = queryParams;

        if (!q) {
            const error = new Error('Search query is required');
            error.statusCode = 400;
            throw error;
        }

        const offset = (page - 1) * limit;
        const searchTerm = q.trim();

        let whereClause = {
            status: 'active',
            [Op.or]: [
                { product_name: { [Op.like]: `%${searchTerm}%` } },
                { description: { [Op.like]: `%${searchTerm}%` } },
                { tags: { [Op.like]: `%${searchTerm}%` } },
                { brand: { [Op.like]: `%${searchTerm}%` } }
            ]
        };

        if (category_id) whereClause.category_id = category_id;

        if (minPrice || maxPrice) {
            whereClause.price = {};
            if (minPrice) whereClause.price[Op.gte] = parseFloat(minPrice);
            if (maxPrice) whereClause.price[Op.lte] = parseFloat(maxPrice);
        }

        // For autocomplete, return limited results with just names
        if (autocomplete === 'true') {
            const results = await productRepository.findAll({
                where: whereClause,
                attributes: ['id', 'product_name', 'url_slug', 'image_url', 'price'],
                limit: 10,
                order: [['product_name', 'ASC']]
            });
            return { suggestions: results };
        }

        // Determine sort order
        let orderClause;
        if (sortBy === 'relevance') {
            // Prioritize exact matches in product name
            orderClause = [
                [sequelize.literal(`CASE WHEN product_name LIKE '${searchTerm}%' THEN 1 WHEN product_name LIKE '%${searchTerm}%' THEN 2 ELSE 3 END`), 'ASC'],
                ['average_rating', 'DESC']
            ];
        } else {
            orderClause = [[sortBy, sortOrder.toUpperCase()]];
        }

        const result = await productRepository.findAndCountAll({
            where: whereClause,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: orderClause,
            include: [
                { model: Category, as: 'category', attributes: ['id', 'category_name', 'url_slug'] },
                { model: ProductImage, as: 'images', where: { status: 'active' }, required: false },
                { model: ProductVariant, as: 'variants', required: false }
            ],
            distinct: true
        });

        return {
            products: result.rows,
            searchTerm,
            pagination: {
                total: result.count,
                currentPage: parseInt(page),
                totalPages: Math.ceil(result.count / limit),
                hasNextPage: parseInt(page) < Math.ceil(result.count / limit),
                hasPrevPage: parseInt(page) > 1
            }
        };
    }

    /**
     * Get Product by ID with full details
     */
    async getProductById(id) {
        const product = await productRepository.getDetailedProduct({ id, status: 'active' });
        if (!product) {
            const error = new Error('Product not found');
            error.statusCode = 404;
            throw error;
        }
        return product;
    }

    /**
     * Get Product by Slug with full details
     */
    async getProductBySlug(slug) {
        const product = await productRepository.getDetailedProduct({ url_slug: slug, status: 'active' });
        if (!product) {
            const error = new Error('Product not found');
            error.statusCode = 404;
            throw error;
        }
        return product;
    }

    /**
     * Get Products by Category
     */
    async getProductsByCategory(categoryId, queryParams) {
        return this.getAllProducts({ ...queryParams, category_id: categoryId });
    }

    /**
     * Get available filter options for products
     */
    async getFilterOptions(queryParams) {
        const { category_id } = queryParams;
        let whereClause = { status: 'active' };

        if (category_id) {
            whereClause.category_id = category_id;
        }

        // Get unique brands
        const brands = await productRepository.findAll({
            where: whereClause,
            attributes: [[sequelize.fn('DISTINCT', sequelize.col('brand')), 'brand']],
            raw: true
        });

        // Get price range
        const priceRange = await productRepository.findOne({
            where: whereClause,
            attributes: [
                [sequelize.fn('MIN', sequelize.col('price')), 'minPrice'],
                [sequelize.fn('MAX', sequelize.col('price')), 'maxPrice']
            ],
            raw: true
        });

        // Get available sizes and colors from variants
        const sizes = await ProductVariant.findAll({
            where: { variant_name: 'Size', status: 'active' },
            attributes: [[sequelize.fn('DISTINCT', sequelize.col('variant_value')), 'size']],
            raw: true
        });

        const colors = await ProductVariant.findAll({
            where: { variant_name: 'Color', status: 'active' },
            attributes: [[sequelize.fn('DISTINCT', sequelize.col('variant_value')), 'color']],
            raw: true
        });

        return {
            brands: brands.map(b => b.brand).filter(Boolean),
            priceRange: {
                min: parseFloat(priceRange?.minPrice || 0),
                max: parseFloat(priceRange?.maxPrice || 1000)
            },
            sizes: sizes.map(s => s.size).filter(Boolean),
            colors: colors.map(c => c.color).filter(Boolean)
        };
    }

    // ... Keep existing create, update, delete methods from original service
    async createProduct(data, files) {
        // Keep original implementation
        const {
            product_name, url_slug, category_id, description,
            price, stock_quantity, status = 'active', variants,
            brand, tags, is_featured, is_trending, is_new_arrival,
            discount_percentage, original_price
        } = data;

        const existingProduct = await productRepository.findOne({ where: { url_slug } });
        if (existingProduct) {
            const error = new Error('URL slug already exists');
            error.statusCode = 409;
            throw error;
        }

        const category = await Category.findByPk(category_id);
        if (!category) {
            const error = new Error('Category not found');
            error.statusCode = 404;
            throw error;
        }

        let primaryImageUrl = null;
        const uploadedImages = [];

        if (files && files.length > 0) {
            if (files.length < 2) {
                const error = new Error('Minimum 2 images are required for a product');
                error.statusCode = 400;
                throw error;
            }
            if (files.length > 6) {
                const error = new Error('Maximum 6 images are allowed for a product');
                error.statusCode = 400;
                throw error;
            }

            try {
                for (let i = 0; i < files.length; i++) {
                    const file = files[i];
                    const uploadResult = await uploadToCloudinary(file.buffer, 'products');
                    uploadedImages.push({
                        image_url: uploadResult.url,
                        image_order: i,
                        is_primary: i === 0
                    });
                    if (i === 0) primaryImageUrl = uploadResult.url;
                }
            } catch (uploadError) {
                const error = new Error(`Failed to upload image: ${uploadError.message}`);
                error.statusCode = 500;
                throw error;
            }
        } else {
            const error = new Error('At least 2 images are required for a product');
            error.statusCode = 400;
            throw error;
        }

        const newProduct = await productRepository.create({
            product_name,
            url_slug,
            category_id,
            description,
            price: parseFloat(price),
            stock_quantity: parseInt(stock_quantity),
            status,
            image_url: primaryImageUrl,
            brand,
            tags,
            is_featured: is_featured === 'true' || is_featured === true,
            is_trending: is_trending === 'true' || is_trending === true,
            is_new_arrival: is_new_arrival === 'true' || is_new_arrival === true,
            discount_percentage: discount_percentage ? parseFloat(discount_percentage) : 0,
            original_price: original_price ? parseFloat(original_price) : null,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        for (const imageData of uploadedImages) {
            await productRepository.addImage({
                product_id: newProduct.id,
                ...imageData,
                status: 'active',
                createdAt: new Date(),
                updatedAt: new Date()
            });
        }

        if (variants) {
            let parsedVariants = variants;
            if (typeof variants === 'string') {
                try {
                    parsedVariants = JSON.parse(variants);
                } catch (e) {
                    console.error('Error parsing variants', e);
                }
            }

            if (Array.isArray(parsedVariants)) {
                for (const variant of parsedVariants) {
                    await productRepository.addVariant({
                        product_id: newProduct.id,
                        variant_name: variant.variant_name,
                        variant_value: variant.variant_value,
                        price_adjustment: parseFloat(variant.price_adjustment || 0),
                        stock_quantity: parseInt(variant.stock_quantity),
                        status: variant.status || 'active',
                        createdAt: new Date(),
                        updatedAt: new Date()
                    });
                }
            }
        }

        return newProduct;
    }

    async updateProduct(id, data, file) {
        // Keep original implementation with new fields
        const product = await productRepository.findByPk(id);
        if (!product) {
            const error = new Error('Product not found');
            error.statusCode = 404;
            throw error;
        }

        const {
            product_name, url_slug, category_id, description,
            price, stock_quantity, status, variants,
            brand, tags, is_featured, is_trending, is_new_arrival,
            discount_percentage, original_price
        } = data;

        if (url_slug && url_slug !== product.url_slug) {
            const existing = await productRepository.findOne({
                where: { url_slug, id: { [Op.ne]: id } }
            });
            if (existing) {
                const error = new Error('URL slug already exists');
                error.statusCode = 409;
                throw error;
            }
        }

        if (category_id) {
            const category = await Category.findByPk(category_id);
            if (!category) {
                const error = new Error('Category not found');
                error.statusCode = 404;
                throw error;
            }
        }

        let newImageUrl = product.image_url;
        if (file) {
            try {
                if (product.image_url && product.image_url.includes('cloudinary.com')) {
                    const oldPublicId = extractPublicIdFromUrl(product.image_url);
                    if (oldPublicId) await deleteFromCloudinary(oldPublicId);
                }
                const uploadResult = await uploadToCloudinary(file.buffer, 'products');
                newImageUrl = uploadResult.url;
            } catch (err) {
                const error = new Error(`Failed to upload image: ${err.message}`);
                error.statusCode = 500;
                throw error;
            }
        }

        await productRepository.update(product, {
            product_name,
            url_slug,
            category_id,
            description,
            price: price ? parseFloat(price) : undefined,
            stock_quantity: stock_quantity ? parseInt(stock_quantity) : undefined,
            status,
            image_url: newImageUrl,
            brand,
            tags,
            is_featured: is_featured !== undefined ? (is_featured === 'true' || is_featured === true) : undefined,
            is_trending: is_trending !== undefined ? (is_trending === 'true' || is_trending === true) : undefined,
            is_new_arrival: is_new_arrival !== undefined ? (is_new_arrival === 'true' || is_new_arrival === true) : undefined,
            discount_percentage: discount_percentage ? parseFloat(discount_percentage) : undefined,
            original_price: original_price ? parseFloat(original_price) : undefined,
            updatedAt: new Date()
        });

        if (variants) {
            let parsedVariants = variants;
            if (typeof variants === 'string') {
                try {
                    parsedVariants = JSON.parse(variants);
                } catch (e) { }
            }

            if (Array.isArray(parsedVariants)) {
                await productRepository.removeVariants(id);
                for (const variant of parsedVariants) {
                    await productRepository.addVariant({
                        product_id: id,
                        variant_name: variant.variant_name,
                        variant_value: variant.variant_value,
                        price_adjustment: parseFloat(variant.price_adjustment || 0),
                        stock_quantity: parseInt(variant.stock_quantity),
                        status: variant.status || 'active',
                        createdAt: new Date(),
                        updatedAt: new Date()
                    });
                }
            }
        }

        return product;
    }

    async deleteProduct(id) {
        // Keep original implementation
        const product = await productRepository.findByPk(id);
        if (!product) {
            const error = new Error('Product not found');
            error.statusCode = 404;
            throw error;
        }

        if (product.image_url && product.image_url.includes('cloudinary.com')) {
            try {
                const publicId = extractPublicIdFromUrl(product.image_url);
                if (publicId) await deleteFromCloudinary(publicId);
            } catch (e) {
                console.error('Failed to delete image', e);
            }
        }

        product.status = 'inactive';
        product.updatedAt = new Date();
        await product.save();

        await productRepository.removeVariantsWhere({ product_id: id });
        return true;
    }
}

export default new ProductService();
