const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const {ensureAuthenticated} = require('../helpers/auth')

require('../models/Idea');
const Idea = mongoose.model('ideas');

router.post('/',ensureAuthenticated, (req, res) => {
    let errors = [];
    if (!req.body.title) {
        errors.push({
            text: 'Please add a title'
        });
    }
    if (!req.body.details) {
        errors.push({
            text: 'please fill in the details'
        })
    }
    if (errors.length > 0) {
        res.render('/add', {
            errors: errors,
            title: req.body.title,
            details: req.body.details
        });
    } else {
        const newUser = {
            title: req.body.title,
            details: req.body.details,
            user: req.user.id
        };
        new Idea(newUser).save()
            .then(idea => {
                req.flash('success_msg', 'Idea Added');
                res.redirect('/ideas');
            })
            .catch(err => {
                res.status(400).send("unable to save to database");
            });
        // console.log(newUser)
    }
});


router.get('/',ensureAuthenticated, (req, res) => {
    Idea.find({user: req.user.id})
        .sort({
            date: "desc"
        })
        .then(ideas => {
            res.render('ideas/index', {
                ideas: ideas
            });
        })

});

router.get('/edit/:id',ensureAuthenticated, (req, res) => {
    // console.log(req.params.id)
    Idea.findOne({
            _id: req.params.id
        })
        .then(idea => {
            if (idea.user != req.user.id) {
                req.flash('error_msg', 'Not authorized');
                res.redirect('/ideas');
            } else {
                res.render('ideas/edit', {
                    idea: idea
                }); 
            }
        })
});

router.put('/:id',ensureAuthenticated, (req, res) => {
    Idea.findOne({
            _id: req.params.id
        })
        .then(idea => {
            idea.title = req.body.title;
            idea.details = req.body.details;

            idea.save().then(idea => {
                req.flash('success_msg', 'Idea Updated');
                res.redirect('/ideas');
            })
        })
})

router.delete('/:id',ensureAuthenticated, (req, res) => {
    Idea.deleteOne({
            _id: req.params.id
        })
        .then(() => {
            req.flash('success_msg', 'Idea Deleted');
            res.redirect('/ideas');
        })
})

router.get('/add',ensureAuthenticated, (req, res) => {
    res.render('ideas/add', {});
});

module.exports = router;