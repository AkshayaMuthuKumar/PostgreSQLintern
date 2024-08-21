const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('student_db', 'postgres', 'Krithvik23??', {
  host: 'localhost',
  dialect: 'postgres',
});

module.exports = sequelize;
