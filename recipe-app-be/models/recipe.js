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
    Image: {
        type: Sequelize.STRING
    },
    Source: {
        type: Sequelize.STRING
    },
    Url: {
        type: Sequelize.STRING
    },
    Yield: {
        type: Sequelize.INTEGER
    },
    Calories: {
        type: Sequelize.FLOAT
    },
    Description: {
        type: Sequelize.STRING
    }
}, { freezeTableName: true, timestamps: false })

module.exports = Recipe;