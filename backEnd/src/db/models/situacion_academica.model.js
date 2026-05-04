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
      // define association here
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