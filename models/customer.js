const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Product = require('./product');
const CustomerProducts = require('./customerproducts');

const Customer = sequelize.define('Customer', {
    firstName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    lastName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    timestamps: true,
    tableName: 'Customers' // Ensure this matches the table name in the database
});

// Many-to-Many relationship with Product
Customer.belongsToMany(Product, { through: CustomerProducts, foreignKey: 'CustomerId' });
Product.belongsToMany(Customer, { through: CustomerProducts, foreignKey: 'ProductId' });

module.exports = Customer;
