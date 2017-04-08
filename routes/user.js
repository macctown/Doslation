var _ = require('lodash');
var async = require('async');
var crypto = require('crypto');
var nodemailer = require('nodemailer');
var passport = require('passport');
var User = require('../models/User');
var Job = require('../models/Job');
var Doslation = require('../models/Doslation');


var userController = {

    /**
     * GET /login
     * Login page.
     */
    getLogin : function(req, res) {
        res.render('signin', {
            title: 'Sign In',
            errors: req.flash("errors")
        });
    },

    getDoslation: function(req, res, next){
        var jobId = req.param('id');

        Job.findOne({ _id: jobId }, function(err, job) {
            if (err) {
                req.flash('errors', { msg: err});
                return res.redirect('/dashboard');
            }
            else{
                job["score"] = parseInt(job["description"].length / 66);
                res.render('doslation', {
                    title: 'Submit Your Doslation',
                    subtitle: 'Submit Your Doslation',
                    jobInfo: job
                });
            }
        });


    },

    postDoslation : function(req, res, next) {
        "use strict";
        var language = req.body.language;
        var jobId = req.body.jobId;
        var translation = req.body.translation;
        var userEmail = req.user.email;
        var score = req.body.score;

        //create donslation
        var ObjectID = require('mongodb').ObjectID;

        var doslation = new Doslation({
            language: language,
            translation: translation,
            jobRef: jobId,
            _id: new ObjectID()
        });

        doslation.save(function (err, results) {

            var newDoslationId = results._id;
            //update user info
            User.update(
                {email: userEmail},
                {
                    $push: { doslationList: newDoslationId },
                    $inc: {["score"]: score}
                },
                function (err, updatedUser) {
                    if (err) {
                        req.flash('errors', { msg: err});
                        return res.redirect('/dashboard');
                    }
                    else {

                        Job.update(
                            {_id: jobId},
                            {
                                $inc: { ["counter"]: 1 },
                                $push: { pickedList: newDoslationId },
                            },
                            function (err, updatedJob) {
                                if (err) {
                                    req.flash('errors', { msg: err});
                                    return res.redirect('/dashboard');
                                }
                                else{
                                    req.flash('success', { msg: "Successfully Translate a Job Info and get " + score + " points!"});
                                    return res.redirect('/dashboard');
                                }
                            });
                    }

                });



        });
    },

    /**
     * POST /login
     * Sign in using email and password.
     */
    postLogin : function(req, res, next) {
        req.assert('email', 'Email is not valid').isEmail();
        req.assert('password', 'Password cannot be blank').notEmpty();
        req.sanitize('email').normalizeEmail({ remove_dots: false });

        var errors = req.validationErrors();

        if (errors) {
            req.flash('errors', errors);
            return res.redirect('/signin');
        }

        passport.authenticate('local', function(err, user, info) {
            if (err) {
                return next(err);
            }
            if (!user) {
                req.flash('errors', info);
                return res.redirect('/signin');
            }
            req.logIn(user, function(err) {
                if (err) {
                    return next(err);
                }
                req.flash('success', { msg: 'Success! You are logged in.' });
                res.redirect('/dashboard');
            });
        })(req, res, next);
    },

    /**
     * GET /logout
     * Log out.
     */
    logout : function(req, res) {
        req.logout();
        res.redirect('/');
    },

    /**
     * GET /signup
     * Signup page.
     */
    getSignup : function(req, res) {
        if (req.user) {
            return res.redirect('/');
        }
        res.render('signup', {
            title: 'Sign Up',
            errors: req.flash("errors")
        });
    },

    getDashboard : function(req, res) {
        //get 5 job

        Job.find().limit(5).exec(function (err, jobs) {
            if(err){
                req.flash('errors', error);
                return res.redirect('/dashboard');
            }
            else{
                jobs.map(function (job) {
                   job["score"] = parseInt(job["description"].length / 66);
                });
                res.render('dashboard', {
                    title: 'Dashboard',
                    subtitle: 'Doslation List',
                    jobInfo: jobs,
                    errors: req.flash("errors"),
                    success: req.flash("success")
                });
            }
        });

    },


    /**
     * GET /award
     * Award page.
     */
    getAward : function(req, res) {
        res.render('award', {
            title: 'Award',
            errors: req.flash("errors")
        });
    },

    /**
     * POST /signup
     * Create a new local account.
     */
    postSignup : function(req, res, next) {
        req.assert('email', 'Email is not valid').isEmail();
        req.assert('password', 'Password must be at least 4 characters long').len(4);
        req.assert('confirmPassword', 'Passwords do not match').equals(req.body.password);
        req.sanitize('email').normalizeEmail({ remove_dots: false });

        var errors = req.validationErrors();

        if (errors) {
            req.flash('errors', errors);
            return res.redirect('/signup');
        }

        var user = new User({
            email: req.body.email,
            password: req.body.password
        });

        User.findOne({ email: req.body.email }, function(err, existingUser) {
            if (existingUser) {
                req.flash('errors', { msg: 'Account with that email address already exists.' });
                return res.redirect('/signup');
            }
            user.save(function(err) {
                if (err) {
                    return next(err);
                }
                req.logIn(user, function(err) {
                    if (err) {
                        return next(err);
                    }
                    res.redirect('/dashboard');
                });
            });
        });
    },

    /**
     * GET /account
     * Profile page.
     */
    getAccount : function(req, res) {
        res.render('account', {
            title: 'Account Management'
        });
    },

    /**
     * POST /account/profile
     * Update profile information.
     */
    postUpdateProfile : function(req, res, next) {
        req.assert('email', 'Please enter a valid email address.').isEmail();
        req.sanitize('email').normalizeEmail({ remove_dots: false });

        var errors = req.validationErrors();

        if (errors) {
            req.flash('errors', errors);
            return res.redirect('/account');
        }

        User.findById(req.user.id, function(err, user) {
            if (err) {
                return next(err);
            }
            user.email = req.body.email || '';
            user.profile.name = req.body.name || '';
            user.profile.gender = req.body.gender || '';
            user.profile.location = req.body.location || '';
            user.profile.website = req.body.website || '';
            user.save(function(err) {
                if (err) {
                    if (err.code === 11000) {
                        req.flash('errors', { msg: 'The email address you have entered is already associated with an account.' });
                        return res.redirect('/account');
                    } else {
                        return next(err);
                    }
                }
                req.flash('success', { msg: 'Profile information updated.' });
                res.redirect('/account');
            });
        });
    },

    /**
     * POST /account/password
     * Update current password.
     */
    postUpdatePassword : function(req, res, next) {
        req.assert('password', 'Password must be at least 4 characters long').len(4);
        req.assert('confirmPassword', 'Passwords do not match').equals(req.body.password);

        var errors = req.validationErrors();

        if (errors) {
            req.flash('errors', errors);
            return res.redirect('/account');
        }

        User.findById(req.user.id, function(err, user) {
            if (err) {
                return next(err);
            }
            user.password = req.body.password;
            user.save(function(err) {
                if (err) {
                    return next(err);
                }
                req.flash('success', { msg: 'Password has been changed.' });
                res.redirect('/account');
            });
        });
    },

    /**
     * POST /account/delete
     * Delete user account.
     */
    postDeleteAccount : function(req, res, next) {
        User.remove({ _id: req.user.id }, function(err) {
            if (err) {
                return next(err);
            }
            req.logout();
            req.flash('info', { msg: 'Your account has been deleted.' });
            res.redirect('/');
        });
    },

    /**
     * GET /reset/:token
     * Reset Password page.
     */
    getReset : function(req, res, next) {
        if (req.isAuthenticated()) {
            return res.redirect('/');
        }
        User
            .findOne({ passwordResetToken: req.params.token })
            .where('passwordResetExpires').gt(Date.now())
            .exec(function(err, user) {
                if (err) {
                    return next(err);
                }
                if (!user) {
                    req.flash('errors', { msg: 'Password reset token is invalid or has expired.' });
                    return res.redirect('/forgot');
                }
                res.render('account/reset', {
                    title: 'Password Reset'
                });
            });
    },

    /**
     * POST /reset/:token
     * Process the reset password request.
     */
    postReset : function(req, res, next) {
        req.assert('password', 'Password must be at least 4 characters long.').len(4);
        req.assert('confirm', 'Passwords must match.').equals(req.body.password);

        var errors = req.validationErrors();

        if (errors) {
            req.flash('errors', errors);
            return res.redirect('back');
        }

        async.waterfall([
            function(done) {
                User
                    .findOne({ passwordResetToken: req.params.token })
                    .where('passwordResetExpires').gt(Date.now())
                    .exec(function(err, user) {
                        if (err) {
                            return next(err);
                        }
                        if (!user) {
                            req.flash('errors', { msg: 'Password reset token is invalid or has expired.' });
                            return res.redirect('back');
                        }
                        user.password = req.body.password;
                        user.passwordResetToken = undefined;
                        user.passwordResetExpires = undefined;
                        user.save(function(err) {
                            if (err) {
                                return next(err);
                            }
                            req.logIn(user, function(err) {
                                done(err, user);
                            });
                        });
                    });
            },
            function(user, done) {
                var transporter = nodemailer.createTransport({
                    service: 'SendGrid',
                    auth: {
                        user: process.env.SENDGRID_USER,
                        pass: process.env.SENDGRID_PASSWORD
                    }
                });
                var mailOptions = {
                    to: user.email,
                    from: 'hackathon@starter.com',
                    subject: 'Your Hackathon Starter password has been changed',
                    text: 'Hello,\n\n' +
                    'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
                };
                transporter.sendMail(mailOptions, function(err) {
                    req.flash('success', { msg: 'Success! Your password has been changed.' });
                    done(err);
                });
            }
        ], function(err) {
            if (err) {
                return next(err);
            }
            res.redirect('/');
        });
    },

    /**
     * GET /forgot
     * Forgot Password page.
     */
    getForgot : function(req, res) {
        if (req.isAuthenticated()) {
            return res.redirect('/');
        }
        res.render('account/forgot', {
            title: 'Forgot Password'
        });
    },

    getPendingDoslation: function(req, res){
        "use strict";

        User
            .findOne({ email: req.user.email })
            .populate('doslationList')
            .exec(function (err, list) {
                if (err) {
                    req.flash('errors', { msg: 'Woops! Something wrong in DB.' });
                    return res.redirect('/dashboard');
                }

                var newList = [];
                list.doslationList.map(function (job) {
                    newList.push(job);
                });

                res.render('pending', {
                    title: 'My Pending Doslation',
                    subtitle: 'Pending Doslations List',
                    dosList: newList
                });
            });

    },

    /**
     * POST /forgot
     * Create a random token, then the send user an email with a reset link.
     */
    postForgot : function(req, res, next) {
        req.assert('email', 'Please enter a valid email address.').isEmail();

        var errors = req.validationErrors();

        if (errors) {
            req.flash('errors', errors);
            return res.redirect('/forgot');
        }

        async.waterfall([
            function(done) {
                crypto.randomBytes(16, function(err, buf) {
                    var token = buf.toString('hex');
                    done(err, token);
                });
            },
            function(token, done) {
                User.findOne({ email: req.body.email.toLowerCase() }, function(err, user) {
                    if (!user) {
                        req.flash('errors', { msg: 'No account with that email address exists.' });
                        return res.redirect('/forgot');
                    }
                    user.passwordResetToken = token;
                    user.passwordResetExpires = Date.now() + 3600000; // 1 hour
                    user.save(function(err) {
                        done(err, token, user);
                    });
                });
            },
            function(token, user, done) {
                var transporter = nodemailer.createTransport({
                    service: 'SendGrid',
                    auth: {
                        user: process.env.SENDGRID_USER,
                        pass: process.env.SENDGRID_PASSWORD
                    }
                });
                var mailOptions = {
                    to: user.email,
                    from: 'hackathon@starter.com',
                    subject: 'Reset your password on Hackathon Starter',
                    text: 'You are receiving this email because you (or someone else) have requested the reset of the password for your account.\n\n' +
                    'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                    'http://' + req.headers.host + '/reset/' + token + '\n\n' +
                    'If you did not request this, please ignore this email and your password will remain unchanged.\n'
                };
                transporter.sendMail(mailOptions, function(err) {
                    req.flash('info', { msg: 'An e-mail has been sent to ' + user.email + ' with further instructions.' });
                    done(err);
                });
            }
        ], function(err) {
            if (err) {
                return next(err);
            }
            res.redirect('/forgot');
        });
    }

};


module.exports = userController;
