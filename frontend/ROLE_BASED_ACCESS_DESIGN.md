# 博客系统角色权限设计方案

## 角色定义

### 1. 浏览者 (Visitor)
**权限级别**: 基础访问权限

**可以做的事情**:
- ✅ 浏览所有已发布的文章
- ✅ 阅读文章详情
- ✅ 搜索和筛选文章
- ✅ 分享文章到社交媒体
- ✅ 查看文章分类和标签
- ✅ 评论文章（需登录）
- ✅ 点赞文章（需登录）

**不能做的事情**:
- ❌ 创建新文章
- ❌ 编辑或删除文章
- ❌ 访问管理后台
- ❌ 查看草稿状态文章
- ❌ 管理用户

### 2. 管理员 (Admin)
**权限级别**: 完全访问权限

**可以做的事情**:
- ✅ 浏览者的所有权限
- ✅ 创建、编辑、删除文章
- ✅ 管理文章状态（草稿/已发布/归档）
- ✅ 访问管理后台
- ✅ 查看网站统计数据
- ✅ 管理分类和标签
- ✅ 审核和管理评论
- ✅ 管理用户（可选）
- ✅ 配置网站设置

---

## UI/UX 设计

### 浏览者视图

```
┌─────────────────────────────────────────┐
│  MyBlog.    首页  专栏  关于  [登录]    │
├─────────────────────────────────────────┤
│                                         │
│  Blog.                                  │
│  关于人工智能、设计哲学...              │
│                                         │
│  [文章列表卡片]                         │
│  - 标题                                 │
│  - 摘要                                 │
│  - 分类、日期、阅读时间                │
│  - [阅读全文] 按钮                      │
│                                         │
│  [查看更多文章]                         │
│                                         │
└─────────────────────────────────────────┘

功能：
- 只能看到已发布的文章
- 没有"开始创作"按钮
- 没有编辑/删除操作
```

### 管理员视图

```
┌─────────────────────────────────────────┐
│  MyBlog.  首页 专栏 关于 [后台] [张三▼]│
├─────────────────────────────────────────┤
│                                         │
│  Blog.                     [开始创作]   │
│  关于人工智能、设计哲学...              │
│                                         │
│  [文章列表卡片]                         │
│  - 标题                    [编辑][删除] │
│  - 摘要                                 │
│  - 分类、日期、阅读时间                │
│  - 状态: 已发布 / 草稿                 │
│  - [阅读全文]                           │
│                                         │
│  [查看更多文章]                         │
│                                         │
└─────────────────────────────────────────┘

功能：
- 可以看到所有文章（包括草稿）
- 有"开始创作"按钮
- 有"后台管理"入口
- 每篇文章有编辑/删除按钮
- 显示文章状态标签
```

---

## 前端实现方案

### 1. 用户状态管理

**使用 React Context 管理用户状态**

