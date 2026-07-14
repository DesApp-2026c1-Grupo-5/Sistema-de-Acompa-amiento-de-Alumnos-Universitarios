'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class estado_materia extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {

      estado_materia.belongsTo(models.situacion_academica, {
        foreignKey: 'situacion_id'
      });

      estado_materia.belongsTo(models.materia, {
        foreignKey: 'materia_id'
      });

      estado_materia.hasMany(models.final, {
        foreignKey: 'estado_materia_id'
      });

    }
  }
  estado_materia.init({
    situacion_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    materia_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    estado: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'pendiente',
      validate: {
        isIn: [['pendiente', 'cursando', 'regular', 'aprobada']],
      },
    },
    anio: DataTypes.INTEGER,
    cuatrimestre: DataTypes.INTEGER,
    nota: DataTypes.FLOAT,
    fecha: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'estado_materia',
    indexes: [
      {
        unique: true,
        fields: ['situacion_id', 'materia_id'],
        name: 'estado_materias_situacion_materia_unique',
      },
    ],
  });
  return estado_materia;
};
