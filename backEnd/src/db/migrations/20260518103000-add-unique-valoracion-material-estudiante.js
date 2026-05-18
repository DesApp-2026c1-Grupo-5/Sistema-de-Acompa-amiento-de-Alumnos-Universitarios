'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.addIndex('valoracions', ['material_id', 'estudiante_id'], {
      unique: true,
      name: 'ux_valoracions_material_estudiante',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('valoracions', 'ux_valoracions_material_estudiante');
  },
};
