const passport = require('passport');
// Provide access to the User model to perform authentication checks.
const User = require('./models/user');

// Verification function to check if the user is authenticated.
let isAuthenticated = (req, res, next) => {
    // IF the user is not authenticated, redirect tothe  login page.
    if (!req.isAuthenticated()) {
        res.redirect('/auth/login');
        return false;
    }
    // ELSE, the user is authenticated and can proceed to the next route.
    return next();
};

// Exporting the authCheck function to be used in the routes.
module.exports = isAuthenticated;