# Deployment Guide for blog.coke-twitter.com

## Overview
- Full-stack blog system with React frontend and Node.js backend
- Backend runs on port 3020 behind Nginx with HTTPS
- Frontend is served as static files via Nginx
- Uses existing MySQL and Redis on VPS
- PM2 for process management and auto-start on boot

## Prerequisites
- **DNS**: A record `blog.coke-twitter.com` -> server IP (107.174.39.191)
- **VPS**: Ubuntu 20.04/22.04
- **Existing services**: MySQL and Redis already running
- **Other sites**: Don't interfere with coke-twitter.com, binance.coke-twitter.com, nof1

## Quick Start

### 1. SSH into the server
```bash
ssh root@107.174.39.191
# Password: MfFR35r52jFC7lZyv6
```

### 2. Create database and user
```bash
sudo bash /opt/coke-blog/deploy/scripts/init_mysql.sh
```

This creates:
- Database: `coke_blog`
- User: `coke_blog_user`
- Password: `CokeBlog@2025SecurePass`

### 3. Deploy the application
```bash
sudo bash /opt/coke-blog/deploy/scripts/deploy_pm2.sh
```

This will:
- Clone/update the repository to `/opt/coke-blog`
- Install dependencies
- Build the frontend
- Create backend `.env` with secure passwords
- Start backend with PM2 (process name: `coke-blog-backend`)
- Configure PM2 to auto-start on boot

### 4. Configure Nginx and HTTPS
```bash
sudo bash /opt/coke-blog/deploy/scripts/setup_nginx.sh blog.coke-twitter.com
```

This will:
- Create Nginx configuration for the subdomain
- Enable the site
- Setup HTTPS with Let's Encrypt

### 5. Validate
- Backend health: `https://blog.coke-twitter.com/api/v1/health`
- Website: `https://blog.coke-twitter.com`
- Login with: `admin@cokeblog.com` / `CokeBlogAdmin@2025!Secure#Pass`

## Configuration Details

### Ports
- Backend: 3020
- Frontend: Served as static files via Nginx

### Database
- DB: `coke_blog`
- User: `coke_blog_user`
- Password: `CokeBlog@2025SecurePass`
- Uses existing MySQL instance on localhost

### Environment Variables
Created automatically in `/opt/coke-blog/backend/.env`:
- Database credentials
- JWT secrets (auto-generated)
- Admin credentials
- CORS origin

### PM2 Process
- Name: `coke-blog-backend`
- Logs: `/var/log/pm2/` or use `sudo pm2 logs coke-blog-backend`
- Auto-start: Enabled via `pm2 startup`

## Maintenance

### Update application
```bash
cd /opt/coke-blog
sudo git pull origin main
sudo bash deploy/scripts/deploy_pm2.sh
```

### View logs
```bash
sudo pm2 logs coke-blog-backend
```

### Restart backend
```bash
sudo pm2 restart coke-blog-backend
```

### Stop backend
```bash
sudo pm2 stop coke-blog-backend
```

### Database backup
```bash
mysqldump -u coke_blog_user -p coke_blog > backup_$(date +%Y%m%d).sql
```

## Troubleshooting

### Check PM2 status
```bash
sudo pm2 status
sudo pm2 logs coke-blog-backend --lines 100
```

### Check Nginx
```bash
sudo nginx -t
sudo systemctl status nginx
sudo tail -f /var/log/nginx/error.log
```

### Check database connection
```bash
mysql -u coke_blog_user -p coke_blog -e "SHOW TABLES;"
```

### Rebuild frontend
```bash
cd /opt/coke-blog/frontend
sudo npm run build
```

## Security Notes
- Admin password is complex: `CokeBlogAdmin@2025!Secure#Pass`
- JWT secrets are randomly generated
- HTTPS is enforced
- Database user has minimal privileges (only to coke_blog database)

## Uninstall (if needed)
```bash
sudo pm2 stop coke-blog-backend
sudo pm2 delete coke-blog-backend
sudo pm2 save
sudo rm -f /etc/nginx/sites-enabled/blog.coke-twitter.com
sudo rm -f /etc/nginx/sites-available/blog.coke-twitter.com
sudo nginx -t && sudo systemctl reload nginx
sudo rm -rf /opt/coke-blog
```

To remove database:
```bash
sudo mysql -u root
DROP DATABASE IF EXISTS coke_blog;
DROP USER IF EXISTS 'coke_blog_user'@'localhost';
exit
```
