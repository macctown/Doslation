/**
 * Created by zhangwei on 4/8/17.
 */

var mongoose = require('mongoose');
var Doslation = require('./Doslation');

var jobInfoSchema = new mongoose.Schema({

    type: String,

    salary: String,

    company: String,

    description: String,

    position_name: String,

    link: String,

    location: String,

    counter: {type: Number, default: 0},

    isFinished: { type: Boolean, default: false},

    pickedList: {
        swahili: {
            type: mongoose.Schema.ObjectId,
            ref: 'Doslation'
        },

        amharic: {
            type: mongoose.Schema.ObjectId,
            ref: 'Doslation'
        },
        yoruba: {
            type: mongoose.Schema.ObjectId,
            ref: 'Doslation'
        }
    }

}, { timestamps: true });

var JobInfo = mongoose.model('JobInfo', jobInfoSchema);

module.exports = JobInfo;