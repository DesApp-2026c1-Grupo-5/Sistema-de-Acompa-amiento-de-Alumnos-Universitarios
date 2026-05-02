'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class materia extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {

      materia.hasMany(models.material, {
        foreignKey: 'materia_id'
      });

    }
  }
  materia.init({
    id: DataTypes.INTEGER,
    plan_id: DataTypes.INTEGER,
    nombre: DataTypes.STRING,
    anio_cursada: DataTypes.INTEGER,
    tipo: DataTypes.STRING,
    carga_horaria_semanal: DataTypes.INTEGER,
    es_optativa: DataTypes.BOOLEAN,
    es_unahur: DataTypes.BOOLEAN,
    creditos_otorga: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'materia',
  });
  return materia;
};