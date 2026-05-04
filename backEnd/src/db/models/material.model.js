'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class material extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {

      material.belongsTo(models.materia, {
        foreignKey: 'materia_id'
      });

      material.belongsTo(models.estudiante, {
        foreignKey: 'estudiante_id'
      });

      material.belongsToMany(models.tag, {
        through: "material_tag", as: "tags"
      });

      material.hasMany(models.valoracion, {
        foreignKey: 'material_id'
      });

      material.hasMany(models.denuncia, {
        foreignKey: 'material_id'
      });

    }
  }
  material.init({
    tipo: DataTypes.STRING,
    titulo: DataTypes.STRING,
    descripcion: DataTypes.STRING,
    url_o_path: DataTypes.STRING,
    formato: DataTypes.STRING,
    subtipo_link: DataTypes.STRING,
    discord_servidor: DataTypes.STRING,
    discord_canal: DataTypes.STRING,
    size_bytes: DataTypes.INTEGER,
    suspendido: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'material',
    timestamps: false,
  });
  return material;
};