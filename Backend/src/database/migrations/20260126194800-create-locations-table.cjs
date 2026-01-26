'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('locations', {
            id: {
                type: Sequelize.UUID,
                primaryKey: true,
                defaultValue: Sequelize.UUIDV4
            },
            city_name: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true
            },
            state: {
                type: Sequelize.STRING,
                allowNull: true,
                defaultValue: 'West Bengal'
            },
            is_active: {
                type: Sequelize.BOOLEAN,
                defaultValue: true
            },
            delivery_charge: {
                type: Sequelize.DECIMAL(10, 2),
                defaultValue: 50.00
            },
            min_order_amount: {
                type: Sequelize.DECIMAL(10, 2),
                defaultValue: 0.00
            },
            created_at: {
                type: Sequelize.DATE,
                allowNull: true
            },
            updated_at: {
                type: Sequelize.DATE,
                allowNull: true
            }
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('locations');
    }
};
