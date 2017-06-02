const express = require('express');
const exphbs = require('express-handlebars');
const parser = require('./libs/mc-version-parser')
const s3Parser = require('./libs/s3-key-parser')
const s3 = require('s3');
const app = express();

const port = process.env.PORT || 3000;
const client = s3.createClient({
    s3Options: {
        accessKeyId: process.env.S3_KEY_ID,
        secretAccessKey: process.env.S3_KEY_SECRET,
        region: 'us-east-1'
    },
});

app.engine('handlebars', exphbs({
    defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');
app.use(express.static('public'))

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
    }
}
app.locals.items = items;

app.get('/', function (req, res) {
    res.render('home', items);
});
app.get('/downloads/:id', function (req, res) {
    const params = {
        s3Params: {
            Bucket: 'dl.nprail.me',
            Prefix: req.params.id,
        },
    };
    var list = client.listObjects(params);
    list.on('error', function (err) {
        res.status(500).send(err.stack)
    });
    list.on('data', function (data) {
        let contents = data.Contents;
        s3Parser(contents, req).then(function (results) {
            res.render('downloads', {
                item: items[req.params.id],
                id: req.params.id,
                contents: results
            })
        }).catch(function (err) {
            console.error(err);
        });
    });
});

app.listen(port);

console.log(`App Listening on Port ${port}`)