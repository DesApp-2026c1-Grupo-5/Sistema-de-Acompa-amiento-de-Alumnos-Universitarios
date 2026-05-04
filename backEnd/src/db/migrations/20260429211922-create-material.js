'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('materials', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      tipo: {
        type: Sequelize.STRING
      },
      titulo: {
        type: Sequelize.STRING
      },
      descripcion: {
        type: Sequelize.STRING
      },
      url_o_path: {
        type: Sequelize.STRING
      },
      formato: {
        type: Sequelize.STRING
      },
      subtipo_link: {
        type: Sequelize.STRING
      },
      discord_servidor: {
        type: Sequelize.STRING
      },
      discord_canal: {
        type: Sequelize.STRING
      },
      size_bytes: {
        type: Sequelize.INTEGER
      },
      suspendido: {
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
    await queryInterface.dropTable('materials');
  }
};