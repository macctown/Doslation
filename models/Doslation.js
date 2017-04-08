/**
 * Created by zhangwei on 4/8/17.
 */

var mongoose = require('mongoose');

var doslationSchema = new mongoose.Schema({

    language: String,

    translation: String,

    like: {type: Number, default: 0},

    jobRef: {
        type: mongoose.Schema.ObjectId,
        ref: 'JobInfo'
    }

}, { timestamps: true });

var Doslation = mongoose.model('Doslation', doslationSchema);

module.exports = Doslation;