'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class inscripcion_sesion extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {

      inscripcion_sesion.belongsTo(models.sesion_estudio, {
        foreignKey: 'sesion_id'
      });

      inscripcion_sesion.belongsTo(models.estudiante, {
        foreignKey: 'estudiante_id'
      });

    }
  }
  inscripcion_sesion.init({
    estado: DataTypes.STRING,
    fecha_inscripcion: DataTypes.DATE,
    notificado_recordatorio: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'inscripcion_sesion',
  });
  return inscripcion_sesion;
};