const express = require('express');
const dbConnect = require('./config/dbConfig'); 
const { registerUser } = require('./controllers/users/usersCtrl.js');
const userRoute = require('./routes/userRoutes.js');
const { errprHandler, notFound } = require('./middlewares/errorMiddleware.js');


const app = express();



// Connect to MongoDB
dbConnect(); 

//middlewares
app.use(express.json());

//routes
app.use("/",userRoute);

//Error
app.use(notFound);
app.use(errprHandler);


//income
//expenses
module.exports = app;

