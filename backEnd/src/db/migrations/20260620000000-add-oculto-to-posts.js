'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('posts');

    if (!table.oculto) {
      await queryInterface.addColumn('posts', 'oculto', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      });
    }
  },

  async down(queryInterface) {
    const table = await queryInterface.describeTable('posts');

    if (table.oculto) {
      await queryInterface.removeColumn('posts', 'oculto');
    }
  },
};