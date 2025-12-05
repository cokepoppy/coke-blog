-- 创建数据库表结构和初始数据

-- 用户表
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL COMMENT '用户名',
  email VARCHAR(100) UNIQUE NOT NULL COMMENT '邮箱',
  password_hash VARCHAR(255) NOT NULL COMMENT '密码哈希',
  display_name VARCHAR(100) COMMENT '显示名称',
  avatar_url VARCHAR(500) COMMENT '头像URL',
  bio TEXT COMMENT '个人简介',
  role ENUM('admin', 'editor', 'author', 'reader') DEFAULT 'author' COMMENT '用户角色',
  status ENUM('active', 'inactive', 'banned') DEFAULT 'active' COMMENT '账户状态',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  last_login_at TIMESTAMP NULL COMMENT '最后登录时间',

  INDEX idx_email (email),
  INDEX idx_username (username),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- 分类表
CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL COMMENT '分类名称',
  slug VARCHAR(50) UNIQUE NOT NULL COMMENT 'URL别名',
  description TEXT COMMENT '分类描述',
  color VARCHAR(7) DEFAULT '#D97757' COMMENT '分类颜色',
  sort_order INT DEFAULT 0 COMMENT '排序权重',
  post_count INT DEFAULT 0 COMMENT '文章数量',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='分类表';

-- 标签表
CREATE TABLE IF NOT EXISTS tags (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL COMMENT '标签名称',
  slug VARCHAR(50) UNIQUE NOT NULL COMMENT 'URL别名',
  usage_count INT DEFAULT 0 COMMENT '使用次数',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_slug (slug),
  INDEX idx_usage_count (usage_count)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='标签表';

-- 文章表
CREATE TABLE IF NOT EXISTS posts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL COMMENT '文章标题',
  slug VARCHAR(255) UNIQUE NOT NULL COMMENT 'URL别名',
  excerpt TEXT COMMENT '文章摘要',
  content LONGTEXT NOT NULL COMMENT '文章内容(Markdown)',
  content_html LONGTEXT COMMENT '文章内容(HTML)',
  cover_color VARCHAR(7) DEFAULT '#D6D1CB' COMMENT '封面颜色',
  cover_image VARCHAR(500) COMMENT '封面图片URL',
  category_id INT COMMENT '分类ID',
  author_id INT NOT NULL COMMENT '作者ID',
  read_time INT DEFAULT 0 COMMENT '预计阅读时间(分钟)',
  view_count INT DEFAULT 0 COMMENT '浏览次数',
  like_count INT DEFAULT 0 COMMENT '点赞次数',
  status ENUM('draft', 'published', 'archived') DEFAULT 'draft' COMMENT '发布状态',
  is_featured BOOLEAN DEFAULT FALSE COMMENT '是否为精选文章',
  is_ai_generated BOOLEAN DEFAULT FALSE COMMENT '是否AI生成',
  published_at TIMESTAMP NULL COMMENT '发布时间',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,

  INDEX idx_slug (slug),
  INDEX idx_status (status),
  INDEX idx_published_at (published_at),
  INDEX idx_author_id (author_id),
  INDEX idx_category_id (category_id),
  FULLTEXT idx_search (title, content)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='文章表';

-- 文章标签关联表
CREATE TABLE IF NOT EXISTS post_tags (
  post_id INT NOT NULL,
  tag_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (post_id, tag_id),
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE,

  INDEX idx_post_id (post_id),
  INDEX idx_tag_id (tag_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='文章标签关联表';

-- 刷新令牌表
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  token VARCHAR(500) UNIQUE NOT NULL COMMENT '刷新令牌',
  expires_at TIMESTAMP NOT NULL COMMENT '过期时间',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_token (token),
  INDEX idx_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='刷新令牌表';

-- 插入初始分类数据
INSERT INTO categories (name, slug, description, color) VALUES
('AI Safety', 'ai-safety', '探讨人工智能的安全性与伦理问题', '#D97757'),
('Design', 'design', '设计理念与用户体验探索', '#C9C4BC'),
('Research', 'research', '技术研究与学术思考', '#D1D5DB'),
('Culture', 'culture', '文化观察与社会现象', '#CED4C8'),
('Engineering', 'engineering', '工程实践与技术分享', '#DBCDC8')
ON DUPLICATE KEY UPDATE name=name;

-- 插入管理员账户 (密码: admin123, 使用 bcrypt 加密)
-- 需要在应用层生成真实的密码哈希
INSERT INTO users (username, email, password_hash, display_name, role) VALUES
('admin', 'admin@example.com', '$2b$10$YourHashedPasswordHere', 'Administrator', 'admin')
ON DUPLICATE KEY UPDATE username=username;

SELECT '✅ 数据库初始化完成！' AS status;
SELECT CONCAT('表 users: ', COUNT(*), ' 条记录') AS info FROM users;
SELECT CONCAT('表 categories: ', COUNT(*), ' 条记录') AS info FROM categories;
SELECT CONCAT('表 posts: ', COUNT(*), ' 条记录') AS info FROM posts;
