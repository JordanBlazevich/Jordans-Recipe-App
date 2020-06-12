const db = require('../config/database');
const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const index = require('../models/index');
const axios = require('axios');
var _ = require('lodash');
const sequelize = require('../config/database');
var Promise = require('bluebird');
const { get } = require('lodash');
// const { JSONB } = require('sequelize/types');
// const { Json } = require('sequelize/types/lib/utils');

//************** Recipe API ID/Key **************** */
const APP_ID = '88ec001b';
const APP_KEY = '17d4790e2012282b8e8e49eb649838dd';

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
    // TODO: test if this will still work if no recipe instructions are included, as the way it is now it should fail if no recipe instructions/ingredients in the db
    // TODO: fix the error handling to work properly, testing for result simply doesnt work, test other ways to do this.
    if(req.params.id) {
        function getRecipeDetails(id) {
            return new Promise(function(resolved, rejected) {
                result = index.Recipe.findByPk(id, {attributes: ['RecipeID', 'Name', 'Image', 'Source', 'Url', 'Yield', 'Calories']});
                if(result) {
                    resolved(result); 
                } else {
                    rejected('That recipe does not exist.');
                }
            });
        }

        function getRecipeIngredients(id) {
            return new Promise(function(resolved, rejected) {
                result = index.RecipeIngredient.findAll({ where: { RecipeID: id }}).map(el => el.get({ plain: true }));
                if(result) {
                   resolved(result); 
                } else {
                    rejected('No recipe ingredients exist for that recipe.');
                }
            });
        }
        function getRecipeInstructions(id) {
            return new Promise(function(resolved, rejected) {
                result = index.RecipeInstruction.findAll({ where: { RecipeID: id }}).map(el => el.get({ plain: true }));
                if(result) {
                   resolved(result); 
                } else {
                    rejected('No recipe instructions exist for that recipe.');
                }
            });
        }

        function successHandler(recipe) {
            res.status(200).send(recipe);
        }

        function failHandler(message) {
            res.status(400).send({
                message: message
            });
           // console.log(message);
        }

        (async function() {
            try {
                let responses = [];
                responses.push(await getRecipeDetails(req.params.id));
                responses.push(await getRecipeIngredients(req.params.id));
                responses.push(await getRecipeInstructions(req.params.id));

                // let recipe = responses.map(function(response) {
                //     return successHandler(response)
                // });

                let recipe = {
                    recipe: responses[0],
                    ingredients: responses[1],
                    instructions: responses[2]
                };

                return successHandler(recipe);                
            } catch(e) {
                failHandler(e);
            }
        })();



        // index.Recipe.findByPk(req.params.id, {attributes: ['RecipeID', 'Name', 'Image', 'Source', 'Url', 'Yield', 'Calories']})
        // .then(result =>{
        //     if(!result) {
        //         res.status(404).send({
        //             message: 'That recipe record could not be found in the database.'
        //         });
        //         res.end();
        //     }
        //     else {
        //         //console.log(result);
        //         // var ingredients = index.RecipeIngredient.findAll({ where: { RecipeID: result.dataValues.RecipeID }}, {attributes: ['IngredientID', 'MeasureID', 'Amount'], raw: true})
        //         // var instructions = index.RecipeInstruction.findAll({ where: { RecipeID: result.dataValues.RecipeID }}, {attributes: ['Step', 'Instruction'], raw: true});
        //         // TODO: figure out why this returns a result if you .then after the find all, yet not without the .then. ISSUE 
        //         var ingredients = index.RecipeIngredient.findAll({ where: { RecipeID: result.dataValues.RecipeID }}).map(el => el.get({ plain: true }));
        //         var instructions = index.RecipeInstruction.findAll({ where: { RecipeID: result.dataValues.RecipeID }}).map(el => el.get({ plain: true }));
        //         console.log(ingredients);
        //         // console.log(instructions);
        //         res.status(200).send({
        //             recipe: {
        //                 RecipeID: result.null,
        //                 Name: result.dataValues.name,
        //                 Image: result.dataValues.image,
        //                 Source: result.dataValues.source,
        //                 Url: result.dataValues.url,
        //                 Yield: result.dataValues.yield,
        //                 Calories: result.dataValues.calories,
        //                 Ingredients: ingredients,
        //                 Instructions: instructions
        //             }
        //         });
        //         res.end();             
        //     }
        // })
        // .catch(err =>
        //     res.status(500).send({
        //         message: 'Recipe information could not be loaded',
        //         error: err.toString()
        //      })
        //     );
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
 * { "name": "testRecipe",
 	"image": "testImage",
 	"source": "testSource",
 	"url": "testUrl",
 	"yield": 1,
 	"calories": 500,
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
			"instruction": "take this 3"
		},
		{
			"step": 4,
			"instruction": "take this 4"
		}
	]
}
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

        var name = req.body.name;
        var image;
        var source;
        var url;
        var yield;
        var calories;
        //var description;

        var ingredients = [];
        var instructions = [];
        // Declare variables END 

        // Validation START
        // TODO: Compile validation error messages into an array and send them all back when validation errors happen.
        // TODO: Also investigate if throwing all those error messages is standard practice.
        // Check if name is the right length
        if(name.length > 100) {
            validationErrors = true;
            errorMessage = 'Recipe name cannot be more than 100 characters long';
        }
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
                // console.log(instructions);
                // console.log(ingredients);
            }
        }
        // Validation END

        // Creation START
        if(!validationErrors) {
            sequelize.transaction().then(function (t) {
                return index.Recipe.create({
                            Name: name,
                            Image: image,
                            Source: source,
                            Url: url,
                            Yield: yield,
                            Calories: calories
                        }, //{freezeTableName: true},
                            {transaction: t})
                    .then(function(newRecipe) {
                        var recId = newRecipe.null;
                        return Promise.map(ingredients, function(ingredient) {
                            return index.RecipeIngredient.create({
                                        RecipeID: recId,
                                        IngredientID: ingredient.ingredientId,
                                        MeasureID: ingredient.measureId,
                                        Amount: ingredient.amount
                                    }, {transaction: t})
                        })
                        .then(function() {
                            return Promise.map(instructions, function(instruction) {
                                return index.RecipeInstruction.create({
                                            RecipeID: recId,
                                            Step: instruction.step,
                                            Instruction: instruction.instruction
                                        }, {transaction: t})
                            })
                        })
                    })
                    .then(function() {
                        //console.log('FOR TESTING >> committed');
                        t.commit();
                        res.status(201).send({
                            message: 'A recipe record for ' + name +' has been created.'
                        })
                    })
                    .catch(function (err) {
                            t.rollback();
                            res.status(422).send({
                                message: 'Transaction failed, this is a custom message'
                            })
                    })
            })
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
                                                  '&app_id=' + APP_ID + 
                                                  '&app_key=' + APP_KEY
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