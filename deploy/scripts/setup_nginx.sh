#!/bin/bash
set -e

DOMAIN="${1:-blog.coke-twitter.com}"
BACKEND_PORT=3020
APP_DIR="/opt/coke-blog"

echo "Setting up Nginx for $DOMAIN..."

# Create Nginx configuration
sudo tee /etc/nginx/sites-available/$DOMAIN > /dev/null << NGINX_CONF
server {
    listen 80;
    server_name $DOMAIN;

    # Frontend - serve static files
    location / {
        root $APP_DIR/frontend/dist;
        try_files \$uri \$uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:$BACKEND_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
NGINX_CONF

# Enable site
sudo ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/

# Test Nginx configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx

echo "Nginx configured for $DOMAIN"

# Setup HTTPS with Certbot
echo "Setting up HTTPS..."
sudo certbot --nginx -d $DOMAIN --non-interactive --agree-tos --register-unsafely-without-email --redirect

echo "HTTPS setup complete!"
echo "Site available at: https://$DOMAIN"
