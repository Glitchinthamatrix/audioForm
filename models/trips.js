const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const tripSchema = new Schema({
    createdAt: { type: String, default: new Date().toLocaleDateString() + ", " + new Date().toLocaleTimeString() },
    dateStarted: { type: String, required: true },
    origin: { type: String, required: true },
    destination: { type: String, required: true },
    driver: { type: String, required: true },
    client: { type: String, required: true },
    dateEnd: { type: String, required: true },
})

const model = mongoose.model('Trip', tripSchema);
module.exports = model;