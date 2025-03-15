const express = require('express');
const { createIncCtrl, fetchAllIncCtrl, fetchIncDetailsCtrl, updateIncCtrl, deleteInCtrl } = require('../../controllers/income/incomeCtrl.js');


const incomeRoute = express.Router();

incomeRoute.post('/',createIncCtrl);
incomeRoute.get('/',fetchAllIncCtrl);
incomeRoute.get('/:id',fetchIncDetailsCtrl);
incomeRoute.put('/:id',updateIncCtrl);
incomeRoute.delete('/:id',deleteInCtrl);

module.exports =incomeRoute;