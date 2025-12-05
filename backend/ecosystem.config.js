module.exports = {
  apps: [{
    name: 'coke-blog-backend',
    script: './dist/app.js',
    interpreter: 'node',
    env: {
      NODE_ENV: 'production'
    },
    watch: false,
    instances: 1,
    exec_mode: 'fork',
    max_memory_restart: '500M',
    error_file: '/var/log/pm2/coke-blog-backend-error.log',
    out_file: '/var/log/pm2/coke-blog-backend-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
  }]
};
