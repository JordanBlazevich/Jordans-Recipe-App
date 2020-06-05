const db = require('../config/database');
const express = require('express');
const router = express()
const bodyParser = require('body-parser');
const index = require('../models/index');

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
        index.Recipe.findByPk(req.params.id, {attributes: ['RecipeID', 'Name', 'Description', 'Instructions'],
        include:[{model: index.RecipeIngredient, attributes: ['RecipeIngredientID', 'RecipeID', 'IngredientID', 'MeasureID', 'Amount']}],
        // include:[{model: index.Ingredient, attributes: ['IngredientID', 'Name']}],
        // include:[{model: index.Measure, attributes: ['MeasureID', 'Name']}],
        //where: {RecipeID: req.params.id}
        }
        ).then(recipe => {
            res.status(200).send(recipe);
            res.end();
        })
        .catch(e =>
            res.status(500).send({
                message: 'Recipe information could not be loaded',
                error: e.message
             })
        )
    }
    else
    {
        return res.status(422).send({
            message: 'A Recipe ID was not provided.'
         });
    }
});

module.exports = router;