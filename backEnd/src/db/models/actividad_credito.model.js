'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class actividad_credito extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {

      actividad_credito.belongsTo(models.situacion_academica, {
        foreignKey: 'situacion_id'
      });

    }
  }
  actividad_credito.init({
    descripcion: DataTypes.STRING,
    creditos: DataTypes.INTEGER,
    fecha: DataTypes.DATE,
    comprobante_url: DataTypes.STRING,
    estado: {
      type: DataTypes.ENUM('pendiente', 'aprobada'),
      defaultValue: 'pendiente',
    },
  }, {
    sequelize,
    modelName: 'actividad_credito',
  });
  return actividad_credito;
};