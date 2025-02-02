'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('subscription_features', [
      { plan: 'Basic', feature: 'ai_usage_limit', value: '50', createdAt: new Date(), updatedAt: new Date() },
      { plan: 'Pro', feature: 'ai_usage_limit', value: '50', createdAt: new Date(), updatedAt: new Date() },
      { plan: 'Premium', feature: 'ai_usage_limit', value: 'unlimited', createdAt: new Date(), updatedAt: new Date() },
      { plan: 'Basic', feature: 'ads_free', value: 'false', createdAt: new Date(), updatedAt: new Date() },
      { plan: 'Pro', feature: 'ads_free', value: 'true', createdAt: new Date(), updatedAt: new Date() },
      { plan: 'Premium', feature: 'ads_free', value: 'true', createdAt: new Date(), updatedAt: new Date() },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('subscription_features', null, {});
  },
};
