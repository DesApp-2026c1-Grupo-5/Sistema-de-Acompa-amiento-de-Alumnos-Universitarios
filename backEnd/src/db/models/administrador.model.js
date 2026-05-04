'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class administrador extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {

      administrador.belongsTo(models.usuario, {
        foreignKey: 'usuario_id'
      });

      administrador.belongsTo(models.administrador, {
        foreignKey: 'creado_por',
        as: 'creador'
      });

      administrador.hasMany(models.administrador, {
        foreignKey: 'creado_por',
        as: 'creados'
      });

      administrador.hasMany(models.denuncia, {
        foreignKey: 'admin_revisor_id',
        as: 'denuncias_revisadas'
      });

    }
  }
  administrador.init({
    nombre: DataTypes.STRING,
    apellido: DataTypes.STRING,
    creado_por: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'administrador',
  });
  return administrador;
};