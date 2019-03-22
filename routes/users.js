const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');
const bcrypt = require('bcryptjs');

require('./../models/users');
const User = mongoose.model('users');

// login
router.get('/login', (req, res) => {
    res.render('users/login');
})

router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/ideas',
        failureFlash: true,
        failureRedirect: '/users/login'
    })(req, res, next);
})
// register
router.get('/register', (req, res) => {
    res.render('users/register');
})

router.post('/register', (req, res) => {
    let errors = [];
    if (req.body.password != req.body.password1) {
        errors.push({
            text: 'Passwords does match'
        });
    }
    if (req.body.password.length < 4) {
        errors.push({
            text: 'password too short'
        });
    }
    if (errors.length > 0) {
        res.render('users/register', {
            errors: errors,
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            password1: req.body.password1
        })
    } else {
        User.findOne({
                email: req.body.email
            })
            .then(user => {
                if (user) {
                    req.flash('error_msg', 'Email has already been used');
                    res.redirect('/users/register')
                } else {
                    const newUser = new User({
                        name: req.body.name,
                        email: req.body.email,
                        password: req.body.password
                    })
                    bcrypt.genSalt(10, function (err, salt) {
                        bcrypt.hash(newUser.password, salt, (err, hash) => {
                            // if (err) throw err;
                            newUser.password = hash;
                            newUser.save()
                                .then(user => {
                                    req.flash('success_msg', 'Registration Successful');
                                    res.redirect('/users/login');
                                })
                                .catch(err => {
                                    console.log(err);
                                })
                        });

                    });
                }
            });
    }
});

router.get('/logout', (req,res)=>{
    req.logout();
    res.redirect('/users/login')
})

module.exports = router