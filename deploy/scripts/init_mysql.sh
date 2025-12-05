#!/bin/bash
set -e

# 读取配置文件或环境变量
if [ -f "$(dirname $0)/config.sh" ]; then
    source "$(dirname $0)/config.sh"
else
    echo "错误: 找不到配置文件 config.sh"
    echo "请复制 config.sh.example 为 config.sh 并填入正确的配置"
    exit 1
fi

echo "Creating database and user for Coke Blog..."

sudo mysql -u root << MYSQL_SCRIPT
CREATE DATABASE IF NOT EXISTS ${DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS '${DB_USER}'@'localhost' IDENTIFIED BY '${DB_PASSWORD}';
GRANT ALL PRIVILEGES ON ${DB_NAME}.* TO '${DB_USER}'@'localhost';
FLUSH PRIVILEGES;
MYSQL_SCRIPT

echo "Database setup complete!"
echo "DB: ${DB_NAME}, User: ${DB_USER}"
