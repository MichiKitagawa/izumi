// src/models/index.ts
import User from './User';
import Product from './Product';
import ProductVersion from './ProductVersion';
import DownloadHistory from './DownloadHistory';
import Subscription from './Subscription'; // 追加
import AIUsageHistory from './AIUsageHistory';

// アソシエーションの定義
User.hasMany(DownloadHistory, { foreignKey: 'userId', as: 'downloadHistories' });
User.hasMany(Product, { foreignKey: 'providerId', as: 'products' });
User.hasOne(Subscription, { foreignKey: 'userId', as: 'subscription' }); // 追加

Product.belongsTo(User, { foreignKey: 'providerId', as: 'provider' });
Product.hasMany(ProductVersion, { foreignKey: 'productId', as: 'versions' });
Product.hasMany(DownloadHistory, { foreignKey: 'productId', as: 'downloadHistories' });

ProductVersion.belongsTo(Product, { foreignKey: 'productId', as: 'product' });
ProductVersion.hasMany(DownloadHistory, { foreignKey: 'versionId', as: 'downloadHistories' });

DownloadHistory.belongsTo(User, { foreignKey: 'userId', as: 'user' });
DownloadHistory.belongsTo(Product, { foreignKey: 'productId', as: 'product' });
DownloadHistory.belongsTo(ProductVersion, { foreignKey: 'versionId', as: 'version' });

User.hasMany(AIUsageHistory, { foreignKey: 'userId', as: 'aiUsageHistories' });
AIUsageHistory.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Subscription.belongsTo(User, { foreignKey: 'userId', as: 'user' }); // 追加

export {
  User,
  Product,
  ProductVersion,
  DownloadHistory,
  Subscription, // 追加
};
