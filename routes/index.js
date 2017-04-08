/**
 * Controllers (route handlers).
 */
var homeController = require('./home');
var userController = require('./user');
var isAuthenticate = require('../auth/isAuthenticate');
var passport = require('passport');


module.exports = function(app, passport, logger) {
    "use strict";
    app.use(function (req, res, next) {
        if (/(dashboard)|(^\/$)/i.test(req.path)) {
            req.session.returnTo = req.path;
        }
        next();
    });

    /**
     * Primary app routes.
     */
    app.get('/', homeController.index);
    app.get('/doslation', userController.getDoslation);
    app.get('/signin', userController.getLogin);
    app.post('/signin', userController.postLogin);
    app.get('/signout', userController.logout);
    app.get('/forgot', userController.getForgot);
    app.post('/forgot', userController.postForgot);
    app.get('/reset/:token', userController.getReset);
    app.post('/reset/:token', userController.postReset);
    app.get('/signup', userController.getSignup);
    app.post('/signup', userController.postSignup);
    app.get('/dashboard', isAuthenticate, userController.getDashboard);
    app.get('/account', isAuthenticate, userController.getAccount);
    app.post('/account/profile', isAuthenticate, userController.postUpdateProfile);
    app.post('/account/password', isAuthenticate, userController.postUpdatePassword);
    app.post('/account/delete', isAuthenticate, userController.postDeleteAccount);

    //app.get('/api/upload', apiController.getFileUpload);
    //app.post('/api/upload', upload.single('myFile'), apiController.postFileUpload);

    // Set 404 response for non-exist api routes
    app.use(function(req, res, next) {
        var err = new Error('Routes Request URL Not Found');
        err.status = 404;
        logger.warn('[SERVER] 404 NOT FOUND: Received request ('+ req.pathname +') can not be found');
        next(err);
    });
};