```typescript
// src/contexts/AuthContext.tsx
import { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'visitor' | 'admin';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin';

  const login = async (email: string, password: string) => {
    // 调用后端 API 登录
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (response.ok) {
      const data = await response.json();
      setUser(data.user);
      localStorage.setItem('token', data.token);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
  };

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      // 验证 token 并获取用户信息
      const response = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      }
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isAdmin, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

### 2. 权限控制组件

```typescript
// src/components/ProtectedRoute.tsx
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export const ProtectedRoute = ({ children, requireAdmin = false }: ProtectedRouteProps) => {
  const { isAuthenticated, isAdmin } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
```

```typescript
// src/components/AdminOnly.tsx
import { useAuth } from '../contexts/AuthContext';

interface AdminOnlyProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const AdminOnly = ({ children, fallback = null }: AdminOnlyProps) => {
  const { isAdmin } = useAuth();
  return isAdmin ? <>{children}</> : <>{fallback}</>;
};
```

### 3. 更新 Header 组件

```typescript
// src/components/Header.tsx
import { useAuth } from '../contexts/AuthContext';
import { AdminOnly } from './AdminOnly';

const Header = ({ onHomeClick, onCreateClick, currentView }: HeaderProps) => {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 bg-[#F4F3F0]/90 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo */}
        <div onClick={onHomeClick} className="cursor-pointer group flex items-center gap-2">
          <span className="font-serif text-2xl font-bold tracking-tight text-stone-900">
            MyBlog.
          </span>
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-8 font-sans text-sm font-medium text-stone-600">
          <a href="#" onClick={(e) => { e.preventDefault(); onHomeClick(); }}>
            首页
          </a>
          <a href="#" className="hover:text-stone-900 transition-colors">
            专栏
          </a>
          <a href="#" className="hover:text-stone-900 transition-colors">
            关于
          </a>

          {/* 管理员专属链接 */}
          <AdminOnly>
            <a href="#" className="hover:text-stone-900 transition-colors">
              后台管理
            </a>
          </AdminOnly>

          {/* 用户菜单 */}
          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              <AdminOnly>
                <button
                  onClick={onCreateClick}
                  className="flex items-center gap-2 bg-stone-900 text-[#F4F3F0] px-5 py-2.5 rounded-sm hover:bg-stone-700 transition-all"
                >
                  <PenLine size={16} />
                  <span>开始创作</span>
                </button>
              </AdminOnly>

              <div className="relative group">
                <button className="flex items-center gap-2">
                  <span>{user?.name}</span>
                  <ChevronDown size={16} />
                </button>

                {/* 下拉菜单 */}
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-sm shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  <a href="#" className="block px-4 py-2 hover:bg-stone-100">
                    个人资料
                  </a>
                  <AdminOnly>
                    <a href="#" className="block px-4 py-2 hover:bg-stone-100">
                      文章管理
                    </a>
                  </AdminOnly>
                  <button
                    onClick={logout}
                    className="w-full text-left px-4 py-2 hover:bg-stone-100 text-red-600"
                  >
                    退出登录
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <a
              href="/login"
              className="flex items-center gap-2 bg-stone-900 text-[#F4F3F0] px-5 py-2.5 rounded-sm hover:bg-stone-700 transition-all"
            >
              登录
            </a>
          )}
        </nav>
      </div>
    </header>
  );
};
```

### 4. 文章卡片组件（带管理功能）

```typescript
// src/components/BlogPostCard.tsx
const BlogPostCard = ({ post, onClick, featured = false }: BlogPostCardProps) => {
  const { isAdmin } = useAuth();

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    // 跳转到编辑页面
    window.location.href = `/admin/posts/${post.id}/edit`;
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('确定要删除这篇文章吗？')) {
      await fetch(`/api/posts/${post.id}`, { method: 'DELETE' });
      // 刷新列表
    }
  };

  return (
    <div className={`group cursor-pointer flex flex-col ${featured ? 'md:grid md:grid-cols-2 md:gap-12' : ''}`}>
      {/* 封面图 */}
      <div
        className="overflow-hidden rounded-sm mb-6"
        style={{ backgroundColor: post.coverColor }}
      >
        {/* 管理员操作按钮 */}
        <AdminOnly>
          <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleEdit}
              className="bg-white px-3 py-1 rounded-sm text-sm font-medium hover:bg-stone-100"
            >
              编辑
            </button>
            <button
              onClick={handleDelete}
              className="bg-red-500 text-white px-3 py-1 rounded-sm text-sm font-medium hover:bg-red-600"
            >
              删除
            </button>
          </div>
        </AdminOnly>
      </div>

      <div className="flex flex-col h-full justify-center">
        {/* 分类和日期 */}
        <div className="flex items-center gap-3 text-xs font-bold tracking-widest uppercase mb-3">
          <span className="text-[#D97757]">{post.category}</span>
          <span className="w-1 h-1 rounded-full bg-stone-300"></span>
          <span className="text-stone-500 font-medium">{post.date}</span>

          {/* 状态标签（仅管理员可见） */}
          <AdminOnly>
            <span className={`px-2 py-1 rounded text-xs ${
              post.status === 'published'
                ? 'bg-green-100 text-green-700'
                : 'bg-yellow-100 text-yellow-700'
            }`}>
              {post.status === 'published' ? '已发布' : '草稿'}
            </span>
          </AdminOnly>
        </div>

        <h3 className="font-serif font-bold text-stone-900 leading-tight group-hover:underline">
          {post.title}
        </h3>

        <p className="text-stone-600 font-serif leading-relaxed line-clamp-3">
          {post.excerpt}
        </p>

        <div className="mt-auto pt-2 flex items-center text-sm font-bold text-stone-900">
          阅读全文 <ArrowRight size={16} className="ml-2" />
        </div>
      </div>
    </div>
  );
};
```

### 5. 登录页面

```typescript
// src/pages/Login.tsx
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError('登录失败，请检查邮箱和密码');
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F3F0] flex items-center justify-center px-6">
      <div className="max-w-md w-full bg-white rounded-sm shadow-lg p-8">
        <h2 className="font-serif text-3xl font-bold text-stone-900 mb-6 text-center">
          登录到 MyBlog
        </h2>

        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-sm mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-stone-700 font-medium mb-2">
              邮箱
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-stone-300 rounded-sm focus:outline-none focus:border-stone-900"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-stone-700 font-medium mb-2">
              密码
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-stone-300 rounded-sm focus:outline-none focus:border-stone-900"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-stone-900 text-white py-3 rounded-sm font-medium hover:bg-stone-700 transition-all"
          >
            登录
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-stone-500">
          <p>测试账号:</p>
          <p>管理员: admin@myblog.com / admin123</p>
          <p>浏览者: visitor@myblog.com / visitor123</p>
        </div>
      </div>
    </div>
  );
};
```

### 6. 后台管理页面（管理员专属）

```typescript
// src/pages/AdminDashboard.tsx
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

