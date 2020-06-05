const Sequelize = require('sequelize');
const db = require('../config/database');


const Measure = db.define('measure', {
    MeasureID: {
        type: Sequelize.INTEGER,
        primaryKey: true
    },
    Name: {
        type: Sequelize.STRING
    }
}, { freezeTableName: true, timestamps: false })

module.exports = Measure;