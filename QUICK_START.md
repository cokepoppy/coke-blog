# 🚀 快速启动指南

## 一键启动

```bash
# 确保 MySQL 容器运行
docker start coke-blog-mysql

# 启动所有服务
./start-all.sh
```

访问：
- 前端：http://localhost:5173
- 后端：http://localhost:3000
- 健康检查：http://localhost:3000/health

## 常用命令

### 启动服务

```bash
./start-all.sh      # 启动前后端
./start-backend.sh  # 仅启动后端
./start-frontend.sh # 仅启动前端
./stop-all.sh       # 停止所有服务
```

### Docker 数据库

```bash
# 启动容器
docker start coke-blog-mysql

# 停止容器
docker stop coke-blog-mysql

# 查看容器状态
docker ps | grep coke-blog-mysql

# 连接数据库
docker exec -it coke-blog-mysql mysql -uroot -ppassword coke_blog
```

### 数据库管理

```bash
# 重新初始化数据库
cd backend
docker exec -i coke-blog-mysql mysql -uroot -ppassword coke_blog < init-db.sql

# 查看数据
docker exec -i coke-blog-mysql mysql -uroot -ppassword coke_blog -e "
  SELECT * FROM categories;
  SELECT username, email, role FROM users;
"
```

## 默认配置

### 数据库
- Host: localhost
- Port: 3306
- Username: root
- Password: password
- Database: coke_blog

### 服务端口
- 前端: 5173
- 后端: 3000

### 默认账号
- 用户名: admin
- 邮箱: admin@example.com
- 密码: 需要在应用中设置

## 故障排查

### 端口被占用

```bash
# 查看端口占用
lsof -i:3000  # 后端
lsof -i:5173  # 前端

# 杀死进程
kill -9 <PID>

# 或使用停止脚本
./stop-all.sh
```

### 热加载不工作

确保已配置 WSL 支持：
- 前端：`vite.config.ts` 中有 `usePolling: true`
- 后端：启动时设置 `CHOKIDAR_USEPOLLING=true`

### 数据库连接失败

```bash
# 检查容器状态
docker ps -a | grep mysql

# 启动容器
docker start coke-blog-mysql

# 查看日志
docker logs coke-blog-mysql
```

### TypeScript 编译错误

```bash
# 清理缓存
cd backend
rm -rf node_modules/.cache dist
npm install

# 重新启动
./start-backend.sh
```

## 开发工作流

1. **启动开发环境**
   ```bash
   docker start coke-blog-mysql
   ./start-all.sh
   ```

2. **修改代码**
   - 前端：修改 `frontend/src` 下的文件
   - 后端：修改 `backend/src` 下的文件
   - 热加载会自动生效

3. **测试 API**
   ```bash
   # 健康检查
   curl http://localhost:3000/health

   # 获取分类
   curl http://localhost:3000/api/v1/categories
   ```

4. **停止服务**
   ```bash
   ./stop-all.sh
   ```

## 快捷命令

```bash
# 查看所有 npm 脚本
cd backend && npm run
cd frontend && npm run

# 查看进程
ps aux | grep -E "(node|vite|nodemon)"

# 查看端口
netstat -tuln | grep -E "(3000|5173)"

# 查看日志
tail -f backend.log
tail -f frontend.log
```

## 下一步

- 📖 阅读 [完整文档](./README.md)
- 📋 查看 [API 文档](./doc/02-系统设计文档.md)
- 🎨 了解 [设计理念](./doc/01-调研报告.md)
- 🔧 配置 [开发环境](#开发工作流)

---

**遇到问题？** 查看 [故障排查](#故障排查) 或提交 Issue
