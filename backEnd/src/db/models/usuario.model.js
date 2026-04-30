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
    email: DataTypes.STRING,
    password_hash: DataTypes.STRING,
    tipo: DataTypes.STRING,
    activo: DataTypes.BOOLEAN,
  }, {
    sequelize,
    modelName: 'usuario',
  });
  return usuario;
};