'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // product_versions テーブルの作成
    await queryInterface.createTable('product_versions', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      productId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'products', // テーブル名
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      dataType: {
        type: Sequelize.STRING(50), // 'text', 'audio' など
        allowNull: false,
      },
      languageCode: {
        type: Sequelize.STRING(10), // 言語コード (例: 'en', 'ja')
        allowNull: false,
      },
      versionData: {
        type: Sequelize.JSONB, // JSON形式でデータを保存
        allowNull: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // download_histories テーブルの修正
    await queryInterface.addColumn('download_histories', 'versionId', {
      type: Sequelize.INTEGER,
      references: {
        model: 'product_versions',
        key: 'id',
      },
      allowNull: true,
    });
  },

  down: async (queryInterface) => {
    // マイグレーションのロールバック
    await queryInterface.removeColumn('download_histories', 'versionId');
    await queryInterface.dropTable('product_versions');
  },
};
