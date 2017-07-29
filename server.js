const express = require('express');
const exphbs = require('express-handlebars');
const Auth0Strategy = require('passport-auth0');
const passport = require('passport');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');
const logger = require('morgan');
const dotenv = require('dotenv');
const app = express();

dotenv.load();

const port = process.env.PORT || 3000;

// routes
const routes = require('./routes/index');
const user = require('./routes/user');

const strategy = new Auth0Strategy({
        domain: 'nprail.auth0.com',
        clientID: process.env.AUTH0_CLIENT_ID,
        clientSecret: process.env.AUTH0_CLIENT_SECRET,
        callbackURL: process.env.AUTH0_CALLBACK_URL
    },
    function (accessToken, refreshToken, extraParams, profile, done) {
        // accessToken is the token to call Auth0 API (not needed in the most cases)
        // extraParams.id_token has the JSON Web Token
        // profile has all the information from the user
        return done(null, profile);
    }
);
passport.use(strategy);

passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (user, done) {
    done(null, user);
});

app.engine('handlebars', exphbs({
    defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(cookieParser());
app.use(session({
    // Here we are creating a unique session identifier
    secret: 'shhhhhhhhh',
    resave: true,
    saveUninitialized: true
}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(passport.initialize());
app.use(passport.session());

const items = {
    spigot: {
        name: 'Spigot',
        locked: true,
        flavors: [{
            name: 'Pre-Release',
            url: 'pre'
        }, {
            name: 'Latest',
            url: 'latest'
        }]
    },
    craftbukkit: {
        name: 'CraftBukkit',
        locked: true,
        flavors: [{
            name: 'Pre-Release',
            url: 'pre'
        }, {
            name: 'Latest',
            url: 'latest'
        }]
    },
    jpanel: {
        name: 'JPanel',
        locked: false,
        flavors: [{
            name: 'Dev',
            url: 'latest'
        }]
    },
    dynmap: {
        name: 'Dynmap',
        locked: false,
        flavors: [{
            name: 'Dev',
            url: 'latest'
        }]
    }
}
app.locals.items = items;

app.use('/', routes);
app.use('/user', user);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});
// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


app.listen(port);

console.log(`App Listening on Port ${port}`)
