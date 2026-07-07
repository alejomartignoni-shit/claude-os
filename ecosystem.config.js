module.exports = {
  apps: [
    {
      name: 'claude-os-backend',
      script: 'main.py',
      interpreter: 'python',
      cwd: 'C:/Users/Alejo/claude-os/backend',
      env: { PORT: '8082' },
      log_file: 'C:/Users/Alejo/claude-os/logs/backend.log',
      error_file: 'C:/Users/Alejo/claude-os/logs/backend-error.log',
    },
    {
      name: 'claude-os-frontend',
      script: 'npm',
      args: 'run dev',
      cwd: 'C:/Users/Alejo/claude-os/frontend',
      log_file: 'C:/Users/Alejo/claude-os/logs/frontend.log',
      error_file: 'C:/Users/Alejo/claude-os/logs/frontend-error.log',
    },
  ],
}
