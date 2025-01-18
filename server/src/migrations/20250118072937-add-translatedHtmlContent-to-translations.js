module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('translations', 'translatedHtmlContent', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('translations', 'translatedHtmlContent');
  },
};
