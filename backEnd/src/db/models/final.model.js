'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class final extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {

      final.belongsTo(models.estado_materia, {
        foreignKey: 'estado_materia_id'
      });

    }
  }
  final.init({
    estado_materia_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    fecha: DataTypes.DATE,
    nota: DataTypes.FLOAT,
    aprobado: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'final',
  });
  return final;
};
