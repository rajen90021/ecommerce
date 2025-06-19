import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const user = sequelize.define('user', {

    id: {
        type: DataTypes.UUID,
      
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,

      
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
      
    },
  
   
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
       
    },
  
    created_At: {
        type: DataTypes.DATE,
        allowNull: true,

    },
    updated_At: {
        type: DataTypes.DATE,
        allowNull: true
    },
}, {
    timestamps: false,
    tableName: 'users',
    underscored: true,
    
});


export default user;