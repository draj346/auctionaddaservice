module.exports = {
  apps: [{
    name: "auctionbackend",
    script: "./dist/app.js",
    interpreter: "/root/.nvm/versions/node/v22.14.0/bin/node",
    cwd: "/home/cricketauction",
    env: {
      NODE_ENV: "production",
      PORT: 3000
    },
    instances: 1,
    exec_mode: "fork",
    max_memory_restart: "400M",
    autorestart: true,
    time: true,
    max_restarts: 5,
    min_uptime: "30s",
    listen_timeout: 10000,
    restart_delay: 5000,
    watch: false,
    ignore_watch: [
      "node_modules",
      "src",
      ".git",
      "*.ts"
    ],
    log_date_format: "YYYY-MM-DD HH:mm Z",
    error_file: "../pm2_logs/error.log",
    out_file: "../pm2_logs/output.log",
    merge_logs: true,
    post_restart: "npm run build",
  }]
};