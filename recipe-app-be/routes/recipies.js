const db = require('../config/database');
const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const index = require('../models/index');
const axios = require('axios');
var _ = require('lodash');

//************** Recipe API ID/Key **************** */
const app_id = '88ec001b';
const app_key = '17d4790e2012282b8e8e49eb649838dd';

/**
 * This function returns a list of every RecipeID and its associated Name and Description in the database.
 */
router.get(('/'), (req, res) =>
    index.Recipe.findAll({attributes: ['RecipeID', 'Name', 'Image', 'Source', 'Url', 'Yield', 'Calories']})
    .then(recipe =>{
        res.status(200).send(recipe);
    })
    .catch(err => 
        res.status(500).send({
            message: 'Error loading recipies from database'
        })
    )
);

/**
 * This function returns a single recipe based on its RecipeID.
 */
router.get(('/:id'), (req, res) => {
    if(req.params.id) {
        index.Recipe.findByPk(req.params.id, {attributes: ['RecipeID', 'Name', 'Image', 'Source', 'Url', 'Yield', 'Calories']})
        .then(result =>{
            res.status(200).send(result);
            res.end();
        })
        .catch(err =>
            res.status(500).send({
                message: 'Recipe information could not be loaded',
                error: err.toString()
             })
            );
        // try {
        // var recipe = index.Recipe.findByPk(req.params.id, {attributes: ['RecipeID', 'Name', 'Image', 'Source', 'Url', 'Yield', 'Calories']});
        // // var ingredients = index.RecipeIngredient.findAll({ where: { RecipeID: req.params.id }});
        // // var instructions = index.RecipeInstruction.findAll({ where: { RecipeID: req.params.id }});
        // // var completeRecipe = JSON.stringify(recipe, ingredients, instructions);

        // // console.log(recipe);
        // // console.log(ingredients);
        // // console.log(instructions);

        // res.status(200).send({
        //     recipe
        //     // RecipeID: recipe.RecipeID,
        //     // RecipeName: recipe.Name,
        //     // Description: recipe.Description,
        //     // Instructions: recipe.Instructions,
        //     // Ingredients: ingredients
        // });
        // } catch (e) {
        //     res.status(500).send({
        //                     message: 'Recipe information could not be loaded',
        //                     error: e.message
        //                  });
        // }
     }
});

/**
 * This function creates a new recipe in the database and returns the PK for the new recipe.
 * 
 * Test Obj:
 *              {"name": "testRecipe",
                "image": "testImage",
                "source": "testSource",
                "url": "testUrl",
                "yield": 1,
                "calories": 500,
                "description": "teste description goes here",
                "ingredients": [
                    {
                        "ingredientId": 1,
                        "measureId": 1,
                        "amount": 1
                    },
                    {
                        "ingredientId": 2,
                        "measureId": 2,
                        "amount": 1
                    },
                    {
                        "ingredientId": 3,
                        "measureId": 3,
                        "amount": 1
                    },
                    {
                        "ingredientId": 4,
                        "measureId": 4,
                        "amount": 1
                    }
                ],
                "instructions": [
                    {
                        "step": 1,
                        "instruction": "take this 1"
                    },
                    {
                        "step": 2,
                        "instruction": "take this 2"
                    },
                    {
                        "step": 3,
                        "instrucion": "take this 3"
                    },
                    {
                        "step": 4,
                        "instruction": "take this 4"
                    }]}
 */