const AdminDashboard = () => {
  const { isAdmin } = useAuth();

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-[#F4F3F0]">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="font-serif text-4xl font-bold text-stone-900 mb-8">
          管理后台
        </h1>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-6 rounded-sm shadow">
            <h3 className="text-stone-500 text-sm font-medium mb-2">总文章数</h3>
            <p className="text-3xl font-bold text-stone-900">24</p>
          </div>
          <div className="bg-white p-6 rounded-sm shadow">
            <h3 className="text-stone-500 text-sm font-medium mb-2">总浏览量</h3>
            <p className="text-3xl font-bold text-stone-900">1,234</p>
          </div>
          <div className="bg-white p-6 rounded-sm shadow">
            <h3 className="text-stone-500 text-sm font-medium mb-2">评论数</h3>
            <p className="text-3xl font-bold text-stone-900">89</p>
          </div>
        </div>

        {/* 快捷操作 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <a
            href="/admin/posts"
            className="bg-white p-8 rounded-sm shadow hover:shadow-lg transition-shadow"
          >
            <h3 className="font-serif text-2xl font-bold text-stone-900 mb-2">
              文章管理
            </h3>
            <p className="text-stone-600">
              查看、编辑和管理所有文章
            </p>
          </a>

          <a
            href="/admin/comments"
            className="bg-white p-8 rounded-sm shadow hover:shadow-lg transition-shadow"
          >
            <h3 className="font-serif text-2xl font-bold text-stone-900 mb-2">
              评论管理
            </h3>
            <p className="text-stone-600">
              审核和管理用户评论
            </p>
          </a>

          <a
            href="/admin/categories"
            className="bg-white p-8 rounded-sm shadow hover:shadow-lg transition-shadow"
          >
            <h3 className="font-serif text-2xl font-bold text-stone-900 mb-2">
              分类管理
            </h3>
            <p className="text-stone-600">
              管理文章分类和标签
            </p>
          </a>

          <a
            href="/admin/settings"
            className="bg-white p-8 rounded-sm shadow hover:shadow-lg transition-shadow"
          >
            <h3 className="font-serif text-2xl font-bold text-stone-900 mb-2">
              网站设置
            </h3>
            <p className="text-stone-600">
              配置网站基本信息和参数
            </p>
          </a>
        </div>
      </div>
    </div>
  );
};
```

---

## 后端 API 设计

### 1. 认证相关 API

```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
POST /api/auth/refresh
```

### 2. 文章相关 API

```
GET    /api/posts              # 获取文章列表（浏览者只能看已发布）
GET    /api/posts/:id          # 获取文章详情
POST   /api/posts              # 创建文章（需要管理员权限）
PUT    /api/posts/:id          # 更新文章（需要管理员权限）
DELETE /api/posts/:id          # 删除文章（需要管理员权限）
PATCH  /api/posts/:id/publish  # 发布文章（需要管理员权限）
```

### 3. 评论相关 API

```
GET    /api/posts/:id/comments     # 获取文章评论
POST   /api/posts/:id/comments     # 添加评论（需要登录）
DELETE /api/comments/:id           # 删除评论（管理员或评论作者）
```

---

## 数据库设计

### Users 表

```sql
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('visitor', 'admin') DEFAULT 'visitor',
  avatar VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Posts 表

```sql
CREATE TABLE posts (
  id VARCHAR(36) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  cover_color VARCHAR(20),
  category VARCHAR(50),
  author_id VARCHAR(36),
  status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
  read_time INT,
  views INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  published_at TIMESTAMP NULL,
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### Comments 表

```sql
CREATE TABLE comments (
  id VARCHAR(36) PRIMARY KEY,
  post_id VARCHAR(36) NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  content TEXT NOT NULL,
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

---

## 安全考虑

### 1. 认证和授权

- 使用 JWT (JSON Web Token) 进行身份验证
- Token 存储在 localStorage 或 httpOnly cookie
- 每个请求在 header 中携带 token
- 后端验证 token 和用户角色

### 2. 密码安全

- 使用 bcrypt 对密码进行哈希
- 最小密码长度: 8 字符
- 密码复杂度要求: 字母 + 数字

### 3. API 安全

- CORS 配置限制来源
- Rate limiting 防止暴力破解
- 输入验证和清理
- SQL 注入防护
- XSS 防护

### 4. 权限验证中间件

```typescript
// 后端中间件示例
const requireAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: '未授权' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token 无效' });
  }
};

const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: '需要管理员权限' });
  }
  next();
};

// 使用
app.post('/api/posts', requireAuth, requireAdmin, createPost);
app.delete('/api/posts/:id', requireAuth, requireAdmin, deletePost);
```

---

## 实施步骤

### Phase 1: 基础认证 (1-2 天)
1. ✅ 创建用户表和认证 API
2. ✅ 实现登录/注册功能
3. ✅ 添加 JWT token 生成和验证
4. ✅ 创建 AuthContext 和 useAuth hook

### Phase 2: 角色权限 (1-2 天)
1. ✅ 实现角色检查中间件
2. ✅ 创建 ProtectedRoute 和 AdminOnly 组件
3. ✅ 更新 Header 显示用户信息
4. ✅ 根据角色显示/隐藏功能

### Phase 3: 管理功能 (2-3 天)
1. ✅ 创建管理后台页面
2. ✅ 实现文章管理 CRUD
3. ✅ 添加文章状态管理
4. ✅ 实现评论管理功能

### Phase 4: 优化和测试 (1-2 天)
1. ✅ 添加错误处理
2. ✅ 性能优化
3. ✅ 安全测试
4. ✅ UI/UX 优化

**预计总时间: 5-9 天**

---

## 测试用户

### 管理员账号
```
邮箱: admin@myblog.com
密码: admin123
角色: admin
```

### 浏览者账号
```
邮箱: visitor@myblog.com
密码: visitor123
角色: visitor
```

---

## 视觉设计建议

### 角色标识
- 管理员用户名旁显示 🛡️ 图标
- 管理员评论带有"管理员"标签
- 草稿文章有明显的视觉区分

### 配色方案
- 管理员操作按钮: 深色系 (#1a1a1a)
- 危险操作: 红色 (#DC2626)
- 成功状态: 绿色 (#16A34A)
- 警告状态: 黄色 (#EAB308)

---

## 未来扩展

### 可选功能
1. **编辑者角色** - 介于浏览者和管理员之间
2. **作者角色** - 可以创建和管理自己的文章
3. **版本历史** - 文章修改历史记录
4. **工作流** - 文章审核流程
5. **权限细粒度控制** - 更详细的权限设置

---

这个设计方案是否符合你的需求？我可以开始实现任何部分！
