'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class sesion_estudio extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {

      sesion_estudio.belongsTo(models.estudiante, {
        foreignKey: 'creador_id',
        as: 'creador'
      });

      sesion_estudio.belongsTo(models.materia, {
        foreignKey: 'materia_id'
      });

      sesion_estudio.hasMany(models.inscripcion_sesion, {
        foreignKey: 'sesion_id'
      });

    }
  }
  sesion_estudio.init({
    tema: DataTypes.STRING,
    tipo: DataTypes.STRING,
    link_ubicacion: DataTypes.STRING,
    fecha_hora: DataTypes.DATE,
    duracion_minutos: DataTypes.INTEGER,
    cupos_max: DataTypes.INTEGER,
    descripcion: DataTypes.STRING,
    requiere_aprobacion: DataTypes.BOOLEAN,
    cancelada: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'sesion_estudio',
  });
  return sesion_estudio;
};