import { DataTypes } from 'sequelize';
import sequelize from '../../database/connection.js';

const user = sequelize.define('user', {

    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    image: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    firebase_uid: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
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
    timestamps: false,
    tableName: 'users',
    underscored: true,
});


export default user;