'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class valoracion extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {

      valoracion.belongsTo(models.material, {
        foreignKey: 'material_id'
      });

      valoracion.belongsTo(models.estudiante, {
        foreignKey: 'estudiante_id'
      });

    }
  }
  valoracion.init({
    valor: DataTypes.STRING,
    fecha: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'valoracion',
  });
  return valoracion;
};