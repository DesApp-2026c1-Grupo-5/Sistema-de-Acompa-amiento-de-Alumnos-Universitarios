'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('plan_cursada_items');

    const addIfMissing = async (name, definition) => {
      if (!table[name]) {
        await queryInterface.addColumn('plan_cursada_items', name, definition);
      }
    };

    await addIfMissing('plan_id', { type: Sequelize.INTEGER, allowNull: true });
    await addIfMissing('materia_id', { type: Sequelize.INTEGER, allowNull: true });
    await addIfMissing('horas', { type: Sequelize.INTEGER, allowNull: true });
    await addIfMissing('horas_extra', { type: Sequelize.INTEGER, allowNull: true });
  },

  async down(queryInterface) {
    const table = await queryInterface.describeTable('plan_cursada_items');

    const removeIfPresent = async (name) => {
      if (table[name]) {
        await queryInterface.removeColumn('plan_cursada_items', name);
      }
    };

    await removeIfPresent('horas_extra');
    await removeIfPresent('horas');
    // plan_id / materia_id se dejan: pueden ser parte del esquema base creado por sync().
  },
};
