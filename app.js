const express = require('express');
const exphds = require('express-handlebars')
const fs = require('fs');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const flash = require('connect-flash');
const session = require('express-session');
const path = require('path');
const passport = require('passport')
// app.get('/', (req, res)=>{
//         res.sendStatus('200')
// }); 


const app = express();

const ideas = require('./routes/ideas');
const users = require('./routes/users');

require('./config/passport')(passport);

mongoose.Promise = global.Promise;
mongoose.connect("mongodb://localhost/My-Jotter", {
        useNewUrlParser: true
    })
    .then(() => console.log('MongoDB connected....'))
    .catch(err => console.log(err));

app.engine('handlebars', exphds({
    defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
    extended: false
}))
// parse application/json
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, 'public')));

app.use(methodOverride('_method'));

app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true,
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

// global variables
app.use(function (req, res, next) {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.user = req.user || null;
    next();
});

// my routes

app.get('/', (req, res) => {
    const title = 'Welcome here'
    res.render('index', {
        title: title
    });
});

app.get('/about', (req, res) => {
    res.render('about');
});

app.use('/ideas', ideas);
app.use('/users', users);

const port = process.env.PORT || 5000;

app.listen(port, () => {
    console.log(`Serve started on port ${port}`)
});