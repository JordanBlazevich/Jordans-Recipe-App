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
const { Recipe } = require('../models/index');
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
                index.Recipe.findByPk(id, {attributes: ['RecipeID', 'Name', 'Image', 'Source', 'Url', 'Yield', 'Calories']})
                .then(result => {
                    if(result != null) {
                        resolved(result); 
                    } else {
                        rejected('That recipe does not exist.');
                    }
                })
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
            res.status(404).send({
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
    // Declare variables START
    var errorMessages = [];

    var name;
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
    // TODO: Investigate if throwing all those error messages is standard practice.
    // Check if name is the right length
    if(!req.body.name) {
        errorMessages.push('Recipe name is required');
    } else {
        name = req.body.name;
        if(name.length > 100) {
            //validationErrors = true;
            errorMessages.push('Recipe name cannot be more than 100 characters long');
        }
    }
    
    // Check if image is in request
    if(!req.body.image) {
        image = null;
    }
    else {
        image = req.body.image;
        // Ensure length is not too long for Db
        if(image.length > 2000) {
            errorMessages.push('Image URL cannot be more than 2000 characters long');
        }
    }
    
    // Check if source is in request
    if(!req.body.source) {
        source = null;
    }
    else {
        source = req.body.source;
    // Ensure length is not too long for Db
        if(source.length > 2000) {
            errorMessages.push('Source URL cannot be more than 2000 characters long');
        }
    }

    // Check if Url is in request
    if(!req.body.url) {
        url = null;
    }
    else {
        url = req.body.url;
    // Ensure length is not too long for Db
        if(url.length > 2000) {
            errorMessages.push('URL cannot be more than 2000 characters long');
        }
    }

    // Check if yield is in request
    if(!req.body.yield) {
        yield = null;
    }
    else {
        yield = req.body.yield;
    // Check if a number
        if(isNaN(yield)) {
            errorMessages.push('Yield must be a number');
        }
    }

    // Check if calories is in request
    if(!req.body.calories) {
        calories = null;
    }
    else {
        calories = req.body.calories;
    // Check if a number
        if(isNaN(calories)) {
            errorMessages.push('Calories must be a number');
        }
    }

    // Check if ingredients are in request
    if(!req.body.ingredients) {

        errorMessages.push('Each recipe needs at least 1 ingredient.');
    }
    else {
        // TODO: figure out how to validate that the right properties are included
        ingredients = req.body.ingredients;
    }

    // Check if instructions are in request
    if(!req.body.instructions) {
        errorMessages.push('A recipe needs at least 1 instruction.');
    }
    else {
        // TODO: figure out how to validate that the right properties are included
        instructions = req.body.instructions;
    }
    // Validation END

    // Creation START
    if(errorMessages.length === 0) {
        sequelize.transaction().then(function (t) {
            return index.Recipe.create({
                        Name: name,
                        Image: image,
                        Source: source,
                        Url: url,
                        Yield: yield,
                        Calories: calories
                    }, {transaction: t})
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
                .then(function(newIngredient) {
                    //console.log(newIngredient[0].dataValues.RecipeID);
                    t.commit();
                    res.status(201).send({
                        message: 'A recipe record for ' + name +' has been created.',
                        recipeId: newIngredient[0].dataValues.RecipeID
                    })
                })
                .catch(function (err) {
                        console.log(err);
                        t.rollback();
                        res.status(422).send({
                            message: 'Transaction failed, this is a custom message'
                        })
                })
        })
    } else {
        res.status(422).send({
            message: errorMessages
        });
    }
        // Creation END
});

/**
 * This function updates an existing recipe record in the database using its primary key.
 * 
 */
