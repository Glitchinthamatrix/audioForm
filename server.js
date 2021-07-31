const express = require('express');
const app = express();
const dotenv = require('dotenv');
dotenv.config();
const mongoose = require('mongoose');
const Trip = require('./models/trips')
const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
const methodOverride = require('method-override');
const jwt = require('jsonwebtoken');
// const cookieParser = require('cookie-parser');
// app.use(cookieParser);

var SECRET_TOKEN = process.env.ACCESS_TOKEN_SECRET;

const URL = "mongodb+srv://Nitesh:mayday9501@ecommerceweb.efse8.mongodb.net/PROJECT0?retryWrites=true&w=majority";


app.set('view engine', 'ejs');
app.use(methodOverride("_method"));

app.get('/', async(req, res) => {
    var data = await Trip.find();
    console.log(data)
    res.render('list', { data: data });
})
app.post('/', async(req, res) => {

    console.log("posting...", req.body);
    try {
        console.log(req.body)
        var doc = await Trip.create(req.body);
        console.log('doc created: ', doc);
        res.redirect('/')
    } catch (err) {
        console.log('could not post: ', err.message)
    }
})
app.put('/:id', async(req, res) => {
    await Trip.findByIdAndUpdate(req.params.id, req.body, (err, docs) => {
        if (err) {
            console.log('could not edit: ', err.message)
        } else {
            res.redirect('/')
        }
    })
})
app.delete('/:id', async(req, res) => {
    await Trip.findByIdAndDelete(req.params.id, (err, docs) => {
        if (err) {
            console.log('could not delete: ', err.message)
        } else {
            console.log('deleted: ', docs);
            res.redirect('/')
        }
    });

})

app.get('/new', (req, res) => {
    res.render('new')
})

app.get('/edit/:id', async(req, res) => {
    var data = await Trip.findById(req.params.id);
    res.render('edit', { data: data });
})

app.get('/delete/:id', async(req, res) => {
    var data = await Trip.findById(req.params.id);
    res.render('delete', { data: data });
})
app.get('/signup', (req, res) => {
    res.render('form');
})
app.post('/signup', (req, res) => {
    var username = req.body.username;
    var token = jwt.sign(username, SECRET_TOKEN);
    res.cookie('myCookie', token);
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