//Imports
const Recipe = require('./recipe');
const Ingredient = require('./ingredient');
const Measure = require('./measure');
const RecipeIngredient = require('./recipeIngredient');
const RecipeInstruction = require('./recipeInstruction');


/***********Associations***********/

//Recipe
Recipe.hasMany(RecipeIngredient, {foreignKey: 'RecipeID', sourceKey: 'RecipeID'})
Recipe.hasMany(RecipeInstruction, {foreignKey: 'RecipeID', sourceKey: 'RecipeID'})

//RecipeIngredient
RecipeIngredient.belongsTo(Recipe, {foreignKey: 'RecipeID', targetKey: 'RecipeID'})
RecipeIngredient.belongsTo(Measure, {foreignKey: 'MeasureID', sourceKey: 'MeasureID'})
RecipeIngredient.belongsTo(Ingredient, {foreignKey: 'IngredientID', sourceKey: 'IngredientID'})

//RecipeInstruction
RecipeInstruction.belongsTo(Recipe, {foreignKey: 'RecipeID', targetKey: 'RecipeID'})

//Ingredient
Ingredient.hasMany(RecipeIngredient, {foreignKey: 'IngredientID', sourceKey: 'IngredientID'})

//Measure
Measure.hasMany(RecipeIngredient, {foreignKey: 'MeasureID', sourceKey: 'MeasureID'})

module.exports = {
    Recipe: Recipe,
    Ingredient: Ingredient,
    Measure: Measure,
    RecipeIngredient: RecipeIngredient, 
    RecipeInstruction: RecipeInstruction 
}