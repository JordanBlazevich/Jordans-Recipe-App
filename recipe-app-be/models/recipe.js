const Sequelize = require('sequelize');
const db = require('../config/database');


const Recipe = db.define('recipe', {
    RecipeID: {
        type: Sequelize.INTEGER,
        primaryKey: true
    },
    Name: {
        type: Sequelize.STRING
    },
    Description: {
        type: Sequelize.STRING
    },
    Instructions: {
        type: Sequelize.STRING
    }
}, { freezeTableName: true, timestamps: false })

module.exports = Recipe;