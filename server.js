const express = require('express');
const app = express();
const dotenv = require('dotenv');
const path = require('path');
dotenv.config();
const mongoose = require('mongoose');
const Trip = require('./models/trips')
const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(express.static(path.join(__dirname, 'public')))
const methodOverride = require('method-override');
const jwt = require('jsonwebtoken');
const auth = require('./authentication');
const Driver = require('./models/driver');
const bcrypt = require('bcrypt');
// const cookieParser = require('cookie-parser');
// app.use(cookieParser);

var SECRET_TOKEN = process.env.ACCESS_TOKEN_SECRET;

const URL = "mongodb+srv://Nitesh:mayday9501@ecommerceweb.efse8.mongodb.net/PROJECT0?retryWrites=true&w=majority";


app.set('view engine', 'ejs');
app.use(methodOverride("_method"));

app.get('/', auth.verifyToken, async(req, res) => {
    var authCookie = req.headers.cookie.split('=')[1];
    var driverID = authCookie.split('driverID')[1]
    var data = await Trip.find({ createdBy: driverID });
    console.log(data)
    res.render('list', { data: data });
})
app.post('/', auth.verifyToken, async(req, res) => {
    var authCookie = req.headers.cookie.split('=')[1];
    var driverID = authCookie.split('driverID')[1]
    console.log('driver ID: ', driverID)
    console.log("posting,before driverID", req.body);
    try {
        const { dateStarted, origin, destination, driver, client, dateEnd } = req.body;
        console.log(req.body)
        var doc = await new Trip({ dateStarted: dateStarted, origin: origin, destination: destination, driver: driver, client: client, dateEnd: dateEnd, createdBy: driverID });
        await doc.save();
        console.log('doc created: ', doc);
        res.redirect('/')
    } catch (err) {
        console.log('could not post: ', err.message)
    }
})
app.put('/:id', auth.verifyToken, async(req, res) => {
    await Trip.findByIdAndUpdate(req.params.id, req.body, (err, docs) => {
        if (err) {
            console.log('could not edit: ', err.message)
        } else {
            res.redirect('/')
        }
    })
})
app.delete('/:id', auth.verifyToken, async(req, res) => {
    await Trip.findByIdAndDelete(req.params.id, (err, docs) => {
        if (err) {
            console.log('could not delete: ', err.message)
        } else {
            console.log('deleted: ', docs);
            res.redirect('/')
        }
    });

})

app.get('/new', auth.verifyToken, (req, res) => {
    var driverID = req.headers.cookie.split('=')[1].split('driverID')[1];
    console.log('driver ID: ', driverID);
    res.render('new', { data: driverID })
})

app.get('/edit/:id', auth.verifyToken, async(req, res) => {
    var data = await Trip.findById(req.params.id);
    res.render('edit', { data: data });
})

app.get('/delete/:id', auth.verifyToken, async(req, res) => {
    var data = await Trip.findById(req.params.id);
    res.render('delete', { data: data });
})
app.get('/signup', (req, res) => {
    res.render('form');
})
app.post('/signup', async(req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
        res.send('कृपया पूछी गई सभी जानकारी दें')
    }
    var exists = await Driver.findOne({ email: email });
    if (exists) { res.send('आपका अकाउंट पहले ही बन चुका है, अपने अकाउंट डीटेल्स के साथ लॉगिन करें') };
    try {

        const newDriver = new Driver({ email, password });
        await newDriver.save();
        newdriverID = newDriver._id;
        console.log('this is the id set to driver that just logged in: ', newdriverID);
        //var cookie = jwt.sign(req.body.email, process.env.ACCESS_TOKEN_SECRET);
        var cookie = jwt.sign(req.body.email, process.env.ACCESS_TOKEN_SECRET) + "driverID" + newDriver._id;
        console.log("the thing: " + cookie + "mongoId: " + cookie.split('driverID')[1])
        res.cookie('jwt-cookie', cookie, { domain: 'testingheroku908.herokuapp.com', path: '/', httpOnly: true, secure: true });
        res.redirect('/');
        console.log('signup gave cookie: ', cookie);
        console.log('POST /signup ends here')
    } catch (err) {
        console.log('error while creating Driver: ', err.message)
    }
})

app.post('/logout', (req, res) => {
    res.clearCookie('testingheroku908.herokuapp.com');
    res.redirect('/');
    console.log('logged out');
})
app.get('/login', (req, res) => {
    res.render('login');
})
app.post('/login', async(req, res) => {
    console.log(req.body);
    const { email, password } = req.body;
    var driver = await Driver.findOne({ email: req.body.email });
    console.log('driver: ', driver)
    if (!driver) {
        res.send('इस ईमेल पर कोई अकाउंट नहीं है, कृपया अपना अकाउंट बनाएं')
    } else if (driver) {
        bcrypt.compare(password, driver.password, (err, matches) => {
            if (err) { res.send('किसी अज्ञात कारण से लॉगिन नहीं किया जा सका') }
            if (matches) {
                console.log('matches: ', matches);
                var cookie = jwt.sign(req.body.email, process.env.ACCESS_TOKEN_SECRET) + "driverID" + driver._id;
                res.cookie('jwt-cookie', cookie, { domain: 'testingheroku908.herokuapp.com', path: '/', httpOnly: true, secure: true });
                res.redirect('/')
            } else if (!matches) {
                res.send('पासवर्ड गलत है')
            } else {
                res.send('किसी अज्ञात कारण से लॉगिन नहीं किया जा सका');
                console.log('bhayankar error bhai, bhayankar error')
            }

        })
    }

})

const connection = async(URL) => {
    //const URL = 'mongodb+srv://Nitesh:mayday9501@ecommerceweb.efse8.mongodb.net/PROJECT0?retryWrites=true&w=majority'
    try {
        await mongoose.connect(URL, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false })
        console.log('DB connected successfully')
    } catch (err) {
        console.log('Error: ', err.message);
    }
}

connection(process.mongodb_uri || URL);

var PORT = process.env.PORT || 3500;

app.listen(PORT, () => {
    console.log('listening to port ' + PORT)
});