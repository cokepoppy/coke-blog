# Coke Blog V2

一个现代化的全栈博客系统，采用 Claude 风格的优雅设计，基于 Gemini Canvas 原型开发。

## ✨ 特性

- 🎨 **优雅设计** - 基于 Claude 风格的极简设计，柔和的大地色调
- 📝 **AI 辅助创作** - 支持 AI 生成文章内容
- 🔐 **完整认证** - JWT 认证系统，支持注册、登录、Token 刷新
- 📱 **响应式布局** - 完美适配桌面、平板和移动设备
- 🚀 **现代技术栈** - React + TypeScript + Express + MySQL

## 🛠 技术栈

### 前端
- **React 18** - UI 框架
- **TypeScript** - 类型安全
- **Vite** - 构建工具
- **Tailwind CSS** - 样式框架
- **Lucide React** - 图标库

### 后端
- **Express** - Web 框架
- **TypeScript** - 类型安全
- **TypeORM** - ORM 框架
- **MySQL** - 数据库
- **JWT** - 认证方案

## 📦 项目结构

```
coke-blog-v2/
├── frontend/                 # 前端项目
│   ├── src/
│   │   ├── App.tsx          # 主应用组件
│   │   ├── index.css        # 全局样式
│   │   └── main.tsx         # 应用入口
│   ├── package.json
│   └── vite.config.ts
│
├── backend/                  # 后端项目
│   ├── src/
│   │   ├── config/          # 配置文件
│   │   ├── entities/        # 数据库实体
│   │   ├── controllers/     # 控制器
│   │   ├── services/        # 业务逻辑
│   │   ├── middlewares/     # 中间件
│   │   ├── routes/          # 路由
│   │   ├── utils/           # 工具函数
│   │   └── app.ts           # 应用入口
│   ├── package.json
│   └── tsconfig.json
│
└── doc/                      # 文档
    ├── 01-调研报告.md
    ├── 02-系统设计文档.md
    └── gemini.html          # 原型设计
```

## 🚀 快速开始

### 前置要求

- Node.js 18+
- Docker (MySQL 8.0+ 容器)
- npm 或 yarn
- WSL2 (如果在 Windows 上开发)

### 方式一：使用启动脚本（推荐）

**一键启动所有服务：**

```bash
# 1. 确保 MySQL 容器正在运行
docker start coke-blog-mysql

# 2. 启动前后端服务
./start-all.sh
```

**单独启动服务：**

```bash
# 仅启动后端
./start-backend.sh

# 仅启动前端
./start-frontend.sh

# 停止所有服务
./stop-all.sh
```

**启动脚本特性：**
- ✅ 自动清理旧进程
- ✅ 自动安装依赖
- ✅ 支持 WSL 热加载
- ✅ 实时日志显示
- ✅ 检查 MySQL 容器状态

### 方式二：手动启动

#### 1. 初始化数据库

```bash
# 使用 Docker 启动 MySQL（如果还没有容器）
docker run -d \
  --name coke-blog-mysql \
  -e MYSQL_ROOT_PASSWORD=password \
  -e MYSQL_DATABASE=coke_blog \
  -p 3306:3306 \
  mysql:8.0

# 初始化数据库表结构
cd backend
docker exec -i coke-blog-mysql mysql -uroot -ppassword coke_blog < init-db.sql
```

#### 2. 配置后端

```bash
cd backend

# 安装依赖
npm install

# 配置环境变量（已预配置好）
# .env 文件已包含默认配置：
# DB_HOST=localhost
# DB_PORT=3306
# DB_USERNAME=root
# DB_PASSWORD=password
# DB_DATABASE=coke_blog

# 启动开发服务器
npm run dev
```

后端服务将运行在 `http://localhost:3000`

#### 3. 配置前端

```bash
cd frontend

# 安装依赖
npm install

# 启动开发服务器（支持 WSL 热加载）
npm run dev
```

前端服务将运行在 `http://localhost:5173`

### 💡 WSL 热加载支持

本项目已针对 WSL2 环境优化：

