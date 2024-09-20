const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const noCache = require('nocache');
const morgan = require('morgan')
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3009;

const dbUrl = process.env.MONGODB_URI

mongoose.connect(dbUrl);

mongoose.connection.on('connected', () => {
  console.log('Connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

app.use('/public', express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');


app.use(noCache());
app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));

const userRoute = require('./routes/userroute');
app.use('/', userRoute);

const adminRoute = require('./routes/adminroute');
app.use('/admin', adminRoute);


app.use((req, res) => {
  res.status(404).render('404');
});
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
