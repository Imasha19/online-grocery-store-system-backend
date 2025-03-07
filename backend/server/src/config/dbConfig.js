
const mongoose = require('mongoose');

const dbConnect =async ()=>{
   try{
    await mongoose.connect("mongodb+srv://imashasandanayaka:k2JFFJXaHwvs9Ew5@grocerystore.u8z94.mongodb.net/?retryWrites=true&w=majority&appName=groceryStore")
  
    console.log(`Connected to MongoDB Successfully!`);
   }catch(error){
       console.error(`Error ${error.message}`);
   }
} ; 

module.exports = dbConnect;  