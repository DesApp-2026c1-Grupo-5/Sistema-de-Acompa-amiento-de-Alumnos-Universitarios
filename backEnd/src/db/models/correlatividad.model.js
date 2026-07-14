'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class correlatividad extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {

      correlatividad.belongsTo(models.materia, {
        foreignKey: 'materia_id',
        as: 'materia'
      });

      correlatividad.belongsTo(models.materia, {
        foreignKey: 'materia_requisito_id',
        as: 'requisito'
      });

    }
  }
  correlatividad.init({
    materia_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    materia_requisito_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    tipo: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: [['cursar', 'aprobar']],
        noAutorreferencia(value) {
          if (Number(this.materia_id) === Number(this.materia_requisito_id)) {
            throw new Error('Una materia no puede ser correlativa de sí misma');
          }
          return value;
        },
      },
    },
  }, {
    sequelize,
    modelName: 'correlatividad',
    indexes: [
      {
        unique: true,
        fields: ['materia_id', 'materia_requisito_id'],
        name: 'correlatividads_materia_requisito_unique',
      },
    ],
  });
  return correlatividad;
};
