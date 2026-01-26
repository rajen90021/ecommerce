import { DataTypes } from 'sequelize';
import sequelize from '../../database/connection.js';

const Location = sequelize.define('location', {
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
    },
    city_name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    state: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 'West Bengal'
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    delivery_charge: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 50.00
    },
    min_order_amount: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'created_at'
    },
    updatedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'updated_at'
    }
}, {
    timestamps: false,
    tableName: 'locations',
    underscored: true
});

export default Location;
