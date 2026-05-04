'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class situacion_academica extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {

      situacion_academica.belongsTo(models.estudiante, {
        foreignKey: 'estudiante_id'
      });

      situacion_academica.belongsTo(models.plan_estudio, {
        foreignKey: 'plan_id'
      });

      situacion_academica.hasMany(models.estado_materia, {
        foreignKey: 'situacion_id'
      });

      situacion_academica.hasMany(models.actividad_credito, {
        foreignKey: 'situacion_id'
      });

      situacion_academica.hasMany(models.plan_cursada, {
        foreignKey: 'situacion_id'
      });

    }
  }
  situacion_academica.init({
    fecha_inicio: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'situacion_academica',
  });
  return situacion_academica;
};