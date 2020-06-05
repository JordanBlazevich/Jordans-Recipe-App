//Database connection
const Sequelize = require('sequelize');

module.exports = new Sequelize('recipedb', 'root', 'password', {
    host: 'localhost',
    dialect: 'mysql'
});