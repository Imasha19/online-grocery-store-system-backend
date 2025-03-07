const express = require('express');
const dbConnect = require('./config/dbConfig'); 

const app = express();

// Connect to MongoDB
dbConnect(); 

module.exports = app;

//Q55HNQlnMjoNLYEy Imasha

//mongodb+srv://Imasha:<db_password>@financecluster.8glqd.mongodb.net/?retryWrites=true&w=majority&appName=financeCluster