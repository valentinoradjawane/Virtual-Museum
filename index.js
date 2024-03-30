if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config();
}

const express = require('express');
const app = express();
const path = require('path');
const bcrypt = require('bcrypt');
const port = 3000;

const methodOverride = require('method-override');
app.use (methodOverride('_method'));


const flash = require('express-flash');
const session = require('express-session');

const passport = require('passport');

const initializePassport = require('./passport-config');
initializePassport(
    passport,
    email => users.find(user => user.email === email),
    id => users.find(user => user.id === id)
   
);

const users = [];

app.use(express.urlencoded({ extended: false }));

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

//ejs
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

//static
app.use(express.static("public"));

const mahasiswa = [
    {name : "Sean", email : "sean@sean"},
    {name : "Aldo", email : "aldo@aldo"},
    {name : "Paulin", email : "paulin@paulin"}
]

app.get('/',checkAuthenticated, (req, res) => {
    res.render('index', { nama: req.user.name, title : "Museum Virtual", mahasiswa : mahasiswa});
});

//login
app.get('/login', checkNotAuthenticated, (req, res) => {
    res.render('login.ejs')
  })

//register
app.get('/register', checkNotAuthenticated,(req, res) => {
    res.render('register');
});

//post login
app.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
  }))

//post register
app.post('/register', async (req, res) => {
   try   {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    users.push({
        id: Date.now().toString(),
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword
    });
    res.redirect('/login');
   }    catch    {
    res.redirect('/register');
   }
   console.log(users);
});

function checkAuthenticated(req,res,next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect('/login');
}

function checkNotAuthenticated(req,res,next){
    if(req.isAuthenticated()){
        return res.redirect('/');
    }
    next();
}

app.delete('/logout', (req, res, next) => {
    req.logOut(function
    (err) {
        if (err) {
            return next(err);
        }
        res.redirect('/login');
    });
});

app.listen(3000, () => {
    console.log('Server running on port 3000');
});