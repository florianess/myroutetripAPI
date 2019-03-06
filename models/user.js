const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    sub: { type: String, required: true },
    email: { type: String, required: true },
    name: { type: String, required: true },
    userTrips: [{
        type: Schema.Types.ObjectId,
        ref: 'Trip'
    }]
})

module.exports = mongoose.model('User', userSchema)