// server/migrations/XXXXXXXXXXXXXX-change-profileImage-type.js
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('users', 'profileImage', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('users', 'profileImage', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },
};
