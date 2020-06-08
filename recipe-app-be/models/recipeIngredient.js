const Sequelize = require('sequelize');
const db = require('../config/database');


const RecipeIngredient = db.define('recipeingredient', {
    RecipeIngredientID: {
        type: Sequelize.INTEGER,
        primaryKey: true
    },
    RecipeID: {
        type: Sequelize.INTEGER
    },
    IngredientID: {
        type: Sequelize.INTEGER
    },
    MeasureID: {
        type: Sequelize.INTEGER
    },
    Amount: {
        type: Sequelize.INTEGER
    }
}, { freezeTableName: true, timestamps: false })

module.exports = RecipeIngredient;