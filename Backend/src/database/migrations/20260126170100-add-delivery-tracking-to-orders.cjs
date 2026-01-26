'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // 1. Update status enum to include new values
        await queryInterface.sequelize.query(`
      ALTER TABLE orders 
      MODIFY COLUMN status ENUM('placed', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'returned') 
      NOT NULL DEFAULT 'placed'
    `);

        // 2. Update payment_status enum to include refunded
        await queryInterface.sequelize.query(`
      ALTER TABLE orders 
      MODIFY COLUMN payment_status ENUM('paid', 'not_paid', 'refunded') 
      NOT NULL DEFAULT 'not_paid'
    `);

        // 3. Add delivery tracking fields
        await queryInterface.addColumn('orders', 'tracking_number', {
            type: Sequelize.STRING,
            allowNull: true,
            after: 'payment_transaction_id'
        });

        await queryInterface.addColumn('orders', 'delivery_partner', {
            type: Sequelize.STRING,
            allowNull: true,
            after: 'tracking_number'
        });

        await queryInterface.addColumn('orders', 'estimated_delivery_date', {
            type: Sequelize.DATE,
            allowNull: true,
            after: 'delivery_partner'
        });

        await queryInterface.addColumn('orders', 'actual_delivery_date', {
            type: Sequelize.DATE,
            allowNull: true,
            after: 'estimated_delivery_date'
        });

        await queryInterface.addColumn('orders', 'delivery_notes', {
            type: Sequelize.TEXT,
            allowNull: true,
            after: 'actual_delivery_date'
        });
    },

    async down(queryInterface, Sequelize) {
        // Remove delivery tracking fields
        await queryInterface.removeColumn('orders', 'delivery_notes');
        await queryInterface.removeColumn('orders', 'actual_delivery_date');
        await queryInterface.removeColumn('orders', 'estimated_delivery_date');
        await queryInterface.removeColumn('orders', 'delivery_partner');
        await queryInterface.removeColumn('orders', 'tracking_number');

        // Revert status enum to original values
        await queryInterface.sequelize.query(`
      ALTER TABLE orders 
      MODIFY COLUMN status ENUM('placed', 'processing', 'shipping', 'delivered') 
      NOT NULL DEFAULT 'placed'
    `);

        // Revert payment_status enum to original values
        await queryInterface.sequelize.query(`
      ALTER TABLE orders 
      MODIFY COLUMN payment_status ENUM('paid', 'not_paid') 
      NOT NULL DEFAULT 'not_paid'
    `);
    }
};
