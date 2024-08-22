const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Company = require('./company');

const Product = sequelize.define('Product', {
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    price: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    companyId: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    timestamps: true,
    tableName: 'Products' 
});

Product.belongsTo(Company, { foreignKey: 'companyId', allowNull: false });
Company.hasMany(Product, { foreignKey: 'companyId' });

module.exports = Product;
