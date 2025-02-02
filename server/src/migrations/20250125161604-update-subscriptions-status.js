'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // ステータスの制約を追加
    await queryInterface.changeColumn('subscriptions', 'status', {
      type: Sequelize.STRING,
      allowNull: false,
    });

    // CHECK制約を追加 (PostgreSQLなど対応する場合)
    if (queryInterface.sequelize.options.dialect === 'postgres') {
      await queryInterface.sequelize.query(`
        ALTER TABLE "subscriptions"
        ADD CONSTRAINT status_check CHECK ("status" IN ('active', 'canceled', 'expired'));
      `);
    }
  },

  down: async (queryInterface, Sequelize) => {
    // CHECK制約を削除 (PostgreSQL用)
    if (queryInterface.sequelize.options.dialect === 'postgres') {
      await queryInterface.sequelize.query(`
        ALTER TABLE "subscriptions"
        DROP CONSTRAINT status_check;
      `);
    }

    // ステータス列を元の状態に戻す
    await queryInterface.changeColumn('subscriptions', 'status', {
      type: Sequelize.STRING,
      allowNull: false,
    });
  },
};
