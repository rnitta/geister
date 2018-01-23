'use strict';
module.exports = (sequelize, DataTypes) => {
  var random = sequelize.define('random', {
    name: DataTypes.STRING,
    token: DataTypes.STRING
  }, {
    underscored: true,
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return random;
};