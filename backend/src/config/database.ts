import { DataSource } from 'typeorm';
import dotenv from 'dotenv';
import { User } from '../entities/User';
import { Post } from '../entities/Post';
import { Category } from '../entities/Category';
import { Tag } from '../entities/Tag';
import { RefreshToken } from '../entities/RefreshToken';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'coke_blog',
  synchronize: process.env.NODE_ENV === 'development', // 仅开发环境自动同步
  logging: process.env.NODE_ENV === 'development',
  entities: [User, Post, Category, Tag, RefreshToken],
  migrations: [],
  subscribers: [],
  charset: 'utf8mb4',
});

export const initializeDatabase = async () => {
  try {
    await AppDataSource.initialize();
    console.log('✅ Database connection established successfully');
  } catch (error) {
    console.error('❌ Error during Data Source initialization:', error);
    process.exit(1);
  }
};
