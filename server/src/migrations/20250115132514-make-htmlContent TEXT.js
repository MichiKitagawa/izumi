'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('products', 'htmlContent', {
      type: Sequelize.TEXT,
      allowNull: true, // 初期値はnullを許容
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('products', 'htmlContent');
  },
};
