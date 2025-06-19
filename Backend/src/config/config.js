import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Resolve current file directory (since you're using ES modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get current environment (defaults to development)
const env = process.env.NODE_ENV || 'development';

// Dynamically load the appropriate .env file
const envFilePath = path.resolve(__dirname, `../../.env.${env}`);
dotenv.config({ path: envFilePath });

// Now build the config object
const config = {
  env,
  port: process.env.PORT || 3000,
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    username: process.env.DB_USER || 'user',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'database',
  },
  apiUrl: process.env.API_URL,
  socketUrl: process.env.SOCKET_URL,
};

export default config;
