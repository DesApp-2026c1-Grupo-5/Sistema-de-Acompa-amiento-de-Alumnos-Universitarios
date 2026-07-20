'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('plan_estudios');

    if (!table.materias_unahur) {
      await queryInterface.addColumn(
        'plan_estudios',
        'materias_unahur',
        {
          type: Sequelize.INTEGER,
          allowNull: true,
        }
      );
    }
  },

  async down(queryInterface) {
    const table = await queryInterface.describeTable('plan_estudios');

    if (table.materias_unahur) {
      await queryInterface.removeColumn(
        'plan_estudios',
        'materias_unahur'
      );
    }
  },
};