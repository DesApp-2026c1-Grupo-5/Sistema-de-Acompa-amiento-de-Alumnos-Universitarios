'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('denuncia', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      detalle: {
        type: Sequelize.STRING
      },
      estado: {
        type: Sequelize.STRING
      },
      admin_revisor_id: {
        type: Sequelize.INTEGER
      },
      fecha_creacion: {
        type: Sequelize.DATE
      },
      fecha_resolucion: {
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
    await queryInterface.dropTable('denuncia');
  }
};