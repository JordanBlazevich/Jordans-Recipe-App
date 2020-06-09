const Sequelize = require('sequelize');
const db = require('../config/database');


const RecipeInstruction = db.define('recipeinstruction', {
    RecipeInstructionID: {
        type: Sequelize.INTEGER,
        primaryKey: true
    },
    RecipeID: {
        type: Sequelize.INTEGER
    },
    Step: {
        type: Sequelize.INTEGER
    },
    Instruction: {
        type: Sequelize.STRING
    }
}, { freezeTableName: true, timestamps: false })

module.exports = RecipeInstruction;