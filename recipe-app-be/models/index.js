//Imports
const Recipe = require('./recipe');
const Ingredient = require('./ingredient');
const Measure = require('./measure');
const RecipeIngredient = require('./recipeIngredient');


/***********Associations***********/

//Recipe
Recipe.hasMany(RecipeIngredient, {foreignKey: 'RecipeID', sourceKey: 'RecipeID'})

//RecipeIngredient
RecipeIngredient.belongsTo(Recipe, {foreignKey: 'RecipeID', targetKey: 'RecipeID'})
RecipeIngredient.belongsTo(Measure, {foreignKey: 'MeasureID', sourceKey: 'MeasureID'})
RecipeIngredient.belongsTo(Ingredient, {foreignKey: 'IngredientID', sourceKey: 'IngredientID'})

//Ingredient
Ingredient.hasMany(RecipeIngredient, {foreignKey: 'IngredientID', sourceKey: 'IngredientID'})

//Measure
Measure.hasMany(RecipeIngredient, {foreignKey: 'MeasureID', sourceKey: 'MeasureID'})

module.exports = {
    Recipe: Recipe,
    Ingredient: Ingredient,
    Measure: Measure,
    RecipeIngredient: RecipeIngredient,  
}