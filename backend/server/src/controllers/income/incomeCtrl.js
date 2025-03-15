const expressAsyncHandler = require('express-async-handler');
const Income = require("../../model/income");

//create

const createIncCtrl = expressAsyncHandler(async (req, res) => {
    const { title, description, amount,user } = req?.body;
    try {
        const income = await Income.create({ title, description, amount, user});
        res.status(200).json(income);
    } catch (error) {
        res.json(error);
    }
});


// Fetch all income
const fetchAllIncCtrl = expressAsyncHandler(async (req, res) => {
    try {
        const income = await Income.find({});
        res.status(200).json(income);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Fetch single income
const fetchIncDetailsCtrl = expressAsyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
        const income = await Income.findById(id);
        if (!income) {
            res.status(404).json({ message: 'Income not found' });
        } else {
            res.status(200).json(income);
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

//update
const updateIncCtrl = expressAsyncHandler(async (req, res) => {
    const { id } = req.params
    const { title, description, amount} = req.body;
 
 
   try { 
    const income = await Income.findByIdAndUpdate(
         id,{ title, description, amount},
    { new: true }
    );
    res.json(income);
} catch (error) {
    res.status(500).json({ message: error.message });
}
});

//delete
const deleteInCtrl = expressAsyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
        const income = await Income.findByIdAndDelete(id);
        if (!income) {
            res.status(404).json({ message: 'Income not found' });
        } else {
            res.status(200).json(income);
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
module.exports ={ fetchAllIncCtrl, createIncCtrl, fetchIncDetailsCtrl ,updateIncCtrl,deleteInCtrl};