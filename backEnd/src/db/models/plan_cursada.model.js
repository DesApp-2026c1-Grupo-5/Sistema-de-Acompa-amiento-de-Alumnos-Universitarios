'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class plan_cursada extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {

      plan_cursada.belongsTo(models.situacion_academica, {
        foreignKey: 'situacion_id'
      });

      plan_cursada.hasMany(models.plan_cursada_item, {
        foreignKey: 'plan_id',
        as: 'plan_cursada_items',
      });

    }
  }
  plan_cursada.init({
    nombre: DataTypes.STRING,
    created_at: DataTypes.DATE,
    activo: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'plan_cursada',
    timestamps: false,
  });
  return plan_cursada;
};