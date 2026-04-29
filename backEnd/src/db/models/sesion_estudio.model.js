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
      // define association here
    }
  }
  sesion_estudio.init({
    id: DataTypes.INTEGER,
    creador_id: DataTypes.INTEGER,
    materia_id: DataTypes.INTEGER,
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