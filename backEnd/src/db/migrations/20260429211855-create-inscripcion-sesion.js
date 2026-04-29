'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('inscripcion_sesions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      id: {
        type: Sequelize.INTEGER
      },
      sesion_id: {
        type: Sequelize.INTEGER
      },
      estudiante_id: {
        type: Sequelize.INTEGER
      },
      estado: {
        type: Sequelize.STRING
      },
      fecha_inscripcion: {
        type: Sequelize.DATE
      },
      notificado_recordatorio: {
        type: Sequelize.BOOLEAN
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('inscripcion_sesions');
  }
};