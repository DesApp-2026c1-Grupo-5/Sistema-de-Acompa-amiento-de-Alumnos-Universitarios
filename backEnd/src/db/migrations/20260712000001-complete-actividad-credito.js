'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('actividad_creditos', 'situacion_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'situacion_academicas',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });

    await queryInterface.addColumn('actividad_creditos', 'estado', {
      type: Sequelize.ENUM('pendiente', 'aprobada'),
      allowNull: false,
      defaultValue: 'pendiente',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('actividad_creditos', 'estado');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_actividad_creditos_estado";');
    await queryInterface.removeColumn('actividad_creditos', 'situacion_id');
  },
};
