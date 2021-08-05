const jwt = require('jsonwebtoken');
require('dotenv').config();

exports.verifyToken = function(req, res, next) {
    if (req.headers.cookie) {
        var authCookie = req.headers.cookie;
        console.log('authCookie found in authentication : ', authCookie)
        var myCookie = authCookie.split('=')[1];
        console.log('actual cookie with token and driverId : ', myCookie);
        var token = myCookie.split('driverID')[0];
        console.log('token: ', token + "   ", "driverId: ", myCookie.split('driverID')[1]);
        var verified = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        if (verified) {
            console.log('verified token');
            console.log('if you see me, the problem does not exist, no you"re not in dilemma')
            next()
        } else {
            console.log('probably the cookie has expired, log in to get get cookie')
        }
    } else {
        res.redirect('/signup');
    }
}