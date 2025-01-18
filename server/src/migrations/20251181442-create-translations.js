module.exports = {
    up: async (queryInterface, Sequelize) => {
      await queryInterface.createTable('translations', {
        id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        productId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'products', // テーブル名を指定
            key: 'id',
          },
          onDelete: 'CASCADE',
        },
        languageCode: {
          type: Sequelize.STRING(10),
          allowNull: false,
        },
        translatedTitle: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        translatedDescription: {
          type: Sequelize.TEXT,
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
    },
    down: async (queryInterface) => {
      await queryInterface.dropTable('translations');
    },
  };
  