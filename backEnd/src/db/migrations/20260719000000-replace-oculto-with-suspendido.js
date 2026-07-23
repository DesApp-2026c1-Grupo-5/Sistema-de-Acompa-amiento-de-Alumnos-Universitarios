'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.renameColumn(
      'posts',
      'oculto',
      'suspendido'
    );

    await queryInterface.sequelize.query(`
      UPDATE denuncias
      SET estado = 'suspendido'
      WHERE estado = 'verificada';
    `);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(`
      UPDATE denuncias
      SET estado = 'verificada'
      WHERE estado = 'suspendido';
    `);

    await queryInterface.renameColumn(
      'posts',
      'suspendido',
      'oculto'
    );
  },
};