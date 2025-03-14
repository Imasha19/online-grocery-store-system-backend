const express = require('express');
const { createIncCtrl, fetchAllIncCtrl, fetchIncDetailsCtrl } = require('../../controllers/income/incomeCtrl.js');


const incomeRoute = express.Router();

incomeRoute.post('/',createIncCtrl);
incomeRoute.get('/',fetchAllIncCtrl);
incomeRoute.get('/:id',fetchIncDetailsCtrl);

module.exports =incomeRoute;