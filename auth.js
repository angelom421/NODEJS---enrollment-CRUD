const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

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

// Register
exports.register = (req, res) => {
    console.log(req.body);

    const {firstname, lastname, email, password, confirmpassword} = req.body;

    db.query(`SELECT email FROM admin WHERE email = ?`, [email], async (err, result) => {
        if (err) {
            //throw err;
            console.log(err);
        }
        if (result.length > 0) {
            return res.render('register', {message: 'Email entered is already in use!'});
        } else if (password !== confirmpassword) {
            return res.render('register', {message: 'Passwords entered do not match!'})
        }
        // Encrypt Password
        let encpass = await bcrypt.hash(password, 8);
        console.log(encpass);

        db.query(`INSERT INTO admin SET ?`, {firstname:firstname, lastname:lastname, email:email, password:encpass}, (err, result) => {
            if (err) {
                //throw err;
                console.log(err);
            } else {
                console.log(result);
                return res.render('login', {message:'User Registered!'});
            }
        });
    });

}

// Log in 
exports.login = (req, res) => {
    const {email, password} = req.body;

    if (!email || !password) return res.status(400).render('login', {message:'Please provide email and password!'});

    db.query(`SELECT * FROM admin WHERE email = ?`, [email], async (err, result) => { 
        
        if (!result || !(await bcrypt.compare(password, result[0].password) ) ) {
            res.status(401).render('login', {message:'Email or Password is incorrect!'} );
        } else {
            const id = result[0].reg_id;
            const token = jwt.sign({id}, process.env.JWT_SECRET, {expiresIn:process.env.JWTEXPIRESIN} );
            console.log(token);
            const cookieOptions = {
                expires: new Date(
                   Date.now() + process.env.COOKIEXPIRES * 24 * 60 * 60 * 1000
                ), 
                httpOnly: true,
            };
            res.cookie('jwt', token, cookieOptions);
            db.query(`SELECT * FROM admission`, (err, result) => {
                if (err) throw err;
                res.render('listofenrollees', {title: 'List of Enrollees', user:result} );
            });
        }
    });
}

// Update
exports.updateform = (req, res) => {
    const email = req.params.email;
    db.query(`SELECT * FROM admission WHERE email = ?`, [email], (err, result) => {
        if (err) throw err;
        res.render('updateform', {title: 'Edit Enrollee', user:result[0]} );
    });
}

exports.updateenrollees = (req, res) => {
    const {course_id, first_name, middle_name, last_name, email} = req.body;

    db.query(`UPDATE admission SET course_id = '${course_id}', first_name = '${first_name}', middle_name = '${middle_name}', last_name = '${last_name}' WHERE email = '${email}'`, (err, result) => {
        if (err) throw err;
        db.query(`SELECT * FROM admission`, (err, result) =>{
            res.render('listofenrollees', {title: 'List of Enrollees', user:result});
        });
    });
}

// Delete
exports.deleteuser = (req, res) => {
    const email = req.params.email;

    db.query(`DELETE FROM admission WHERE email = '${email}'`, (err, result) => {
        if (err) throw err;
        db.query(`SELECT * FROM admission`, (err, result) => {
            res.render('listofenrollees', {title: 'List of Enrollees', user:result});
        });
    });
}

// Add
exports.addform = (req, res) => {
    db.query(`SELECT * FROM admission`, (err, result) => {
        if (err) throw err;
        res.render('addform', {title:'New Enrollee', user:result[0]} );
    });
}

exports.addenrollee = (req, res) => {
    const {admission_id, course_id, first_name, middle_name, last_name, email, gender, payment_id, test_id} = req.body;

    db.query(`INSERT INTO admission(admission_id, course_id, first_name, middle_name, last_name, email, gender, payment_id, test_id) VALUES('${admission_id}', '${course_id}', '${first_name}', '${middle_name}', '${last_name}', '${email}', '${gender}', '${payment_id}', '${test_id}')`, (err, result) => {
        if (err) throw err;
        db.query(`SELECT * FROM admission`, (err, result) => {
            res.render('listofenrollees', {title: 'List of Enrollees', user:result});
        });
    });
}