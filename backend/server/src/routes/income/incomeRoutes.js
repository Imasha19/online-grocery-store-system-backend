const express = require('express');
const { createIncCtrl, fetchAllIncCtrl, fetchIncDetailsCtrl, updateIncCtrl, deleteInCtrl } = require('../../controllers/income/incomeCtrl.js');
const authMiddleware = require('../../middlewares/authMiddleware.js');


const incomeRoute = express.Router();

incomeRoute.post('/',authMiddleware,createIncCtrl);
incomeRoute.get('/',authMiddleware,fetchAllIncCtrl);
incomeRoute.get('/:id',authMiddleware,fetchIncDetailsCtrl);
incomeRoute.put('/:id',authMiddleware,updateIncCtrl);
incomeRoute.delete('/:id',authMiddleware,deleteInCtrl);

module.exports =incomeRoute;