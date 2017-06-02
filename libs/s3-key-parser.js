const mcParser = require('./mc-version-parser');

function s3Parser(contents, req) {
    return new Promise(function (fulfill, reject) {
        let returnContents = [];
        for (var i = 0, len = contents.length; i < len; i++) {
            // remove root folder from key
            var re = new RegExp(`${req.params.id}/`, "g");
            let noRootKey = contents[i].Key.replace(re, '');
            // remove filename from key
            let key = noRootKey.indexOf('/');
            key = noRootKey.substring(0, key != -1 ? key : noRootKey.length);

            if (key.indexOf('.') > -1) {
                if (mcParser(key)) {
                    returnContents.push({
                        versionParsed: mcParser(key),
                        version: key,
                        key: contents[i].Key,
                        date: contents[i].LastModified,
                        size: contents[i].Size
                    })

                    returnContents.sort(function (a, b) {
                        a = new Date(a.date);
                        b = new Date(b.date);
                        return a > b ? -1 : a < b ? 1 : 0;
                    });
                    fulfill(returnContents);
                }
            } else {
                returnContents.push({
                    versionParsed: key,
                    version: key,
                    key: contents[i].Key,
                    date: contents[i].LastModified,
                    size: contents[i].Size
                })

                returnContents.sort(function (a, b) {
                    a = new Date(a.date);
                    b = new Date(b.date);
                    return a > b ? -1 : a < b ? 1 : 0;
                });
                fulfill(returnContents);
            }
        }
    });
}

module.exports = s3Parser;