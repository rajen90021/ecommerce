import sequelize from './src/database/connection.js';

async function fixDb() {
    try {
        console.log('Starting DB fix...');
        await sequelize.query('ALTER TABLE users MODIFY email VARCHAR(255) NULL;');
        await sequelize.query('ALTER TABLE users MODIFY password VARCHAR(255) NULL;');
        try {
            await sequelize.query('ALTER TABLE users ADD COLUMN firebase_uid VARCHAR(255) NULL UNIQUE;');
        } catch (e) {
            console.log('firebase_uid might already exist or error adding: ', e.message);
        }
        console.log('DB fix completed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Error fixing DB:', error);
        process.exit(1);
    }
}

fixDb();
