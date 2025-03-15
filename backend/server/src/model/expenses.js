const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

//schema
const expenseSchema = mongoose.Schema({
    title:{
        required:[true,"Title is required"],
        type:String,
    },
    description:{
        required:[true,"Description is required"],
        type:String,
    },
    type:{
        type:String,
        default:"Expense",
    },
    amount:{
        required:[true,"Amount is required"],
        type:Number,
    },
   user:{
         type:mongoose.Schema.Types.ObjectId,
         ref:"User",
         required:[true,"User ID is required"],
   },
   
  },
  {
    timestamps: true,
    
  }
);

const Expense = mongoose.model('Expense', expenseSchema);

module.exports = Expense;