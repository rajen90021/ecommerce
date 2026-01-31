import { Sequelize, Op } from 'sequelize';
import config from '../config/config.js';

/**
 * Database Configuration
 * Manages the connection pool to the database.
 */

const sequelize = new Sequelize(
    config.db.database,
    config.db.username,
    config.db.password,
    {
        host: config.db.host,
        port: config.db.port,
        dialect: 'postgres',
        logging: false,
        dialectOptions: config.db.ssl ? {
            ssl: {
                rejectUnauthorized: false // Required for some hosted PostgreSQL like Aiven
            }
        } : {},
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    }
);

/**
 * Test database connection
 */
export const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Database connection established successfully.');

        // In production, you MUST use migrations. 
        // In dev, you can use sync if you want, but migrations are preferred.
        if (config.env === 'development') {
            // Use basic sync without alter to avoid "too many keys" error
            await sequelize.sync({ force: false });
            console.log(`ℹ️  DB Synced successfully for ${config.env} mode.`);
        }
        // For production, rely on migrations only (no sync)
        console.log('ℹ️  Using Sequelize Migrations for schema management.');
    } catch (error) {
        console.error('❌ Unable to connect to the database:', error);
        process.exit(1);
    }
};

export default sequelize;
export { Op };
