'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const tableInfo = await queryInterface.describeTable('products');

        // Add new columns to products table for enhanced features if they don't exist
        if (!tableInfo.brand) {
            await queryInterface.addColumn('products', 'brand', {
                type: Sequelize.STRING(255),
                allowNull: true,
                after: 'image_url'
            });
        }

        if (!tableInfo.tags) {
            await queryInterface.addColumn('products', 'tags', {
                type: Sequelize.TEXT,
                allowNull: true,
                comment: 'Comma-separated tags for search and filtering',
                after: 'brand'
            });
        }

        if (!tableInfo.is_featured) {
            await queryInterface.addColumn('products', 'is_featured', {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false,
                after: 'tags'
            });
        }

        if (!tableInfo.is_trending) {
            await queryInterface.addColumn('products', 'is_trending', {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false,
                after: 'is_featured'
            });
        }

        if (!tableInfo.is_new_arrival) {
            await queryInterface.addColumn('products', 'is_new_arrival', {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false,
                after: 'is_trending'
            });
        }

        if (!tableInfo.discount_percentage) {
            await queryInterface.addColumn('products', 'discount_percentage', {
                type: Sequelize.DECIMAL(5, 2),
                allowNull: true,
                defaultValue: 0,
                after: 'is_new_arrival'
            });
        }

        if (!tableInfo.original_price) {
            await queryInterface.addColumn('products', 'original_price', {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: true,
                after: 'discount_percentage'
            });
        }

        if (!tableInfo.average_rating) {
            await queryInterface.addColumn('products', 'average_rating', {
                type: Sequelize.DECIMAL(3, 2),
                allowNull: true,
                defaultValue: 0,
                after: 'original_price'
            });
        }

        if (!tableInfo.total_reviews) {
            await queryInterface.addColumn('products', 'total_reviews', {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0,
                after: 'average_rating'
            });
        }
    },

    async down(queryInterface, Sequelize) {
        // Remove columns in reverse order
        await queryInterface.removeColumn('products', 'total_reviews');
        await queryInterface.removeColumn('products', 'average_rating');
        await queryInterface.removeColumn('products', 'original_price');
        await queryInterface.removeColumn('products', 'discount_percentage');
        await queryInterface.removeColumn('products', 'is_new_arrival');
        await queryInterface.removeColumn('products', 'is_trending');
        await queryInterface.removeColumn('products', 'is_featured');
        await queryInterface.removeColumn('products', 'tags');
        await queryInterface.removeColumn('products', 'brand');
    }
};
