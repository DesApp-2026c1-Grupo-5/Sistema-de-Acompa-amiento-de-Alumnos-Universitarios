'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class notificacion extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {

      notificacion.belongsTo(models.usuario, {
        foreignKey: 'usuario_id'
      });

    }
  }
  notificacion.init({
    tipo: DataTypes.STRING,
    mensaje: DataTypes.STRING,
    referencia_tipo: DataTypes.STRING,
    referencia_id: DataTypes.INTEGER,
    leida: DataTypes.BOOLEAN,
  }, {
    sequelize,
    modelName: 'notificacion',
  });
  return notificacion;
};