'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // Add new columns to products table for enhanced features
        await queryInterface.addColumn('products', 'brand', {
            type: Sequelize.STRING(255),
            allowNull: true,
            after: 'image_url'
        });

        await queryInterface.addColumn('products', 'tags', {
            type: Sequelize.TEXT,
            allowNull: true,
            comment: 'Comma-separated tags for search and filtering',
            after: 'brand'
        });

        await queryInterface.addColumn('products', 'is_featured', {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            after: 'tags'
        });

        await queryInterface.addColumn('products', 'is_trending', {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            after: 'is_featured'
        });

        await queryInterface.addColumn('products', 'is_new_arrival', {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            after: 'is_trending'
        });

        await queryInterface.addColumn('products', 'discount_percentage', {
            type: Sequelize.DECIMAL(5, 2),
            allowNull: true,
            defaultValue: 0,
            after: 'is_new_arrival'
        });

        await queryInterface.addColumn('products', 'original_price', {
            type: Sequelize.DECIMAL(10, 2),
            allowNull: true,
            after: 'discount_percentage'
        });

        await queryInterface.addColumn('products', 'average_rating', {
            type: Sequelize.DECIMAL(3, 2),
            allowNull: true,
            defaultValue: 0,
            after: 'original_price'
        });

        await queryInterface.addColumn('products', 'total_reviews', {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 0,
            after: 'average_rating'
        });
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
