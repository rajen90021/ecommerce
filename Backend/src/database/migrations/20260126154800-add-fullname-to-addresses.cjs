'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('addresses', 'full_name', {
            type: Sequelize.STRING,
            allowNull: true,
            after: 'user_id'
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('addresses', 'full_name');
    }
};