- **前端**: Vite 配置了 `usePolling: true`
- **后端**: Nodemon 使用 `CHOKIDAR_USEPOLLING=true`
- 文件修改会自动触发热重载，无需手动重启

## 📡 API 接口

### 认证接口

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/v1/auth/register | 用户注册 |
| POST | /api/v1/auth/login | 用户登录 |
| POST | /api/v1/auth/refresh | 刷新令牌 |
| POST | /api/v1/auth/logout | 用户登出 |
| GET  | /api/v1/auth/me | 获取当前用户信息 |

### 文章接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET    | /api/v1/posts | 获取文章列表 |
| GET    | /api/v1/posts/:id | 获取文章详情 |
| GET    | /api/v1/posts/slug/:slug | 通过 slug 获取文章 |
| POST   | /api/v1/posts | 创建文章 (需认证) |
| PUT    | /api/v1/posts/:id | 更新文章 (需认证) |
| DELETE | /api/v1/posts/:id | 删除文章 (需认证) |
| POST   | /api/v1/posts/:id/publish | 发布文章 (需认证) |
| POST   | /api/v1/posts/:id/like | 点赞文章 |

详细 API 文档请查看 `doc/02-系统设计文档.md`

## 🎨 设计理念

本项目采用 Claude 风格的极简设计：

- **配色方案** - 柔和的大地色调，温暖而专业
- **排版系统** - Crimson Pro（衬线）+ Inter（无衬线）
- **留白运用** - 充足的呼吸空间，突出内容本身
- **交互反馈** - 细腻的动画和过渡效果

## 📝 数据库 Schema

### 主要表结构

- `users` - 用户表
- `posts` - 文章表
- `categories` - 分类表
- `tags` - 标签表
- `post_tags` - 文章标签关联表
- `refresh_tokens` - 刷新令牌表

详细 Schema 请查看 `doc/02-系统设计文档.md`

## 🔧 开发命令

### 启动脚本

```bash
./start-all.sh      # 🚀 启动前后端所有服务
./start-backend.sh  # ⚙️  仅启动后端
./start-frontend.sh # 🎨 仅启动前端
./stop-all.sh       # 🛑 停止所有服务
```

### 前端命令

```bash
cd frontend
npm run dev      # 启动开发服务器（支持热加载）
npm run build    # 构建生产版本
npm run preview  # 预览生产构建
```

### 后端命令

```bash
cd backend
npm run dev      # 启动开发服务器 (nodemon + ts-node)
npm run build    # 编译 TypeScript
npm start        # 启动生产服务器
```

### 数据库命令

```bash
# 连接数据库
docker exec -it coke-blog-mysql mysql -uroot -ppassword coke_blog

# 重新初始化数据库
cd backend
docker exec -i coke-blog-mysql mysql -uroot -ppassword coke_blog < init-db.sql

# 查看数据库状态
docker exec -i coke-blog-mysql mysql -uroot -ppassword -e "
  USE coke_blog;
  SELECT '📊 用户' as table_name, COUNT(*) as count FROM users
  UNION ALL
  SELECT '📁 分类', COUNT(*) FROM categories
  UNION ALL
  SELECT '📝 文章', COUNT(*) FROM posts;
"
```

## 🌟 核心功能

### 1. 文章管理
- 创建、编辑、删除文章
- 支持 Markdown 格式
- 分类和标签管理
- 文章发布/草稿状态

### 2. AI 辅助创作
- 根据标题自动生成文章
- 支持手动输入内容
- 智能生成摘要和封面颜色

### 3. 用户系统
- JWT 认证
- Token 刷新机制
- 用户角色权限

### 4. 阅读体验
- 优雅的排版
- 流畅的页面切换动画
- 社交分享功能

## 📚 文档

- [调研报告](./doc/01-调研报告.md) - 技术选型和架构设计
- [系统设计文档](./doc/02-系统设计文档.md) - 详细的系统设计和 API 文档

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

ISC

## 👨‍💻 作者

Coke Blog Team

---

**享受优雅的写作体验！** ✨
