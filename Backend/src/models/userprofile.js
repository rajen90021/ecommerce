
import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';


const UserProfile = sequelize.define('user_profile', {
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
    },
    user_id: {
        type: DataTypes.UUID,
        allowNull: false,
    },
      image: {
        type: DataTypes.STRING,
        allowNull: true,
    },

    phone:{
        type: DataTypes.STRING,
        allowNull: true,
    },
    is_verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    otp_code: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    otp_expires_at: {
        type: DataTypes.DATE,
        allowNull: true,
    },
     reset_otp: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    reset_otp_expires_at: {
        type: DataTypes.DATE,
        allowNull: true,
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
    timestamps: true, // Automatically adds createdAt and updatedAt fields
    tableName: 'user_profiles', // Specify the table 
    underscored: true, // Use snake_case for column names
});

export default UserProfile;