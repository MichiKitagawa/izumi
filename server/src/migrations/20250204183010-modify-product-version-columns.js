// migration ファイル例 (YYYYMMDDHHmmss-modify-product-version-columns.js)
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // versionData カラムを削除
    await queryInterface.removeColumn('product_versions', 'versionData');
    // fileUrl, fileType, htmlContent カラムを追加
    await queryInterface.addColumn('product_versions', 'fileUrl', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('product_versions', 'fileType', {
      type: Sequelize.STRING(10),
      allowNull: true,
    });
    await queryInterface.addColumn('product_versions', 'htmlContent', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  },
  down: async (queryInterface, Sequelize) => {
    // down の場合は、fileUrl, fileType, htmlContent を削除し、versionData を復元（必要なら）
    await queryInterface.removeColumn('product_versions', 'fileUrl');
    await queryInterface.removeColumn('product_versions', 'fileType');
    await queryInterface.removeColumn('product_versions', 'htmlContent');
    await queryInterface.addColumn('product_versions', 'versionData', {
      type: Sequelize.JSONB,
      allowNull: false,
    });
  },
};
