const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const stepSchema = new Schema({
    city: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    trip: { type: Schema.Types.ObjectId, ref: 'Trip'}
})

module.exports = mongoose.model('Step', stepSchema)