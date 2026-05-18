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

      estudiante.belongsTo(models.usuario, {
        foreignKey: 'usuario_id'
      });

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

      estudiante.hasMany(models.situacion_academica, {
        foreignKey: 'estudiante_id'
      });

      estudiante.hasMany(models.post, {
        foreignKey: 'estudiante_id'
      });

      estudiante.hasMany(models.voto_post, {
        foreignKey: 'estudiante_id'
      });

      estudiante.hasMany(models.sesion_estudio, {
        foreignKey: 'creador_id',
        as: 'sesiones_creadas'
      });

      estudiante.hasMany(models.inscripcion_sesion, {
        foreignKey: 'estudiante_id'
      });

      estudiante.hasMany(models.contacto, {
        foreignKey: 'estudiante_solicitante_id',
        as: 'contactos_solicitados'
      });

      estudiante.hasMany(models.contacto, {
        foreignKey: 'estudiante_receptor_id',
        as: 'contactos_recibidos'
      });

    }
  }
  estudiante.init({
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