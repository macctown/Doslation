/**
 * Created by zhangwei on 4/8/17.
 */

var mongoose = require('mongoose');
var Doslation = require('./Doslation');

var jobInfoSchema = new mongoose.Schema({

    original: String,

    link: String,

    isFinished: Boolean,

    pendingList: {
        swahili: {
            type: [
                {type: Doslation}
            ]
        },
        amharic: {
            type: [
                {type: Doslation}
            ]
        },
        yoruba: {
            type: [
                {type: Doslation}
            ]
        }
    },

    pickedList: {
        swahili: {
            type: [
                {type: Doslation}
            ]
        },
        amharic: {
            type: [
                {type: Doslation}
            ]
        },
        yoruba: {
            type: [
                {type: Doslation}
            ]
        }
    }

}, { timestamps: true });

var JobInfo = mongoose.model('JobInfo', jobInfoSchema);

module.exports = JobInfo;