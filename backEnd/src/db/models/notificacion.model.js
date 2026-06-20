'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class notificacion extends Model {
    static associate(models) {
      notificacion.belongsTo(models.usuario, {
        foreignKey: 'usuario_id'
      });

      notificacion.belongsTo(models.usuario, {
        as: 'emisor',
        foreignKey: 'emisor_usuario_id'
      });
    }
  }
  notificacion.init({
    usuario_id: DataTypes.INTEGER,
    emisor_usuario_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    titulo: DataTypes.STRING,
    tipo: DataTypes.STRING,
    mensaje: DataTypes.STRING,
    referencia_tipo: DataTypes.STRING,
    referencia_id: DataTypes.INTEGER,
    action_url: DataTypes.STRING,
    leida: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  }, {
    sequelize,
    modelName: 'notificacion',
    tableName: 'notificacions',
    timestamps: true,
  });
  return notificacion;
};
