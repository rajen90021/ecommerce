dotenv.config();
import dotenv from 'dotenv';
import express from 'express';

import path from 'path';
import { fileURLToPath } from 'url'
import config from '../config/config.js';
import {connectDB} from '../config/db.js';
import userRoutes from '../routes/user.routes.js';
import { errorHandler } from '../middleware/errorHandler.js';
import '../config/association.js'; // Import associations to ensure they are registered
import { rateLimiter } from '../middleware/rateLimiter.js';
import logger from '../helpers/logger.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


const PORT = config.port || 3000;
console.log(config.env)
// db
connectDB();

// *** Add this line to serve images ***
app.use('/images', express.static(path.join(__dirname, '../public/images')));

// routes
app.use('/api/users', userRoutes);


// middleware for error handling
app.use(errorHandler);



// listen on port
app.listen(PORT, () => {
  logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
