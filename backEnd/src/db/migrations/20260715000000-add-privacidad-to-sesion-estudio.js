'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('sesion_estudios', 'privacidad', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'public',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('sesion_estudios', 'privacidad');
  },
};
