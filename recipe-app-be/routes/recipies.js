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
    index.Recipe.findAll({attributes: ['RecipeID', 'Name', 'Description']})
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
        try {
        var recipe = index.Recipe.findByPk(req.params.id, {attributes: ['RecipeID', 'Name', 'Description', 'Instructions']});
        var ingredients = index.RecipeIngredient.findAll({ where: RecipeID = req.params.id});
        res.status(200).send({
            RecipeID: recipe.RecipeID,
            RecipeName: recipe.Name,
            Description: recipe.Description,
            Instructions: recipe.Instructions,
            Ingredients: ingredients
        });
        } catch (e) {
            res.status(500).send({
                            message: 'Recipe information could not be loaded',
                            error: e.message
                         });
        }
     }
});

router.post(('/create'), (req, res) => {
    if(!req.body.name) {
        return res.status(422).send({
            message: 'Recipe name is required.'
         });
    } 
    else {
        var validationErrors = false;

        var name;
        var image;
        var source;
        var url;
        var yield;
        var calories;
        var description;

        var ingredients;
        var instructions;

        if(!req.body.image) {
            image = null;
        }
        else {
            image = req.body.image;
            if(image.length > 2000) {
                validationErrors = true;
                errorMessage = 'Image URL cannot be more than 2000 characters long';
            }
        }

        if(!req.body.source) {
            source = null;
        }
        else {
            source = req.body.source;
            if(source.length > 2000) {
                validationErrors = true;
                errorMessage = 'Source URL cannot be more than 2000 characters long';
            }
        }

        if(!req.body.url) {
            url = null;
        }
        else {
            url = req.body.url;
            if(url.length > 2000) {
                validationErrors = true;
                errorMessage = 'URL cannot be more than 2000 characters long';
            }
        }

        if(!req.body.yield) {
            yield = null;
        }
        else {
            yield = req.body.yield;
            if(isNaN(yield)) {
                validationErrors = true;
                errorMessage = 'Yield must be a number';
            }
        }

        if(!req.body.calories) {
            calories = null;
        }
        else {
            calories = req.body.calories;
            if(isNaN(calories)) {
                validationErrors = true;
                errorMessage = 'Calories must be a number';
            }
        }

        if(!req.body.description) {
            description = null;
        }
        else {
            description = req.body.description;
            if(description.length > 50) {
                validationErrors = true;
                errorMessage = 'Description cannot be more than 50 characters long';
            }
        }

        // TODO: PARSE INGREDIENTS AND INSTRUCTIONS LISTS, DO CREATE CODE
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