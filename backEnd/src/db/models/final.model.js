'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class final extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  final.init({
    id: DataTypes.INTEGER,
    estado_materia_id: DataTypes.INTEGER,
    fecha: DataTypes.DATE,
    nota: DataTypes.FLOAT,
    aprobado: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'final',
  });
  return final;
};