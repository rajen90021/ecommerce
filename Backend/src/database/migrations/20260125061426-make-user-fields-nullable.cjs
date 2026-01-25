'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('users', 'email', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    // Remove unique constraint if it exists to avoid issues with multiple nulls (MySQL allows multiple nulls in unique, but just in case)
    // Actually Sequelize changeColumn might not naturally handle index changes well.

    await queryInterface.changeColumn('users', 'password', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    const tableInfo = await queryInterface.describeTable('users');
    if (!tableInfo.firebase_uid) {
      await queryInterface.addColumn('users', 'firebase_uid', {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true,
      });
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('users', 'firebase_uid');

    await queryInterface.changeColumn('users', 'email', {
      type: Sequelize.STRING,
      allowNull: false,
    });
    await queryInterface.changeColumn('users', 'password', {
      type: Sequelize.STRING,
      allowNull: false,
    });
  }
};
