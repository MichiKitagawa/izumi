// migrations/XXXXXX-alter-fileUrl-in-products.js
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('products', 'fileUrl', {
      type: Sequelize.TEXT,
      allowNull: false,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('products', 'fileUrl', {
      type: Sequelize.STRING(255),
      allowNull: false,
    });
  }
};
