'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class estudiante extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {

      estudiante.hasMany(models.material, {
        foreignKey: 'estudiante_id'
      });

      estudiante.hasMany(models.valoracion, {
        foreignKey: 'estudiante_id'
      });

      estudiante.hasMany(models.denuncia, {
        foreignKey: 'denunciante_id',
        as: 'denuncias_realizadas'
      });

    }
  }
  estudiante.init({
    id: DataTypes.INTEGER,
    usuario_id: DataTypes.INTEGER,
    nombre: DataTypes.STRING,
    apellido: DataTypes.STRING,
    foto_url: DataTypes.STRING,
    privacidad: DataTypes.STRING,
    pub_inscripciones: DataTypes.BOOLEAN,
    pub_regularizaciones: DataTypes.BOOLEAN,
    pub_aprobaciones: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'estudiante',
  });
  return estudiante;
};