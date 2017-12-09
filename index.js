require('dotenv').config();

const bodyParser = require('body-parser');
const cors = require('cors');
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
const port = process.env.PORT;

const awsubs = require('./routes/awsubs');
const nekonime = require('./routes/nekonime');

const configDB = require('./config/database');

// Connect to Database
mongoose.connect(configDB.mongodb, {
    useMongoClient: true,
});

// On Database Connection
mongoose.connection.on('connected', () => {
    console.log('Database connected');
});

// On Database Error
mongoose.connection.on('error', (err) => {
    console.log(`Database error: ${err}`);
});

// Disable X-Powered-By
app.disable('x-powered-by');

// Cors Middleware
app.use(cors());

// Parse application/x-www-form-urlencoded
// app.use(bodyParser.urlencoded({ extended: false }));

// Parse application/json
app.use(bodyParser.json());

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Set view engine to pug
app.set('view engine', 'pug');

app.get('/', (req, res) => {
    res.render('index');
});

app.use('/awsubs', awsubs);
app.use('/nekonime', nekonime);

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});
