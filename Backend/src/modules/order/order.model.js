import { DataTypes } from 'sequelize';
import sequelize from '../../database/connection.js';

const Order = sequelize.define('order', {
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
    },
    order_number: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    total_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    discount_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
    },
    gross_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    shipping_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
    },
    net_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('placed', 'processing', 'shipping', 'delivered'),
        allowNull: false,
        defaultValue: 'placed'
    },
    payment_status: {
        type: DataTypes.ENUM('paid', 'not_paid'),
        allowNull: false,
        defaultValue: 'not_paid'
    },
    payment_type: {
        type: DataTypes.ENUM('netbanking', 'upi', 'cod'),
        allowNull: true
    },
    payment_transaction_id: {
        type: DataTypes.STRING,
        allowNull: true
    },
    created_At: {
        type: DataTypes.DATE,
        allowNull: true
    },
    updated_At: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    timestamps: false,
    tableName: 'orders',
    underscored: true
});

export default Order; 