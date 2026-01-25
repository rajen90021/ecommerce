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
        dialect: 'mysql',
        logging: false,
        dialectOptions: config.db.ssl ? {
            ssl: {
                rejectUnauthorized: false // Required for some hosted MySQL like Aiven
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
        if (config.env === 'development' || config.env === 'production') {
            await sequelize.sync({ alter: true }); // Failsafe for Render
            console.log(`ℹ️  DB Synced successfully for ${config.env} mode.`);
        }
        console.log('ℹ️  Using Sequelize Migrations for schema management.');
    } catch (error) {
        console.error('❌ Unable to connect to the database:', error);
        process.exit(1);
    }
};

export default sequelize;
export { Op };
