'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class material_tag extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {

      material_tag.belongsTo(models.material, {
        foreignKey: 'material_id'
      });

      material_tag.belongsTo(models.tag, {
        foreignKey: 'tag_id'
      });

    }
  }
  material_tag.init({
    materia_id: DataTypes.INTEGER,
    tag_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'material_tag',
  });
  return material_tag;
};