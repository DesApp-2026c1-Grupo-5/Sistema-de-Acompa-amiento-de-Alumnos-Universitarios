'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class contacto extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {

      contacto.belongsTo(models.estudiante, {
        foreignKey: 'estudiante_solicitante_id',
        as: 'solicitante'
      });

      contacto.belongsTo(models.estudiante, {
        foreignKey: 'estudiante_receptor_id',
        as: 'receptor'
      });

    }
  }
  contacto.init({
    estado: DataTypes.STRING,
    fecha_solicitud: DataTypes.DATE,
    fecha_respuesta: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'contacto',
  });
  return contacto;
};