/**
 * Created by zhangwei on 4/8/17.
 */
var User = require('../models/User');
var Job = require('../models/Job');
var Doslation = require('../models/Doslation');
var jsonBuilder = require('../utils/json/jsonBuilder');

var apiController = {

    getTranslationByJobId: function (req, res) {

        Job
            .find({_id: req.param("id")})
            .populate('candidateList')
            .populate('pickedList')
            .exec(function (err, list) {
                if (err) {
                    var error = {
                        errorMessage: "Get Translation By Job ID Failed",
                        errorRespnse: err
                    }

                    var response = jsonBuilder.buildResponse("Get Translation By Job ID", false, null, error);
                    res.status(500).json(response);
                    return;
                }

                var language = req.param("language");
                var finalCandidates = [];
                var finalPicked =[];
                list.map(function(eachJob){
                    "use strict";

                    eachJob.candidateList.map(function(dos){
                        finalCandidates.push(dos);
                    });

                    eachJob.pickedList.map(function(dos){
                        finalPicked.push(dos);
                    });
                })

                var resBody = {
                    candidates: finalCandidates,
                    picked: finalPicked
                }
                var error = null;

                var response = jsonBuilder.buildResponse("Get Translation By Languages", true, resBody, error);
                res.status(200).json(response);
                return;
            });

    },


    getTranslationByLanguage: function (req, res) {
        Job
            .find({})
            .populate('candidateList')
            .populate('pickedList')
            .exec(function (err, list) {
                if (err) {
                    var error = {
                        errorMessage: "Get Translation By Languages Failed",
                        errorRespnse: err
                    }

                    var response = jsonBuilder.buildResponse("Get Translation By Languages", false, null, error);
                    res.status(500).json(response);
                    return;
                }

                var language = req.param("language");
                var finalCandidates = [];
                var finalPicked =[];
                list.map(function(eachJob){
                    "use strict";

                    eachJob.candidateList.map(function(dos){
                        if(dos.language === language) {
                            finalCandidates.push(dos);
                        }
                    });

                    eachJob.pickedList.map(function(dos){
                        if(dos.language === language) {
                            finalPicked.push(dos);
                        }
                    });
                })

                var resBody = {
                    candidates: finalCandidates,
                    picked: finalPicked
                }
                var error = null;

                var response = jsonBuilder.buildResponse("Get Translation By Languages", true, resBody, error);
                res.status(200).json(response);
                return;
            });
    }

};

module.exports = apiController;