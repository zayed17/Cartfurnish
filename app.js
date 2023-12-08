// Import required modules
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const noCache = require('nocache');

// Set up Express application
const app = express();
const port = 3009;

// MongoDB connection configuration
const dbUrl = 'mongodb://127.0.0.1:27017/furni';

// Connect to MongoDB
mongoose.connect(dbUrl);

// Listen for the 'connected' event when MongoDB connection is established
mongoose.connection.on('connected', () => {
  console.log('Connected to MongoDB');
});

// Listen for the 'error' event in case of MongoDB connection errors
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

// Set up static files and view engine
app.use('/public', express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

// Apply noCache middleware for disabling caching
app.use(noCache());

// User Routes
const userRoute = require('./routes/userroute');
app.use('/', userRoute);

// Admin Routes
const adminRoute = require('./routes/adminroute');
app.use('/admin', adminRoute);

// Start the Express server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
