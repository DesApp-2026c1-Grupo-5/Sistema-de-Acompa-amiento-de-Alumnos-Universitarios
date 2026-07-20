'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('actividad_creditos');

    if (!table.situacion_id) {
      await queryInterface.addColumn(
        'actividad_creditos',
        'situacion_id',
        {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'situacion_academicas',
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
        }
      );
    }
  },

  async down(queryInterface) {
    const table = await queryInterface.describeTable('actividad_creditos');

    if (table.situacion_id) {
      await queryInterface.removeColumn(
        'actividad_creditos',
        'situacion_id'
      );
    }
  },
};