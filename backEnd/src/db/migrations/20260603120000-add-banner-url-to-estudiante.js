'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('estudiantes');

    if (!table.banner_url) {
      await queryInterface.addColumn('estudiantes', 'banner_url', {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }
  },

  async down(queryInterface) {
    const table = await queryInterface.describeTable('estudiantes');

    if (table.banner_url) {
      await queryInterface.removeColumn('estudiantes', 'banner_url');
    }
  },
};