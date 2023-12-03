const express = require('express');
const path = require('path');
const app = express();
const port = 3009;
const mongoose = require('mongoose');
const dbUrl = 'mongodb://127.0.0.1:27017/furni';
const noCache = require('nocache')

mongoose.connect(dbUrl);

// Listen for the 'connected' event when MongoDB connection is established
mongoose.connection.on('connected', () => {
  console.log('Connected to MongoDB');
});

// Listen for the 'error' event in case of MongoDB connection errors
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});



app.use('/public', express.static(path.join(__dirname, 'public')));

app.set('view engine', 'ejs');
app.use(noCache())

// User_Routes
const userRoute = require("./routes/userroute");
app.use('/',userRoute);
 
// Admin_Routes
const adminRoute = require("./routes/adminroute");
app.use('/admin',adminRoute);




  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });