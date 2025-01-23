// migrations/XXXXXXXXXXXXXX-add_isOriginal_to_product_versions.js
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('product_versions', 'isOriginal', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('product_versions', 'isOriginal');
  },
};
