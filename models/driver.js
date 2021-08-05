const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');

const driverSchema = new Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
})

driverSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 12);
    }
    next();
})

const Driver = mongoose.model('Driver', driverSchema);
module.exports = Driver;