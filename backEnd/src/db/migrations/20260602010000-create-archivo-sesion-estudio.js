'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('archivo_sesion_estudios', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      sesion_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'sesion_estudios',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      estudiante_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'estudiantes',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      nombre_original: {
        type: Sequelize.STRING,
      },
      nombre_archivo: {
        type: Sequelize.STRING,
      },
      mime_type: {
        type: Sequelize.STRING,
      },
      size_bytes: {
        type: Sequelize.INTEGER,
      },
      url_o_path: {
        type: Sequelize.STRING,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('archivo_sesion_estudios');
  },
};