router.post(('/create'), (req, res) => {
    if(!req.body.name) {
        return res.status(422).send({
            message: 'Recipe name is required.'
         });
    } 
    else {
        // Declare variables START
        var validationErrors = false;

        var name;
        var image;
        var source;
        var url;
        var yield;
        var calories;
        var description;

        var ingredients = [];
        var instructions = [];
        // Declare variables END 

        // Validation START
        // Check if image is in request
        if(!req.body.image) {
            image = null;
        }
        else {
            image = req.body.image;
        // Ensure length is not too long for Db
            if(image.length > 2000) {
                validationErrors = true;
                errorMessage = 'Image URL cannot be more than 2000 characters long';
            }
        }
        
        if(!validationErrors) {
            // Check if source is in request
            if(!req.body.source) {
                source = null;
            }
            else {
                source = req.body.source;
            // Ensure length is not too long for Db
                if(source.length > 2000) {
                    validationErrors = true;
                    errorMessage = 'Source URL cannot be more than 2000 characters long';
                }
            }
        }

        if(!validationErrors) {
            // Check if Url is in request
            if(!req.body.url) {
                url = null;
            }
            else {
                url = req.body.url;
            // Ensure length is not too long for Db
                if(url.length > 2000) {
                    validationErrors = true;
                    errorMessage = 'URL cannot be more than 2000 characters long';
                }
            }
        }

        if(!validationErrors) {
            // Check if yield is in request
            if(!req.body.yield) {
                yield = null;
            }
            else {
                yield = req.body.yield;
            // Check if a number
                if(isNaN(yield)) {
                    validationErrors = true;
                    errorMessage = 'Yield must be a number';
                }
            }
        }

        if(!validationErrors) {
            // Check if calories is in request
            if(!req.body.calories) {
                calories = null;
            }
            else {
                calories = req.body.calories;
            // Check if a number
                if(isNaN(calories)) {
                    validationErrors = true;
                    errorMessage = 'Calories must be a number';
                }
            }
        }

        // if(!validationErrors) {
        //     // Check if description is in request
        //     if(!req.body.description) {
        //         description = null;
        //     }
        //     else {
        //         description = req.body.description;
        //     // Check if length correct
        //         if(description.length > 50) {
        //             validationErrors = true;
        //             errorMessage = 'Description cannot be more than 50 characters long';
        //         }
        //     }
        // }

        if(!validationErrors) {
            // Check if ingredients are in request
            if(!req.body.ingredients) {
                validationErrors = true;
                errorMessage = 'A recipe needs at least 1 ingredient.';
            }
            else {
                // TODO: figure out how to validate that the right properties are included
                ingredients = req.body.ingredients;
            }
        }

        if(!validationErrors) {
            // Check if instructions are in request
            if(!req.body.instructions) {
                validationErrors = true;
                errorMessage = 'A recipe needs at least 1 instruction.';
            }
            else {
                // TODO: figure out how to validate that the right properties are included
                instructions = req.body.instructions;
                console.log(instructions);
                console.log(ingredients);
            }
        }
        // Validation END

        // Creation START
        if(!validationErrors) {
            index.Recipe.create({
                Name: name,
                Image: image,
                Source: source,
                Url: url,
                Yield: yield,
                Calories: calories
            }, {freezeTableName: true})
            // TODO: Figure out why this creation method doesnt work past here, 'Unhandled rejection SequelizeDatabaseError: Column 'RecipeID' cannot be null'
            .then(newRecipe => {
                var recId = newRecipe.dataValues.RecipeID;
                ingredients.forEach(element => {
                    index.RecipeIngredient.create({
                        RecipeID: recId,
                        IngredientID: element.IngredientID,
                        MeasureID: element.MeasureID,
                        Amount: element.Amount
                    })
                })
                instructions.forEach(element => {
                    index.RecipeInstruction.create({
                        RecipeID: recId,
                        Step: element.step,
                        Instruction: element.instruction
                    })
                })
                res.status(201).send('A recipe record for ' + newRecipe.dataValues.Name + ' has been created.')
            })
            .catch(e =>
                res.status(422).send({
                    message: e.message
                })
            )
        }
        // Creation END 
    }
})

/**
 * This function returns a list of recipes matching the query from the Edamam recipe API.
 */
router.get(('/edamam/:queryText'), (req, res) =>    
    axios({
        method: 'get',
        url: 'https://api.edamam.com/search?q=' + req.params.queryText.toString() + 
                                                  '&app_id=' + app_id + 
                                                  '&app_key=' + app_key
    })
    .then(results =>{
        var recipes = {

        }
        res.status(200).send(
            JSON.parse(JSON.stringify(results.data.hits))
            );
    })
    .catch(err => 
        res.status(500).send({
            message: 'Error loading recipies from database',
            error: err.toString()
        })
    )
);

module.exports = router;