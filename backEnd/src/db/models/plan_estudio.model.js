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
      // define association here
    }
  }
  plan_estudio.init({
    id: DataTypes.INTEGER,
    carrera_id: DataTypes.INTEGER,
    nombre: DataTypes.STRING,
    estado: DataTypes.STRING,
    condiciones_creditos: DataTypes.STRING,
    condiciones_unahur: DataTypes.STRING,
    creditos_requeridos: DataTypes.INTEGER,
    niveles_ingles_requeridos: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'plan_estudio',
  });
  return plan_estudio;
};