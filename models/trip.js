const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const tripSchema = new Schema({
    name: { type: String, required: true },
    description: String,
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isPublic: { type: Boolean, required: true, default: true },
    creator: { type: Schema.Types.ObjectId, ref: 'User'},
    tripSteps: [{
        type: Schema.Types.ObjectId,
        ref: 'Step'
    }]
})

module.exports = mongoose.model('Trip', tripSchema)