const express = require('express');
const router = express.Router();
const s3 = require('s3');
const s3Parser = require('../libs/s3-key-parser');
const requireLogin = require('../libs/requireLogin');
const ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn();
const passport = require('passport');
const client = s3.createClient({
    s3Options: {
        accessKeyId: process.env.S3_KEY_ID,
        secretAccessKey: process.env.S3_KEY_SECRET,
        region: 'us-east-1'
    },
});

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

router.get('/', function (req, res, next) {
    res.render('home', {
        items: items,
        user: req.user
    });
});
router.get('/unauthorized', function (req, res, next) {
    res.render('unauthorized');
});

router.get('/downloads/:id', function (req, res, next) {
    item = items[req.params.id];
    if (item.locked) {
        if (!req.isAuthenticated || !req.isAuthenticated()) {
            return res.redirect('/unauthorized');
        }
        next();
    } else {
        next();
    }
}, function (req, res, next) {
    const params = {
        s3Params: {
            Bucket: 'dl.nprail.me',
            Prefix: req.params.id,
        },
    };
    var list = client.listObjects(params);
    list.on('error', function (err) {
        new Error(err);
        next(err);
    });
    list.on('data', function (data) {
        let contents = data.Contents;
        s3Parser(contents, req).then(function (results) {
            res.render('downloads', {
                item: items[req.params.id],
                id: req.params.id,
                contents: results,
                user: req.user
            })
        }).catch(function (err) {
            console.error(err);
            var err = new Error(err);
            next(err);
        });
    });
});

router.get('/login',
    passport.authenticate('auth0', {}),
    function (req, res) {
        res.redirect("/");
    });
/*
router.get('/login',
    function (req, res) {
        res.render('login', {
            env: process.env
        });
    });*/
// Perform session logout and redirect to homepage
router.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
});

// Perform the final stage of authentication and redirect to '/user'
router.get('/callback',
    passport.authenticate('auth0', {
        failureRedirect: '/'
    }),
    function (req, res) {
        res.redirect(req.session.returnTo || '/user');
    });

module.exports = router;
