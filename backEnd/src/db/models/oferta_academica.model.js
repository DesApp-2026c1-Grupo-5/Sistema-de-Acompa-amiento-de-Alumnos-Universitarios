'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class oferta_academica extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  oferta_academica.init({
    id: DataTypes.INTEGER,
    materia_id: DataTypes.INTEGER,
    anio: DataTypes.INTEGER,
    cuatrimestre: DataTypes.INTEGER,
    turno: DataTypes.STRING,
    aula: DataTypes.STRING,
    docente: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'oferta_academica',
  });
  return oferta_academica;
};