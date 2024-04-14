const express = require('express');
const router = express.Router();
// Import passport for methods to be used in the login route.
const passport = require('passport');

// Import the User model to be used in the registration and login routes.
const User = require('../models/user');

// GET: /auth/registration => display registration form
router.get('/registration', (req, res) => {

    res.render('auth/registration', {
        title: 'Google OAuth | Registration',
        // Passing the user object to the view.
        user: req.user
    });

});

// POST: /auth/registration => process registration form submission
router.post('/registration', (req, res) => {

    User.register(new User({ username: req.body.username }), req.body.password, (err, newUser) => {
        
        if (err) {
            return res.render('auth/registration', {title: 'Google OAuth | Unauthorized' });
        }

        else {        
            req.login(newUser, (err) => {
                res.redirect('/');
            });        
        }
    });

});

// GET: /auth/login => display login form
router.get('/login', (req, res) => {

    // GET any error messages from the session and pass them to the view to populate the error message if one is present.
    let messages = req.session.messages || [];

    // Clear the session messages after the initial message is displayed to prevent confusion when navigating back to the login page.
    req.session.messages = [];

    res.render('auth/login', { 
        title: 'Google OAuth | Login',
        messages: messages,
        user: req.user
    });

});

// POST: /auth/login => process login form submission
router.post('/login', passport.authenticate('local', {

    successRedirect: '/',
    failureRedirect: '/auth/login',
    failureMessage: 'Invalid Login Credentials!'

}));

// GET: /auth/logout => process logout
router.get('/logout', (req, res) => {

    // Clear any messages in the session upon logout, so they won't appear when the user logs back in.
    req.session.messages = [];

    // Callback to log the user out and redirect them to the login page.
    req.logout((err) => {
       // Redirect to the home page.
       res.redirect('/');
    });
    
});

// Unauthorized Redirect
router.get('/unauthorized', (req, res) => {
    res.render('auth/unauthorized', {
        title: 'Google OAuth | Unauthorized',
        user: req.user
    });
});


// GET: /auth/google => initiate Google Sign-In authentication

// STEP 8A: Structure the route for Google Authentication, which will be used to initiate the Google Sign-In process.
router.get('/google',  passport.authenticate('google', { 
    // STEP 8B: Define the scope options, which will be used to retrieve the Google user's profile and email.
    scope: ['profile', 'email']
}));

// GET: /auth/google/callback => handle Google Sign-In callback

// STEP 9A: Structure the route for the Google Sign-In Callback. This route will be used to authenticate the user and log them into the application.
router.get('/google/callback', passport.authenticate('google', { 
    // STEP 9B: Define the success and failure redirect routes for the Google Sign-In Callback.
    successRedirect: '/',
    failureRedirect: '/auth/login'
}));


// STEP 10A: Test our application to see if we can now log in without issues!

// Exporting the auth router to be used in the app.js file.
module.exports = router;