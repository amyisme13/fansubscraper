require('dotenv').config();

const bodyParser = require('body-parser');
const cors = require('cors');
const express = require('express');
const mongoose = require('mongoose');

const app = express();
const port = process.env.PORT;

const awsubs = require('./routes/awsubs');
const nekonime = require('./routes/nekonime');

const configDB = require('./config/database');

// Connect to Database
mongoose.connect(configDB.mongodb);

// On Database Connection
mongoose.connection.on('connected', () => {
    console.log('Database connected');
});

// On Database Error
mongoose.connection.on('error', (err) => {
    console.log(`Database error: ${err}`);
});

// Cors Middleware
app.use(cors());

// Parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// Parse application/json
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.send('asd');
});

app.use('/awsubs', awsubs);
app.use('/nekonime', nekonime);

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});
