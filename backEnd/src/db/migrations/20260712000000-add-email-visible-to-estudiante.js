'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('estudiantes');

    if (!table.email_visible) {
      await queryInterface.addColumn(
        'estudiantes',
        'email_visible',
        {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: true,
        }
      );
    }
  },

  async down(queryInterface) {
    const table = await queryInterface.describeTable('estudiantes');

    if (table.email_visible) {
      await queryInterface.removeColumn(
        'estudiantes',
        'email_visible'
      );
    }
  },
};
