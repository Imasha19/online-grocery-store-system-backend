const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

//schema
const incomeSchema = mongoose.Schema({
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
        default:"Income",
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

const Income = mongoose.model('Income', incomeSchema);

module.exports = Income;