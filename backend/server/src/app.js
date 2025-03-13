const express = require('express');
const dotenv = require('dotenv');
const dbConnect = require('./config/dbConfig'); 
const { registerUser } = require('./controllers/users/usersCtrl.js');
const userRoute = require('./routes/userRoutes.js');
const { errprHandler, notFound } = require('./middlewares/errorMiddleware.js');


const app = express();
//env
dotenv.config();


// Connect to MongoDB
dbConnect(); 

//middlewares
app.use(express.json());

app.get('/', (req, res) => {
    res.json({msg: 'Welcome to the Expenses Tracker API'});
})

//routes
app.use("/api/users",userRoute);

//Error
app.use(notFound);
app.use(errprHandler);


//income
//expenses
module.exports = app;

