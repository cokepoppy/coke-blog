#!/bin/bash

# 停止所有服务脚本

echo "🛑 停止所有服务..."

# 停止 nodemon 进程
pkill -f "nodemon" 2>/dev/null && echo "✅ 后端服务已停止" || echo "ℹ️  后端服务未运行"

# 停止 vite 进程
pkill -f "vite" 2>/dev/null && echo "✅ 前端服务已停止" || echo "ℹ️  前端服务未运行"

# 停止 node 相关进程
pkill -f "ts-node.*app.ts" 2>/dev/null || true

# 清理日志文件
rm -f backend.log frontend.log 2>/dev/null

echo ""
echo "🎉 所有服务已停止"
