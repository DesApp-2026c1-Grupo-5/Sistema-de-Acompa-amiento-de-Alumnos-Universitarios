'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class motivo_denuncia extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {

      motivo_denuncia.hasMany(models.denuncia, {
        foreignKey: 'motivo_id'
      });

    }
  }
  motivo_denuncia.init({
    id: DataTypes.INTEGER,
    descripcion: DataTypes.STRING,
    activo: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'motivo_denuncia',
  });
  return motivo_denuncia;
};