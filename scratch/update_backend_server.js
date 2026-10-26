const fs = require('fs');

let serverCode = fs.readFileSync('backend/server.js', 'utf8');

if (!serverCode.includes("auth.routes.js")) {
  serverCode = serverCode.replace(
    "import notificationsRoutes from './routes/notifications.routes.js';",
    "import notificationsRoutes from './routes/notifications.routes.js';\nimport authRoutes from './routes/auth.routes.js';"
  );

  serverCode = serverCode.replace(
    "app.use('/api/notifications', notificationsRoutes);",
    "app.use('/api/notifications', notificationsRoutes);\napp.use('/api/auth', authRoutes);"
  );

  fs.writeFileSync('backend/server.js', serverCode, 'utf8');
  console.log('backend/server.js updated with authRoutes');
} else {
  console.log('authRoutes already present in backend/server.js');
}
