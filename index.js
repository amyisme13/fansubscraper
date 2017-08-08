require('dotenv').config();

const axios = require('axios');
const bodyParser = require('body-parser');
const cors = require('cors');
const express = require('express');
const mongoose = require('mongoose');

const app = express();
const _port = process.env.PORT;

const awsubs = require('./routes/awsubs');

const configDB = require('./config/database');
const Series = require('./schemas/series');

// Connect to Database
mongoose.connect(configDB.mongodb);

// On Database Connection
mongoose.connection.on('connected', () => {
  console.log('Database connected');
});

// On Database Error
mongoose.connection.on('error', (err) => {
  console.log('Database error: ' + err);
});

// Cors Middleware
app.use(cors());

// Parse application/x-www-form-urlencoded 
app.use(bodyParser.urlencoded({extended: false }))
 
// Parse application/json 
app.use(bodyParser.json())

app.get('/', (req, res) => {
    res.send('asd');
})

app.use('/awsubs', awsubs);

app.listen(_port, () => {
    console.log('App listening on port ' + _port)
});