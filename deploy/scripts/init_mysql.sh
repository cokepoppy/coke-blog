#!/bin/bash
set -e

DB_NAME="coke_blog"
DB_USER="coke_blog_user"
DB_PASSWORD="CokeBlog@2025SecurePass"

echo "Creating database and user for Coke Blog..."

sudo mysql -u root << MYSQL_SCRIPT
CREATE DATABASE IF NOT EXISTS ${DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS '${DB_USER}'@'localhost' IDENTIFIED BY '${DB_PASSWORD}';
GRANT ALL PRIVILEGES ON ${DB_NAME}.* TO '${DB_USER}'@'localhost';
FLUSH PRIVILEGES;
MYSQL_SCRIPT

echo "Database setup complete!"
echo "DB: ${DB_NAME}, User: ${DB_USER}, Password: ${DB_PASSWORD}"
