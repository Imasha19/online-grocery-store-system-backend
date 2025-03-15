const express = require('express');
const {
    createExpCtrl,
    fetchAllExpCtrl,
    fetchIExpDetailsCtrl,
    updateExpCtrl,
    deleteExpCtrl
} = require('../../controllers/income/expenseCtrl.js');

const expenseRoute = express.Router();

expenseRoute.post('/', createExpCtrl);
expenseRoute.get('/', fetchAllExpCtrl);
expenseRoute.get('/:id', fetchIExpDetailsCtrl);
expenseRoute.put('/:id', updateExpCtrl);
expenseRoute.delete('/:id', deleteExpCtrl);

module.exports = expenseRoute;