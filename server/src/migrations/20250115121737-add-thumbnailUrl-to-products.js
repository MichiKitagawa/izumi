// migrations/XXXXXXXXXXXXXX-make-thumbnailUrl-not-null.js
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('products', 'thumbnailUrl', {
      type: Sequelize.TEXT,
      allowNull: false, // NOT NULL 制約を追加
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('products', 'thumbnailUrl', {
      type: Sequelize.TEXT,
      allowNull: true, // 元に戻す
    });
  }
};
