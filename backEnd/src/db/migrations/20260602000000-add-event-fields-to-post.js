'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('posts');

    if (!table.event_type) {
      await queryInterface.addColumn('posts', 'event_type', {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }

    if (!table.event_subject) {
      await queryInterface.addColumn('posts', 'event_subject', {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }
  },

  async down(queryInterface) {
    const table = await queryInterface.describeTable('posts');

    if (table.event_type) {
      await queryInterface.removeColumn('posts', 'event_type');
    }

    if (table.event_subject) {
      await queryInterface.removeColumn('posts', 'event_subject');
    }
  },
};
