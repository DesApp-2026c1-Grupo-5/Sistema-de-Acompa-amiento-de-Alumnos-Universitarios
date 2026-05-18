'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class post extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {

      post.belongsTo(models.estudiante, {
        foreignKey: 'estudiante_id'
      });

      post.hasMany(models.voto_post, {
        foreignKey: 'post_id'
      });

    }
  }
  post.init({
    contenido: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'post',
  });
  return post;
};