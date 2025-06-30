import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url'
import config from '../config/config.js';

import userRoutes from '../routes/user.routes.js';
import { errorHandler } from '../middleware/errorHandler.js';
import '../config/association.js'; // Import associations to ensure they are registered
import { connectDB } from '../config/db.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


const PORT = config.port || 3000;
console.log(config.env)


// *** Add this line to serve images ***
app.use('/images', express.static(path.join(__dirname, '../public/images')));

// routes
app.use('/api/users', userRoutes);


// middleware for error handling
app.use(errorHandler);


// listen on port
const startServer = async () => {
  await connectDB(); // ✅ DB connected first

  // ⛔ IMPORT AFTER DB is connected to avoid circular import
  const { createRole } = await import('../helpers/createRole.js');
  await createRole();
  console.log('✅ Roles seeded.');

  app.listen(PORT, () => {
    console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  });
};

startServer();