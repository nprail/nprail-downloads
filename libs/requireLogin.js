module.exports = function requireLogin() {
    console.log('yo')
    return function (req, res, next) {
        console.log('yo2')
        console.log(req)
        console.log(res)
        if (req) {
            if (req.user) {
                next();
            } else {
                res.redirect('/unauthorized');
            }
        } else {
            next();
        }
    }
}