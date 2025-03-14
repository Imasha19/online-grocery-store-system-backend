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

module.exports ={ createIncCtrl};