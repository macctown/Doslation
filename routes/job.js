/**
 * Created by zhangwei on 4/8/17.
 */
var Doslation = require('../models/Doslation');
var Job = require('../models/Job');
var request = require('request');

var jobController = {

    joblistByLanguage: function (req, res) {
        "use strict";
        var lang = req.param("language");
        request.post('http://localhost:3000/api/v1/translation/lan/'+lang, function(error, response, body) {
            if (error){
                req.flash('errors', { msg: error});
                return res.redirect('/home');
            }

            var data = JSON.parse(body);
            res.render('jobList', {
                title: 'Job List | ' + lang,
                jobs: data.result.picked
            });
        });
    }

};


module.exports = jobController;