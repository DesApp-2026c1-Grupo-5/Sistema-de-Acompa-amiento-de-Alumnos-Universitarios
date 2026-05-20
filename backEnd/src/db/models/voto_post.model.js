'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class voto_post extends Model {
    static associate(models) {
      voto_post.belongsTo(models.post, { foreignKey: 'post_id' });
      voto_post.belongsTo(models.estudiante, { foreignKey: 'estudiante_id' });
    }
  }
  voto_post.init({
    tipo: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'voto_post',
  });
  return voto_post;
};
