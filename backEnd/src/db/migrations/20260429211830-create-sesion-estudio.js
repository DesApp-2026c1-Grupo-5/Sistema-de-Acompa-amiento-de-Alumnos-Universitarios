'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('sesion_estudios', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      creador_id: {
        type: Sequelize.INTEGER
      },
      materia_id: {
        type: Sequelize.INTEGER
      },
      tema: {
        type: Sequelize.STRING
      },
      tipo: {
        type: Sequelize.STRING
      },
      link_ubicacion: {
        type: Sequelize.STRING
      },
      fecha_hora: {
        type: Sequelize.DATE
      },
      duracion_minutos: {
        type: Sequelize.INTEGER
      },
      cupos_max: {
        type: Sequelize.INTEGER
      },
      descripcion: {
        type: Sequelize.STRING
      },
      requiere_aprobacion: {
        type: Sequelize.BOOLEAN
      },
      cancelada: {
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
    await queryInterface.dropTable('sesion_estudios');
  }
};