// TODO: Fix this update code to actually work
router.put(('/update/:id'), (req, res) => {
    // Declare variables START
    var errorMessages = [];

    var name;
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
    // TODO: Investigate if throwing all those error messages is standard practice.
    // Check to make sure there is something in the body
    if(!req.body) {
        res.status(422).send({
            message: 'You must send something to update this record'
        })
    }
    
    // Check if name is the right length
    if(!req.body.name) {
        errorMessages.push('Recipe name is required');
    } else {
        name = req.body.name;
        if(name.length > 100) {
            //validationErrors = true;
            errorMessages.push('Recipe name cannot be more than 100 characters long');
        }
    }
    
    // Check if image is in request
    if(!req.body.image) {
        image = recipe.Image;
    }
    else {
        image = req.body.image;
        // Ensure length is not too long for Db
        if(image.length > 2000) {
            errorMessages.push('Image URL cannot be more than 2000 characters long');
        }
    }
    
    // Check if source is in request
    if(!req.body.source) {
        source = recipe.Source;
    }
    else {
        source = req.body.source;
    // Ensure length is not too long for Db
        if(source.length > 2000) {
            errorMessages.push('Source URL cannot be more than 2000 characters long');
        }
    }

    // Check if Url is in request
    if(!req.body.url) {
        url = recipe.Url;
    }
    else {
        url = req.body.url;
    // Ensure length is not too long for Db
        if(url.length > 2000) {
            errorMessages.push('URL cannot be more than 2000 characters long');
        }
    }

    // Check if yield is in request
    if(!req.body.yield) {
        yield = recipe.Yield;
    }
    else {
        yield = req.body.yield;
    // Check if a number
        if(isNaN(yield)) {
            errorMessages.push('Yield must be a number');
        }
    }

    // Check if calories is in request
    if(!req.body.calories) {
        calories = recipe.Calories;
    }
    else {
        calories = req.body.calories;
    // Check if a number
        if(isNaN(calories)) {
            errorMessages.push('Calories must be a number');
        }
    }

    // Check if ingredients are in request
    if(!req.body.ingredients) {
        errorMessages.push('Each recipe needs at least 1 ingredient.');
    }
    else {
        // TODO: figure out how to validate that the right properties are included
        ingredients = req.body.ingredients;
    }

    // Check if instructions are in request
    if(!req.body.instructions) {
        errorMessages.push('A recipe needs at least 1 instruction.');
    }
    else {
        // TODO: figure out how to validate that the right properties are included, do we need to if i handle what is being passed, and it is transaction based...
        instructions = req.body.instructions;
    }
    // Validation END

    // Update START
    // TODO: unhandled rejection error, you need to learn more about promises syntax. I think all of these need to be done inside the same promise, in which it rejects or something. Works fine with updating, doesnt work with rejecting.
    if(errorMessages.length === 0) {
        // function confirmRecipeExists(id) {
        //     return new Promise(function(resolved, rejected) {
        //         index.Recipe.findByPk(id, {attributes: ['RecipeID', 'Name', 'Image', 'Source', 'Url', 'Yield', 'Calories']})
        //         .then(result => {
        //             if(result != null) {
        //                 resolved(result); 
        //             } else {
        //                 rejected('That recipe does not exist.');
        //             }
        //         })
        //     });
        // }

        // TODO: THIS WORKS FOR UPDATING a single record, investigate how to apply this to updating multiple associated records.
        function updateRecipeDetails(id, t) {
            return new Promise(function(resolved, rejected) {
                index.Recipe.findByPk(id, {transaction: t})
                .then(result => {
                    if(result) {
                        //console.log(result);
                        updated = result.update({
                                Name: name,
                                Image: image,
                                Source: source,
                                Url: url,
                                Yield: yield,
                                Calories: calories
                            }, {transaction: t})
                            //.then(result => {
                                resolved(updated); 
                                } else {
                                    rejected('That recipe does not exist.');
                                }
                            //})
                });
            })
                
        }

        // TODO: THIS CODE DOESNT WORK, it just updates the same record over and over, investigate how to do this properly.
        // if i send the entire object including its ingredients each time from the front end, i can just delete all existing and recreate them, investigate this
        function updateRecipeIngredients(id, t) {
            return new Promise(function(resolved, rejected) {
                result = Promise.map(ingredients, function(ingredient) {
                            return index.RecipeIngredient.update({
                                        IngredientID: ingredient.ingredientId,
                                        MeasureID: ingredient.measureId,
                                        Amount: ingredient.amount
                                    },  {where: {RecipeID: id}},
                                        {transaction: t})
                        })
                if(result) {
                   resolved(result); 
                } else {
                    rejected('No recipe ingredients exist for that recipe.');
                }
            });
        }
        // TODO: THIS CODE DOESNT WORK, it just updates the same record over and over, investigate how to do this properly.
        // if i send the entire object including its ingredients each time from the front end, i can just delete all existing and recreate them, investigate this
        function updateRecipeInstructions(id, t) {
            return new Promise(function(resolved, rejected) {
                result = Promise.map(instructions, function(instruction) {
                            return index.RecipeInstruction.update({
                                        Step: instruction.step,
                                        Instruction: instruction.instruction
                                    },  {where: {RecipeID: id}},
                                        {transaction: t})
                        })
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
            res.status(404).send({
                message: message
            });
           // console.log(message);
        }

        (async function() {
            sequelize.transaction(async (t) => {
            try {
                    let responses = [];
                       //let exists = await confirmRecipeExists(req.params.id);
                //    if (exists != false) {
                        responses.push(await updateRecipeDetails(req.params.id, t));
                        responses.push(await updateRecipeIngredients(req.params.id, t));
                        responses.push(await updateRecipeInstructions(req.params.id, t));

                        let recipe = {
                            recipe: responses[0],
                            ingredients: responses[1],
                            instructions: responses[2]
                        };
    
                        return successHandler(recipe);      
                    // } else {
                    //     failHandler('That recipe does not exist.')
                    // }
                    // let recipe = responses.map(function(response) {
                    //     return successHandler(response)
                    // });
                //commit/success here
            } catch(e) {
                failHandler(e);
                //rollback/fail here
            }
        });
        })();

        // function confirmRecipeExists(id) {
        //     return new Promise(function(resolved, rejected) {
        //         index.Recipe.findByPk(id, {attributes: ['RecipeID', 'Name', 'Image', 'Source', 'Url', 'Yield', 'Calories']})
        //         .then(result => {
        //             if(result != null) {
        //                 resolved(result); 
        //             } else {
        //                 rejected(failHandler('that recipe doesnt exist'));
        //             }
        //         })
        //     });
        // }

        
        // function updateRecipeDetails(id, t) {
        //     return new Promise(function(resolved, rejected) {
        //         result = index.Recipe.update({
        //                     Name: name,
        //                     Image: image,
        //                     Source: source,
        //                     Url: url,
        //                     Yield: yield,
        //                     Calories: calories
        //                 },  {where: {RecipeID: id}},
        //                     {transaction: t})
        //         if(result.dataValues) {
        //             console.log(result);
        //             resolved(result); 
        //         } else {
        //             rejected(failHandler('That recipe does not exist.'));
        //         }
        //     });
        // }

        // function updateRecipeIngredients(id, t) {
        //     return new Promise(function(resolved, rejected) {
        //         result = Promise.map(ingredients, function(ingredient) {
        //                     return index.RecipeIngredient.update({
        //                                 IngredientID: ingredient.ingredientId,
        //                                 MeasureID: ingredient.measureId,
        //                                 Amount: ingredient.amount
        //                             },  {where: {RecipeID: id}},
        //                                 {transaction: t})
        //                 })
        //         if(result) {
        //            resolved(result); 
        //         } else {
        //             rejected(failHandler('No recipe ingredients exist for that recipe.'));
        //         }
        //     });
        // }
        // function updateRecipeInstructions(id, t) {
        //     return new Promise(function(resolved, rejected) {
        //         result = Promise.map(instructions, function(instruction) {
        //                     return index.RecipeInstruction.update({
        //                                 Step: instruction.step,
        //                                 Instruction: instruction.instruction
        //                             },  {where: {RecipeID: id}},
        //                                 {transaction: t})
        //                 })
        //         if(result) {
        //            resolved(result); 
        //         } else {
        //             rejected(failHandler('No recipe instructions exist for that recipe.'));
        //         }
        //     });
        // }

        // function successHandler(recipe) {
        //     res.status(200).send(recipe);
        // }

        // function failHandler(message) {
        //     res.status(400).send({
        //         message: message
        //     });
        //    // console.log(message);
        // }

        // (async function() {
        //     try {
        //         sequelize.transaction(async (t) => {
        //             let responses = [];
        //                 let exists = await confirmRecipeExists(req.params.id);
        //         //    if (exists != false) {
        //                 responses.push(await updateRecipeDetails(req.params.id, t));
        //                 responses.push(await updateRecipeIngredients(req.params.id, t));
        //                 responses.push(await updateRecipeInstructions(req.params.id, t));

        //                 let recipe = {
        //                     recipe: responses[0],
        //                     ingredients: responses[1],
        //                     instructions: responses[2]
        //                 };
    
        //                 return successHandler(recipe);      
        //             // } else {
        //             //     failHandler('That recipe does not exist.')
        //             // }
        //             // let recipe = responses.map(function(response) {
        //             //     return successHandler(response)
        //             // });
        //         });
        //         //commit/success here
        //     } catch(e) {
        //         failHandler(e);
        //         //rollback/fail here
        //     }
        // })();
        // sequelize.transaction().then(function (t) {
        //     // Check if that record exists to be updated
        //     index.Recipe.findByPk(req.params.id)
        //     .then(function(newRecipe) {
        //         console.log(newRecipe);
        //         if (newRecipe === null) {
        //             res.status(404).send({
        //                 message: 'That recipe does not exist in the'
        //             })
        //         }
        //     });

        //     return index.Recipe.update({
        //                 Name: name,
        //                 Image: image,
        //                 Source: source,
        //                 Url: url,
        //                 Yield: yield,
        //                 Calories: calories
        //             },  {where: {RecipeID: req.params.id}},
        //                 {transaction: t})
        //         .then(function(newRecipe) {
        //             //var recId = newRecipe.null;
        //             return Promise.map(ingredients, function(ingredient) {
        //                 return index.RecipeIngredient.update({
        //                             IngredientID: ingredient.ingredientId,
        //                             MeasureID: ingredient.measureId,
        //                             Amount: ingredient.amount
        //                         },  {where: {RecipeID: req.params.id}},
        //                             {transaction: t})
        //             })
        //             .then(function() {
        //                 return Promise.map(instructions, function(instruction) {
        //                     return index.RecipeInstruction.update({
        //                                 Step: instruction.step,
        //                                 Instruction: instruction.instruction
        //                             },  {where: {RecipeID: req.params.id}},
        //                                 {transaction: t})
        //                 })
        //             })
        //         })
        //         .then(function() {
        //             t.commit();
        //             res.status(200).send({
        //                 message: 'The recipe record for ' + name +' has been updated.'
        //             })
        //         })
        //         .catch(function (err) {
        //             t.rollback();
        //             res.status(422).send({
        //                 message: 'Transaction failed, this is a custom message'
        //             })
        //         })
        // })
    } else {
        res.status(422).send({
            message: errorMessages
        });
    }
        // Update END
});

/**
 * This function deletes an existing recipe record in the database using its primary key.
 * 
 */
// TODO: Fix this delete code to actually work
router.delete(('/delete/:id'), (req, res) => {
    if(req.params.id) {
        try {
            result = sequelize.transaction(async (t) => {
                return index.RecipeIngredient.destroy({where: {RecipeID: req.params.id}}, {transaction: t})
                .then(function() {
                    // return Promise.map(ingredients, function(ingredient) {
                        return index.RecipeInstruction.destroy({where: {RecipeID: req.params.id}}, {transaction: t})
                    // })
                    .then(function() {
                        // return Promise.map(instructions, function(instruction) {
                            return index.Recipe.destroy({where: {RecipeID: req.params.id}}, {transaction: t})
                        // })
                    })
                })
            });
            res.status(200).send({
                message: 'The recipe record has been deleted.'
            });
        } catch (err) {
            res.status(422).send({
                message: 'Transaction failed, this is a custom message'
            });
        }
    } else {
        res.status(422).send({
            message: 'An ID must be passed to delete a recipe.'
        });
    }
    //     sequelize.transaction().then(function (t) {
    //         return index.RecipeIngredient.destroy({where: {RecipeID: req.params.id}}, {transaction: t})
    //             .then(function() {
    //                 // return Promise.map(ingredients, function(ingredient) {
    //                     return index.RecipeInstruction.destroy({where: {RecipeID: req.params.id}}, {transaction: t})
    //                 // })
    //                 .then(function() {
    //                     // return Promise.map(instructions, function(instruction) {
    //                         return index.Recipe.destroy({where: {RecipeID: req.params.id}}, {transaction: t})
    //                     // })
    //                 })
    //             })
    //             .then(function() {
    //                 t.commit();
    //                 res.status(200).send({
    //                     message: 'The recipe record has been deleted.'
    //                 })
    //             })
    //             .catch(function (err) {
    //                 console.log(err);
    //                 t.rollback();
    //                 res.status(422).send({
    //                     message: 'Transaction failed, this is a custom message'
    //                 })
    //             })
    //     })
    // } else {
    //     res.status(422).send({
    //         message: 'An ID must be passed to delete a recipe.'
    //     });
    // }

    // if(req.params.id) {
    //     sequelize.transaction().then(function (t) {
    //         return index.RecipeIngredient.destroy({where: {RecipeID: req.params.id}}, {transaction: t})
    //             .then(function() {
    //                 // return Promise.map(ingredients, function(ingredient) {
    //                     return index.RecipeInstruction.destroy({where: {RecipeID: req.params.id}}, {transaction: t})
    //                 // })
    //                 .then(function() {
    //                     // return Promise.map(instructions, function(instruction) {
    //                         return index.Recipe.destroy({where: {RecipeID: req.params.id}}, {transaction: t})
    //                     // })
    //                 })
    //             })
    //             .then(function() {
    //                 t.commit();
    //                 res.status(200).send({
    //                     message: 'The recipe record has been deleted.'
    //                 })
    //             })
    //             .catch(function (err) {
    //                 console.log(err);
    //                 t.rollback();
    //                 res.status(422).send({
    //                     message: 'Transaction failed, this is a custom message'
    //                 })
    //             })
    //     })
    // } else {
    //     res.status(422).send({
    //         message: 'An ID must be passed to delete a recipe.'
    //     });
    // }
    
    // if(req.params.id) {
    //     sequelize.transaction().then(function (t) {

    //         function deleteRecipeDetails(id) {
    //             return new Promise(function(resolved, rejected) {
    //                 result = index.Recipe.destroy({ where: { RecipeID: id }}, { transaction: t })
    //                 if(result != 0) {
    //                     console.log(result);
    //                     resolved(result + ' recipe for recipe # ' + id + ' has been deleted'); 
    //                 } else {
    //                     rejected('That recipe does not exist.');
    //                 }
    //             });
    //         }

    //         function deleteRecipeIngredients(id) {
    //             return new Promise(function(resolved, rejected) {
    //                 result = index.RecipeIngredient.destroy({ where: { RecipeID: id }}, { transaction: t })
    //                 if(result != 0) {
    //                     console.log(result);
    //                     resolved(result + ' ingredients for recipe # ' + id + ' have been deleted'); 
    //                 } else {
    //                     rejected('No recipe ingredients exist for that recipe.');
    //                 }
    //             });
    //         }
    //         function deleteRecipeInstructions(id) {
    //             return new Promise(function(resolved, rejected) {
    //                 result = index.RecipeInstruction.destroy({ where: { RecipeID: id }}, { transaction: t })
    //                 if(result != 0) {
    //                     console.log(result);
    //                     resolved(result + ' ingredients for recipe # ' + id + ' have been deleted'); 
    //                 } else {
    //                     rejected('No recipe instructions exist for that recipe.');
    //                 }
    //             });
    //         }

    //         function successHandler(response) {
    //             t.commit();
    //             res.status(200).send(response);
    //         }

    //         function failHandler(message) {
    //             console.log(message);
    //             t.rollback();
    //             res.status(400).send({
    //                 message: message
    //             });
    //         // console.log(message);
    //         }

    //         (async function() {
    //             try {
    //                 let responses = [];
                    
    //                 responses.push(await deleteRecipeIngredients(req.params.id));
    //                 responses.push(await deleteRecipeInstructions(req.params.id));
    //                 responses.push(await deleteRecipeDetails(req.params.id));

    //                 // let recipe = responses.map(function(response) {
    //                 //     return successHandler(response)
    //                 // });

    //                 let response = {
    //                     ingredients: responses[0],
    //                     instructions: responses[1],
    //                     recipe: responses[2]
    //                 };

    //                 return successHandler(response);                
    //             } catch(e) {
    //                 failHandler(e);
    //             }
    //         })();
    //     })
    //  }
});

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