// import mysql from 'mysql2/promise';
// import  config  from './config.js';

// const pool = mysql.createPool({
//   host: config.db.host,
//   port: config.db.port,
//   user: config.db.username,
//   password: config.db.password,
//   database: config.db.database,
// });



// export default pool;


import { Sequelize } from 'sequelize';
import config from './config.js';
import fs from 'fs';
import path from 'path';

// // Load CA certificate
// const caCertPath = path.resolve('certs/ca.pem');
// const caCert = fs.readFileSync(caCertPath);

const sequelize = new Sequelize(
  config.db.database,
  config.db.username,
  config.db.password,
  {
    host: config.db.host,
    port: config.db.port,
    dialect: 'mysql',
    logging: false, // set to true if you want SQL query logs
  //   dialectOptions: {
  //   ssl: {
  //     ca: caCert,
  //     rejectUnauthorized: false, // TEMP: true in production
  //     minVersion: 'TLSv1.2',
  //   }
  // }

   
  }
);

export default sequelize;
export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');

    // Use { force: true } to drop and recreate tables
   await sequelize.sync({force: true }); // Alters tables to match models

    console.log('table sync complete!');
   
   


  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1); // Exit the process with failure
  }
};

