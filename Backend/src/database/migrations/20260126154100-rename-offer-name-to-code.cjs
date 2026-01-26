'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // 1. Rename offer_name to code
        await queryInterface.renameColumn('offers', 'offer_name', 'code');

        // 2. Add unique constraint to code
        await queryInterface.addConstraint('offers', {
            fields: ['code'],
            type: 'unique',
            name: 'unique_offer_code'
        });
    },

    async down(queryInterface, Sequelize) {
        // 1. Remove unique constraint
        await queryInterface.removeConstraint('offers', 'unique_offer_code');

        // 2. Rename code back to offer_name
        await queryInterface.renameColumn('offers', 'code', 'offer_name');
    }
};
