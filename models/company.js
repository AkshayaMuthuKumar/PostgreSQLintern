const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Company = sequelize.define('Company', {
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    location: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    timestamps: true, // Automatically manage `createdAt` and `updatedAt`
    tableName: 'Companies'
});

module.exports = Company;
