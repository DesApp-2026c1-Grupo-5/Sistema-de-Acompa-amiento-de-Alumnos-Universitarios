'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn('estudiantes', 'localidad', {
        type: Sequelize.STRING(120),
        allowNull: true,
      }, { transaction });
      await queryInterface.addColumn('estudiantes', 'telefono', {
        type: Sequelize.STRING(32),
        allowNull: true,
      }, { transaction });
      await queryInterface.addColumn('estudiantes', 'fecha_nacimiento', {
        type: Sequelize.DATEONLY,
        allowNull: true,
      }, { transaction });
    });
  },

  async down(queryInterface) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn('estudiantes', 'fecha_nacimiento', { transaction });
      await queryInterface.removeColumn('estudiantes', 'telefono', { transaction });
      await queryInterface.removeColumn('estudiantes', 'localidad', { transaction });
    });
  },
};
