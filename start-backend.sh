#!/bin/bash

# 后端启动脚本
# 支持 WSL 热加载

set -e

echo "🚀 启动后端服务..."
echo "================================"

# 进入后端目录
cd "$(dirname "$0")/backend"

# 清理旧进程
echo "🧹 清理旧进程..."
pkill -f "nodemon.*app.ts" 2>/dev/null || true
sleep 1

# 检查依赖
if [ ! -d "node_modules" ]; then
    echo "📦 安装依赖..."
    npm install
fi

# 检查环境变量
if [ ! -f ".env" ]; then
    echo "⚠️  警告: .env 文件不存在，从 .env.example 复制..."
    cp .env.example .env
    echo "请编辑 .env 文件配置数据库连接信息"
fi

# 启动开发服务器（支持 WSL 热加载）
echo "✅ 启动后端服务..."
echo "📍 API: http://localhost:3000"
echo "🏥 Health: http://localhost:3000/health"
echo "================================"
echo ""

# 使用 nodemon 启动，配置适合 WSL 的选项
CHOKIDAR_USEPOLLING=true npm run dev
