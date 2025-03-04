
const mongoose = require('mongoose');

const dbConnect =async ()=>{
   try{
    await mongoose.connect("mongodb+srv://Imasha:Q55HNQlnMjoNLYEy@financecluster.8glqd.mongodb.net/?retryWrites=true&w=majority&appName=financeCluster")
  
    console.log(`Connected to MongoDB Successfully!`);
   }catch(error){
       console.error(`Error ${error.message}`);
   }
} ; 

module.exports = dbConnect;  
