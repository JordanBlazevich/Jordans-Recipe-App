const Sequelize = require('sequelize');
const db = require('../config/database');


const Ingredient = db.define('ingredient', {
    IngredientID: {
        type: Sequelize.INTEGER,
        primaryKey: true
    },
    Name: {
        type: Sequelize.STRING
    }
}, { freezeTableName: true, timestamps: false })

module.exports = Ingredient;