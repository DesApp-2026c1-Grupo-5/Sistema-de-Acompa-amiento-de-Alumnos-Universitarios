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
      // define association here
    }
  }
  estado_materia.init({
    id: DataTypes.INTEGER,
    situacion_id: DataTypes.INTEGER,
    materia_id: DataTypes.INTEGER,
    estado: DataTypes.STRING,
    anio: DataTypes.INTEGER,
    cuatrimestre: DataTypes.INTEGER,
    nota: DataTypes.FLOAT,
    fecha: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'estado_materia',
  });
  return estado_materia;
};