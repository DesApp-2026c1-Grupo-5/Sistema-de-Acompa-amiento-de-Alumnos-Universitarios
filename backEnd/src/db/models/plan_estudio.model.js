'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class plan_estudio extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {

      plan_estudio.belongsTo(models.carrera, {
        foreignKey: 'carrera_id'
      });

      plan_estudio.hasMany(models.materia, {
        foreignKey: 'plan_id',
        as: 'materias'
      });

      plan_estudio.hasMany(models.situacion_academica, {
        foreignKey: 'plan_id'
      });

    }
  }
  plan_estudio.init({
    nombre: DataTypes.STRING,
    anio: DataTypes.INTEGER,
    estado: DataTypes.STRING,
    condiciones_creditos: DataTypes.STRING,
    condiciones_unahur: DataTypes.STRING,
    creditos_requeridos: DataTypes.INTEGER,
    niveles_ingles_requeridos: DataTypes.INTEGER,
    materias_unahur: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'plan_estudio',
  });
  return plan_estudio;
};