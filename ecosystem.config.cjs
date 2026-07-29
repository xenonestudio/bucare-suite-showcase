module.exports = {
  apps: [
    {
      name: 'bucare-backend',
      script: 'npm',
      args: 'run start',
      cwd: './backend',
      env: {
        NODE_ENV: 'production',
        PORT: 5000,
        CORS_ORIGIN: 'http://bucaresuite.ddns.net,http://35.254.151.234',
        DATABASE_URL: 'file:./prod.db'
      }
    },
    {
      name: 'bucare-frontend',
      // Assuming TanStack start uses standard bun/npm start or vite build + serve
      // For Vite + Tanstack start production mode:
      script: 'npm',
      args: 'run start',
      cwd: './',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    }
  ]
};
