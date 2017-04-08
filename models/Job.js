/**
 * Created by zhangwei on 4/8/17.
 */

var mongoose = require('mongoose');
var Doslation = require('./Doslation');
var random = require('mongoose-random');

var jobSchema = new mongoose.Schema({

    type: String,

    salary: String,

    company: String,

    description: String,

    position_name: String,

    link: String,

    location: String,

    counter: {type: Number, default: 0},

    isFinished: { type: Boolean, default: false},

    pickedList: [{
        type: mongoose.Schema.ObjectId,
        ref: 'Doslation'
    }],

    candidateList: [{
        type: mongoose.Schema.ObjectId,
        ref: 'Doslation'
    }]

}, { timestamps: true });

jobSchema.plugin(random, { path: 'r' });

var Job = mongoose.model('Job', jobSchema);

module.exports = Job;