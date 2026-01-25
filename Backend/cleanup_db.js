import sequelize from './src/database/connection.js';

async function cleanupIndices() {
    try {
        console.log('Cleaning up redundant indices...');
        for (let i = 1; i <= 63; i++) {
            try {
                await sequelize.query(`ALTER TABLE users DROP INDEX email_${i};`);
                console.log(`Dropped email_${i}`);
            } catch (e) { }
        }
        // Also try to drop the plain 'email' unique index if it exists, or let it be.
        // Let's add the firebase_uid column now.
        try {
            await sequelize.query('ALTER TABLE users ADD COLUMN firebase_uid VARCHAR(255) NULL UNIQUE;');
            console.log('Added firebase_uid column.');
        } catch (e) {
            console.log('firebase_uid error: ', e.message);
        }
        console.log('Cleanup completed.');
        process.exit(0);
    } catch (error) {
        console.error('Error during cleanup:', error);
        process.exit(1);
    }
}

cleanupIndices();
