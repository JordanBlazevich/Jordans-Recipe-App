const db = require('../config/database');
const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const index = require('../models/index');
const axios = require('axios');

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
    //     ).then(recipe => {
    //         res.status(200).send(recipe);
    //         res.end();
    //     })
    //     .catch(e =>
    //         res.status(500).send({
    //             message: 'Recipe information could not be loaded',
    //             error: e.message
    //          })
    //     )
    // }
    // else
    // {
    //     return res.status(422).send({
    //         message: 'A Recipe ID was not provided.'
    //      });
     }
});

router.get(('/edamam/:queryText'), (req, res) =>    
    axios.get({
        uri: 'https://api.edamam.com/search',
        q: req.params.queryText,
        app_id: '88ec001b',
        app_key: '17d4790e2012282b8e8e49eb649838dd'
    })
    .then(recipe =>{
        res.status(200).send(recipe);
    })
    .catch(err => 
        res.status(500).send({
            message: 'Error loading recipies from database'
        })
    )
);



module.exports = router;