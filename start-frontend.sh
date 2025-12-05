#!/bin/bash

# 前端启动脚本
# 支持 WSL 热加载

set -e

echo "🎨 启动前端服务..."
echo "================================"

# 进入前端目录
cd "$(dirname "$0")/frontend"

# 清理旧进程
echo "🧹 清理旧进程..."
pkill -f "vite" 2>/dev/null || true
sleep 1

# 检查依赖
if [ ! -d "node_modules" ]; then
    echo "📦 安装依赖..."
    npm install
fi

# 启动开发服务器（支持 WSL 热加载）
echo "✅ 启动前端服务..."
echo "📍 URL: http://localhost:5173"
echo "================================"
echo ""

# Vite 会自动检测 WSL 环境并启用轮询
npm run dev
