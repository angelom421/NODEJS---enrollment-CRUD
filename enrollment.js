const cookie = require('cookie-parser');
const dotenv = require('dotenv');
const express = require('express');
const mysql = require('mysql2');
const enrollment = express();
const hostname = 'localhost';
const port = process.env.port || 3000;
const path = require('path');

dotenv.config({path: './.env'});

const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
});

db.connect( (err) => {
    if (err) {
    console.error('error connecting:' + err.stack)
    return;
    } else {
        console.log('MySQL connected.');
    }
});

enrollment.set('view engine', 'hbs'); 

enrollment.use(express.urlencoded({extended:true})); 
enrollment.use(express.json()); 

// Define routes
enrollment.use('/', require('./route/admissionroute'));
enrollment.use('/auth', require('./route/auth'));

const publicdir = path.join(__dirname, './public');
enrollment.use(express.static(publicdir));

enrollment.use(cookie());

enrollment.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`)
});