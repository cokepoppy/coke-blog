#!/bin/bash

# 启动前后端服务
# 支持 WSL 热加载

set -e

echo "🚀 启动 Coke Blog 完整服务..."
echo "================================"
echo ""

# 获取脚本目录
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# 清理所有旧进程
echo "🧹 清理所有旧进程..."
pkill -f "nodemon.*app.ts" 2>/dev/null || true
pkill -f "vite" 2>/dev/null || true
sleep 2

# 检查 Docker MySQL 是否运行
echo "🔍 检查 MySQL 容器..."
if ! docker ps | grep -q "coke-blog-mysql"; then
    echo "⚠️  MySQL 容器未运行！"
    echo "请先启动 MySQL 容器："
    echo "  docker start coke-blog-mysql"
    exit 1
fi
echo "✅ MySQL 容器正在运行"
echo ""

# 安装依赖（如果需要）
if [ ! -d "$SCRIPT_DIR/backend/node_modules" ]; then
    echo "📦 安装后端依赖..."
    cd "$SCRIPT_DIR/backend"
    npm install
fi

if [ ! -d "$SCRIPT_DIR/frontend/node_modules" ]; then
    echo "📦 安装前端依赖..."
    cd "$SCRIPT_DIR/frontend"
    npm install
fi

echo ""
echo "================================"
echo "🎉 准备就绪！"
echo ""
echo "📍 前端: http://localhost:5173"
echo "📍 后端: http://localhost:3000"
echo "🏥 健康检查: http://localhost:3000/health"
echo ""
echo "💡 提示："
echo "  - 按 Ctrl+C 停止所有服务"
echo "  - 日志会实时显示在下方"
echo "  - 支持 WSL 热加载，修改代码会自动重启"
echo "================================"
echo ""

# 使用 trap 捕获退出信号，确保清理子进程
trap 'echo ""; echo "🛑 停止所有服务..."; pkill -P $$; exit 0' SIGINT SIGTERM

# 同时启动前后端（后台运行）
cd "$SCRIPT_DIR/backend"
echo "🚀 启动后端..."
CHOKIDAR_USEPOLLING=true npm run dev > ../backend.log 2>&1 &
BACKEND_PID=$!

cd "$SCRIPT_DIR/frontend"
echo "🎨 启动前端..."
npm run dev > ../frontend.log 2>&1 &
FRONTEND_PID=$!

# 等待服务启动
sleep 5

# 实时显示日志
echo ""
echo "📊 服务日志（实时）:"
echo "-----------------------------------"
tail -f "$SCRIPT_DIR/backend.log" "$SCRIPT_DIR/frontend.log" &
TAIL_PID=$!

# 等待子进程
wait $BACKEND_PID $FRONTEND_PID $TAIL_PID
