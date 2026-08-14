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
        CORS_ORIGIN: 'https://bucaresuite.com,https://www.bucaresuite.com,http://bucaresuite.com,http://www.bucaresuite.com,http://bucaredemo.ddns.net,https://bucaredemo.ddns.net,http://35.254.151.234',
        DATABASE_URL: 'file:./prod.db',
        JWT_SECRET: 'production_super_secret_key_change_me_later_1234'
      }
    },
    {
      name: 'bucare-frontend',
      // Assuming TanStack start uses standard bun/npm start or vite build + serve
      // For Vite + Tanstack start production mode:
      script: 'node',
      args: '.output/server/index.mjs',
      cwd: './',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    }
  ]
};
