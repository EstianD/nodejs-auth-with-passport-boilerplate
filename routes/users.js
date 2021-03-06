const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');

// USER MODEL
const User = require('../models/User');

// LOGIN PAGE
router.get('/login', (req, res) => {
    res.render('login');
});

// register page
router.get('/register', (req, res) => {
    res.render('register');
});

// REGISTER HANDLE
router.post('/register', (req, res) => {
    const { name, email, password, password2 } = req.body;

    let errors = [];

    // CHECK REQUIRED FIEDLS
    if (!name || !email || !password || !password2) {
        errors.push({ msg: 'Please fill in all fields' });
    }

    // CHECK IF PASSWORDS MATCH
    if (password !== password2) {
        errors.push({ msg: 'Passwords do not match' });
    }

    // CHECK PASSWORD LENGTH
    if (password.length < 6) {
        errors.push({ msg: 'Password shold be atleast 6 characters' });
    }

    if (errors.length > 0) {
        res.render('register', {
            errors,
            name,
            email,
            password,
            password2
        });
        console.log(errors);
    } else {
        // VALIDATION PASSED
        User.findOne({ email: email })
            .then(user => {
                if (user) {
                    // USER EXISTS
                    errors.push({ msg: 'Email is allready registered!' });
                    res.render('register', {
                        errors,
                        name,
                        email,
                        password,
                        password2
                    });
                } else {
                    const newUser = new User({
                        name, //ES6 DESTRUCTORING
                        email,
                        password
                    });
                    // HASH PASSWORD
                    bcrypt.genSalt(10, (err, salt) => bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if (err) throw err;
                        // SET PASSWORD TO HASHED PASSWORD
                        newUser.password = hash;
                        // SAVE USER
                        newUser.save()
                            .then(user => {
                                req.flash('success_msg', 'You are now registered and can log in');
                                res.redirect('/users/login');
                            })
                            .catch(err => console.log(err))
                    }));
                }
            });
    }
});

// LOGIN HANDLE
router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/dashboard',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next);
});

// LOGOUT HANDLE
router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/users/login');
});


module.exports = router;