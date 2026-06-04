'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class archivo_sesion_estudio extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      archivo_sesion_estudio.belongsTo(models.sesion_estudio, {
        foreignKey: 'sesion_id'
      });

      archivo_sesion_estudio.belongsTo(models.estudiante, {
        foreignKey: 'estudiante_id'
      });
    }
  }
  archivo_sesion_estudio.init({
    nombre_original: DataTypes.STRING,
    nombre_archivo: DataTypes.STRING,
    mime_type: DataTypes.STRING,
    size_bytes: DataTypes.INTEGER,
    url_o_path: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'archivo_sesion_estudio',
  });
  return archivo_sesion_estudio;
};
