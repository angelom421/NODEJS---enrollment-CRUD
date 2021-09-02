const express = require('express');
const router = express.Router();
const {admission} = require('../controllers/auth');
const registrationControl = require('../controllers/auth');

router.post('/login', registrationControl.login);
router.post('/register', registrationControl.register);
router.get('/updateform/:email', registrationControl.updateform);
router.post('/updateenrollees', registrationControl.updateenrollees);
router.get('/deleteuser/:email', registrationControl.deleteuser);
router.get('/addform/', registrationControl.addform);
router.post('/addenrollee', registrationControl.addenrollee);

module.exports = router;