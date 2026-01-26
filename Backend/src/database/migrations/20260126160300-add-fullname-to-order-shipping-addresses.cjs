'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('order_shipping_addresses', 'full_name', {
            type: Sequelize.STRING,
            allowNull: true,
            after: 'order_id'
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('order_shipping_addresses', 'full_name');
    }
};
