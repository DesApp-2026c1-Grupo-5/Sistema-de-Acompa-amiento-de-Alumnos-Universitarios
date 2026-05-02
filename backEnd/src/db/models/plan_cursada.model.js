'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class plan_cursada extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  plan_cursada.init({
    id: DataTypes.INTEGER,
    situacion_id: DataTypes.INTEGER,
    nombre: DataTypes.STRING,
    created_at: DataTypes.DATE,
    activo: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'plan_cursada',
    timestamps: false,
  });
  return plan_cursada;
};