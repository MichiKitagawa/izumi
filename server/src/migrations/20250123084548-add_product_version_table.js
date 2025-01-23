'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // product_versions テーブルの作成
    await queryInterface.createTable('product_versions', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      productId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'products',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      dataType: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      languageCode: {
        type: Sequelize.STRING(10),
        allowNull: false,
      },
      versionData: {
        type: Sequelize.JSONB,
        allowNull: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // download_histories テーブルに versionId を追加
    const tableInfo = await queryInterface.describeTable('download_histories');
    if (!tableInfo.versionId) {
      await queryInterface.addColumn('download_histories', 'versionId', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'product_versions',
          key: 'id',
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      });
    }
  },

  async down(queryInterface, Sequelize) {
    // マイグレーションのロールバック
    await queryInterface.removeColumn('download_histories', 'versionId');
    await queryInterface.dropTable('product_versions');
  },
};
