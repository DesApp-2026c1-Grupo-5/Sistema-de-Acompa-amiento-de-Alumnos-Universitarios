'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class plan_cursada_item extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  plan_cursada_item.init({
    anio_proyectado: DataTypes.INTEGER,
    cuatrimestre_proyectado: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'plan_cursada_item',
  });
  return plan_cursada_item;
};