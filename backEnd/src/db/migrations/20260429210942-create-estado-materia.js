'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('estado_materia', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      id: {
        type: Sequelize.INTEGER
      },
      situacion_id: {
        type: Sequelize.INTEGER
      },
      materia_id: {
        type: Sequelize.INTEGER
      },
      estado: {
        type: Sequelize.STRING
      },
      anio: {
        type: Sequelize.INTEGER
      },
      cuatrimestre: {
        type: Sequelize.INTEGER
      },
      nota: {
        type: Sequelize.FLOAT
      },
      fecha: {
        type: Sequelize.DATE
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
    await queryInterface.dropTable('estado_materia');
  }
};