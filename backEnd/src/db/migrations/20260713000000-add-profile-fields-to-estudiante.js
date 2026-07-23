'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('estudiantes');

    if (!table.localidad) {
      await queryInterface.addColumn(
        'estudiantes',
        'localidad',
        {
          type: Sequelize.STRING,
          allowNull: true,
        }
      );
    }

    if (!table.bio) {
      await queryInterface.addColumn(
        'estudiantes',
        'bio',
        {
          type: Sequelize.TEXT,
          allowNull: true,
        }
      );
    }

    if (!table.telefono) {
      await queryInterface.addColumn(
        'estudiantes',
        'telefono',
        {
          type: Sequelize.STRING,
          allowNull: true,
        }
      );
    }

    if (!table.fecha_nacimiento) {
      await queryInterface.addColumn(
        'estudiantes',
        'fecha_nacimiento',
        {
          type: Sequelize.DATEONLY,
          allowNull: true,
        }
      );
    }
  },

  async down(queryInterface) {
    const table = await queryInterface.describeTable('estudiantes');

    if (table.fecha_nacimiento) {
      await queryInterface.removeColumn(
        'estudiantes',
        'fecha_nacimiento'
      );
    }

    if (table.telefono) {
      await queryInterface.removeColumn(
        'estudiantes',
        'telefono'
      );
    }

    if (table.bio) {
      await queryInterface.removeColumn(
        'estudiantes',
        'bio'
      );
    }

    if (table.localidad) {
      await queryInterface.removeColumn(
        'estudiantes',
        'localidad'
      );
    }
  },
};