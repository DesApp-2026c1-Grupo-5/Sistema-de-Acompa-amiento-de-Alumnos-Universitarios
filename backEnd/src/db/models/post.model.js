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

      post.hasMany(models.denuncia, {
        foreignKey: 'post_id',
        as: 'denuncias'
      });

    }
  }
  post.init({
    contenido: DataTypes.STRING,
    event_type: DataTypes.STRING,
    event_subject: DataTypes.STRING,
    suspendido: {type: DataTypes.BOOLEAN,defaultValue: false,},
  }, {
    sequelize,
    modelName: 'post',
  });
  return post;
};
