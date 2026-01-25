import { DataTypes } from 'sequelize';
import sequelize from '../../database/connection.js';

const role = sequelize.define('role', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },

    role_name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
}, {
    tableName: 'role',
    underscored: true,
});

export default role;