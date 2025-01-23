'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
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

    // ユニーク制約の追加（必要に応じて）
    await queryInterface.addConstraint('product_versions', {
      fields: ['productId', 'dataType', 'languageCode'],
      type: 'unique',
      name: 'unique_product_version',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('product_versions');
  },
};
