'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class denuncia extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {

      denuncia.belongsTo(models.material, {
        foreignKey: 'material_id'
      });

      denuncia.belongsTo(models.estudiante, {
        foreignKey: 'denunciante_id',
        as: 'denunciante'
      });

      denuncia.belongsTo(models.motivo_denuncia, {
        foreignKey: 'motivo_id'
      });

      denuncia.belongsTo(models.administrador, {
        foreignKey: 'admin_revisor_id',
        as: 'revisor'
      });

    }
  }
  denuncia.init({
    detalle: DataTypes.STRING,
    estado: DataTypes.STRING,
    admin_revisor_id: DataTypes.INTEGER,
    fecha_creacion: DataTypes.DATE,
    fecha_resolucion: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'denuncia',
  });
  return denuncia;
};