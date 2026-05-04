'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class carrera extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {

      carrera.hasMany(models.plan_estudio, {
        foreignKey: 'carrera_id'
      });

    }
  }
  carrera.init({
    nombre: DataTypes.STRING,
    titulo: DataTypes.STRING,
    instituto: DataTypes.STRING,
    duracion_anios: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'carrera',
  });
  return carrera;
};