const path = require('path');

const rootDir = __dirname;
const frontendDir = path.join(rootDir, 'frontend');
const logDir = path.join(rootDir, 'logs');
const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';

function createLogPaths(fileName) {
  return {
    error_file: path.join(logDir, 'errors', `${fileName}.log`),
    out_file: path.join(logDir, 'outs', `${fileName}.log`),
    log_file: path.join(logDir, `${fileName}.log`)
  };
}

module.exports = {
  apps: [
    {
      name: 'bt-service',
      cwd: rootDir,
      script: 'node',
      args: 'dist/main.js',
      autorestart: false,
      watch: false,
      env: {
        NODE_ENV: 'production'
      },
      ...createLogPaths('brawl-tree-service')
    },
    {
      name: 'bt-service-backend-dev',
      cwd: rootDir,
      script: npmCommand,
      args: 'run start:dev',
      interpreter: 'none',
      watch: false,
      env: {
        NODE_ENV: 'development'
      },
      ...createLogPaths('brawl-tree-service-backend-dev')
    },
    {
      name: 'bt-service-frontend-dev',
      cwd: frontendDir,
      script: npmCommand,
      args: 'run dev',
      interpreter: 'none',
      watch: false,
      env: {
        NODE_ENV: 'development'
      },
      ...createLogPaths('brawl-tree-service-frontend-dev')
    }
  ]
};
