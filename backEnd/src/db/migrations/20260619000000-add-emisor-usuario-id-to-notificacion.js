'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('notificacions');

    if (!table.emisor_usuario_id) {
      await queryInterface.addColumn(
        'notificacions',
        'emisor_usuario_id',
        {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'usuarios',
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL',
        }
      );
    }
  },

  async down(queryInterface) {
    const table = await queryInterface.describeTable('notificacions');

    if (table.emisor_usuario_id) {
      await queryInterface.removeColumn(
        'notificacions',
        'emisor_usuario_id'
      );
    }
  },
};