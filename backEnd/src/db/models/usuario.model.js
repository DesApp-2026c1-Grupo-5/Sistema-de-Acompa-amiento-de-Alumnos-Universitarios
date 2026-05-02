'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class usuario extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {

      usuario.hasMany(models.notificacion, {
        foreignKey: 'usuario_id'
      });

    }
  }
  usuario.init({
    id: DataTypes.INTEGER,
    email: DataTypes.STRING,
    password_hash: DataTypes.STRING,
    tipo: DataTypes.STRING,
    activo: DataTypes.BOOLEAN,
    created_at: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'usuario',
    timestamps: false,
  });
  return usuario;
};