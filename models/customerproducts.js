const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Defining the CustomerProducts join table model
const CustomerProducts = sequelize.define('CustomerProducts', {
    CustomerId: {
        type: DataTypes.INTEGER,
        references: {
            model: 'Customers',
            key: 'id'
        },
        allowNull: false
    },
    ProductId: {
        type: DataTypes.INTEGER,
        references: {
            model: 'Products',
            key: 'id'
        },
        allowNull: false
    },

    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
}, {
    timestamps: true,
    tableName: 'CustomerProducts' // Make sure the table name is correct
});

module.exports = CustomerProducts;
