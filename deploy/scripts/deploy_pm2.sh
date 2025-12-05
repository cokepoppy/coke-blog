#!/bin/bash
set -e

APP_DIR="/opt/coke-blog"
REPO_URL="https://github.com/cokepoppy/coke-blog.git"
BACKEND_PORT=3020
FRONTEND_PORT=5173

echo "Deploying Coke Blog application..."

# Create app directory if it doesn't exist
if [ ! -d "$APP_DIR" ]; then
    echo "Cloning repository..."
    sudo git clone $REPO_URL $APP_DIR
else
    echo "Updating repository..."
    cd $APP_DIR
    sudo git pull origin main
fi

cd $APP_DIR

# Install backend dependencies
echo "Installing backend dependencies..."
cd backend
sudo npm install --production

# Create backend .env file
echo "Creating backend .env file..."
sudo tee .env > /dev/null << ENV_FILE
NODE_ENV=production
PORT=$BACKEND_PORT

# Database
DB_TYPE=mysql
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=coke_blog_user
DB_PASSWORD=CokeBlog@2025SecurePass
DB_DATABASE=coke_blog

# JWT Secrets
JWT_SECRET=$(openssl rand -base64 32)
JWT_REFRESH_SECRET=$(openssl rand -base64 32)
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# Default Admin
DEFAULT_ADMIN_EMAIL=admin@cokeblog.com
DEFAULT_ADMIN_PASSWORD=CokeBlogAdmin@2025!Secure#Pass

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# CORS
CORS_ORIGIN=https://blog.coke-twitter.com
ENV_FILE

# Install frontend dependencies and build
echo "Building frontend..."
cd $APP_DIR/frontend
sudo npm install
sudo npm run build

# Setup PM2 for backend
echo "Configuring PM2..."
cd $APP_DIR

# Stop existing processes if any
sudo pm2 stop coke-blog-backend 2>/dev/null || true
sudo pm2 delete coke-blog-backend 2>/dev/null || true

# Start backend with PM2
cd backend
sudo pm2 start src/app.ts --name coke-blog-backend --interpreter ts-node --watch false --env production

# Save PM2 configuration
sudo pm2 save

# Setup PM2 to start on boot
sudo pm2 startup systemd -u root --hp /root

echo "Backend deployed successfully on port $BACKEND_PORT"
echo "Frontend built successfully, serve via Nginx"
echo "PM2 process: coke-blog-backend"
