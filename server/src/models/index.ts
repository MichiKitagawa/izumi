// src/models/index.ts
import User from './User';
import Product from './Product';
import ProductVersion from './ProductVersion';
import DownloadHistory from './DownloadHistory';

// アソシエーションの定義
User.hasMany(DownloadHistory, { foreignKey: 'userId', as: 'downloadHistories' });
User.hasMany(Product, { foreignKey: 'providerId', as: 'products' });

Product.belongsTo(User, { foreignKey: 'providerId', as: 'provider' });
Product.hasMany(ProductVersion, { foreignKey: 'productId', as: 'versions' });
Product.hasMany(DownloadHistory, { foreignKey: 'productId', as: 'downloadHistories' });

ProductVersion.belongsTo(Product, { foreignKey: 'productId', as: 'product' });
ProductVersion.hasMany(DownloadHistory, { foreignKey: 'versionId', as: 'downloadHistories' });

DownloadHistory.belongsTo(User, { foreignKey: 'userId', as: 'user' });
DownloadHistory.belongsTo(Product, { foreignKey: 'productId', as: 'product' });
DownloadHistory.belongsTo(ProductVersion, { foreignKey: 'versionId', as: 'version' });

export {
  User,
  Product,
  ProductVersion,
  DownloadHistory,
};
