import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url'
import config from '../config/config.js';

import userRoutes from '../modules/user/user.routes.js';
import categoryRoutes from '../modules/category/category.routes.js';
import productRoutes from '../modules/product/product.routes.js';
import orderRoutes from '../modules/order/order.routes.js';
import wishlistRoutes from '../modules/wishlist/wishlist.routes.js';
import { errorHandler } from '../middleware/errorHandler.js';
import '../database/associations.js'; // Import associations
import { connectDB } from '../database/connection.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

// middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


const PORT = config.port || 3000;
console.log(config.env)


// *** Add this line to serve images ***
app.use('/images', express.static(path.join(__dirname, '../public/images')));

// routes
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/wishlist', wishlistRoutes);


// middleware for error handling
app.use(errorHandler);


// listen on port
const startServer = async () => {
  await connectDB(); // ✅ DB connected first

  // ⛔ IMPORT AFTER DB is connected to avoid circular import
  const { createRole } = await import('../scripts/seedRoles.js');
  await createRole();
  console.log('✅ Roles seeded.');

  app.listen(PORT, () => {
    console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  });
};

startServer();