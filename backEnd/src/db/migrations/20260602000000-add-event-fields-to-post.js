'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('posts', 'event_type', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('posts', 'event_subject', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('posts', 'event_subject');
    await queryInterface.removeColumn('posts', 'event_type');
  },
};
