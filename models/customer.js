const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Product = require('./product');
const CustomerProducts = require('./customerproducts');

const Customer = sequelize.define('Customer', {
    firstName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true,
        }
    },
    lastName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true,
        }
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true,
            isEmail: true,
        }
    },
    mobile: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true,
        }
    },
    address: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true,
        }
    },
    zipcode: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true,
        }
    }
}, {
    timestamps: true,
    tableName: 'Customers' 
});

// Many-to-Many relationship with Product
Customer.belongsToMany(Product, { through: CustomerProducts, foreignKey: 'CustomerId' });
Product.belongsToMany(Customer, { through: CustomerProducts, foreignKey: 'ProductId' });

module.exports = Customer;
