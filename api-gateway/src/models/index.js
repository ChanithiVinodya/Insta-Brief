import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const User = sequelize.define('User', {
  id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
  email: { type: DataTypes.STRING(255), allowNull: false, unique: true },
  password_hash: { type: DataTypes.STRING(255), allowNull: false },
  display_name: { type: DataTypes.STRING(100), allowNull: false },
  onboarding_completed: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
}, { tableName: 'users', updatedAt: true, createdAt: true });

export const UserInterest = sequelize.define('UserInterest', {
  id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
  user_id: { type: DataTypes.UUID, allowNull: false },
  interest: { type: DataTypes.STRING(100), allowNull: false },
}, { tableName: 'user_interests', updatedAt: false });

export const Article = sequelize.define('Article', {
  id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
  external_id: { type: DataTypes.STRING(255) },
  source: { type: DataTypes.STRING(100), allowNull: false },
  title: { type: DataTypes.STRING(500), allowNull: false },
  url: { type: DataTypes.TEXT, allowNull: false, unique: true },
  content: { type: DataTypes.TEXT },
  summary: { type: DataTypes.TEXT },
  author: { type: DataTypes.STRING(255) },
  image_url: { type: DataTypes.TEXT },
  published_at: { type: DataTypes.DATE },
  ingested_at: { type: DataTypes.DATE },
  processed_at: { type: DataTypes.DATE },
  trending_score: { type: DataTypes.DOUBLE, allowNull: false, defaultValue: 0 },
}, { tableName: 'articles' });

export const ArticleKeyword = sequelize.define('ArticleKeyword', {
  id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
  article_id: { type: DataTypes.UUID, allowNull: false },
  keyword: { type: DataTypes.STRING(100), allowNull: false },
  weight: { type: DataTypes.DOUBLE, allowNull: false, defaultValue: 1 },
}, { tableName: 'article_keywords', updatedAt: false, createdAt: true });

export const UserInteraction = sequelize.define('UserInteraction', {
  id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
  user_id: { type: DataTypes.UUID, allowNull: false },
  article_id: { type: DataTypes.UUID, allowNull: false },
  interaction_type: { type: DataTypes.STRING(20), allowNull: false },
}, { tableName: 'user_interactions', updatedAt: false });

export const TrendingTopic = sequelize.define('TrendingTopic', {
  id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
  topic: { type: DataTypes.STRING(200), allowNull: false },
  score: { type: DataTypes.DOUBLE, allowNull: false, defaultValue: 0 },
  article_count: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  window_start: { type: DataTypes.DATE, allowNull: false },
  window_end: { type: DataTypes.DATE, allowNull: false },
  summary: { type: DataTypes.TEXT },
  image_url: { type: DataTypes.TEXT },
}, { tableName: 'trending_topics', updatedAt: false });

User.hasMany(UserInterest, { foreignKey: 'user_id' });
UserInterest.belongsTo(User, { foreignKey: 'user_id' });
Article.hasMany(ArticleKeyword, { foreignKey: 'article_id' });
ArticleKeyword.belongsTo(Article, { foreignKey: 'article_id' });
