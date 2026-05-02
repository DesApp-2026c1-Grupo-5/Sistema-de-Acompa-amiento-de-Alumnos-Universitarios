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
      // define association here
    }
  }
  contacto.init({
    id: DataTypes.INTEGER,
    estudiante_solicitante_id: DataTypes.INTEGER,
    estudiante_receptor_id: DataTypes.INTEGER,
    estado: DataTypes.STRING,
    fecha_solicitud: DataTypes.DATE,
    fecha_respuesta: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'contacto',
  });
  return contacto;
};