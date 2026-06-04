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

      materia.belongsTo(models.plan_estudio, {
        foreignKey: 'plan_id'
      });

      materia.hasMany(models.material, {
        foreignKey: 'materia_id'
      });

      materia.hasMany(models.oferta_academica, {
        foreignKey: 'materia_id'
      });

      materia.hasMany(models.estado_materia, {
        foreignKey: 'materia_id'
      });

      materia.hasMany(models.sesion_estudio, {
        foreignKey: 'materia_id'
      });

      materia.hasMany(models.plan_cursada_item, {
        foreignKey: 'materia_id'
      });

      materia.hasMany(models.correlatividad, {
        foreignKey: 'materia_id',
        as: 'correlatividades'
      });

      materia.hasMany(models.correlatividad, {
        foreignKey: 'materia_requisito_id',
        as: 'requerida_en'
      });

    }
  }
  materia.init({
    codigo: DataTypes.STRING,
    nombre: DataTypes.STRING,
    anio_cursada: DataTypes.INTEGER,
    tipo: DataTypes.STRING,
    modalidad: DataTypes.STRING,
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