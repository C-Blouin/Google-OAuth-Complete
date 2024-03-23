var express = require('express');
var router = express.Router();

// Import Authentication Check, to ensure users are logged in before accessing certain routes.
let authCheck = require('../authCheck');

// GET home page.
router.get('/', (req, res, next) => {
  res.render('index', { 
    title: 'Google OAuth | Home',
    // Passing the user object to the view.
    user: req.user
  });
});

// GET /authenticated. This is an authenticated route, passing the authCheck middleware to ensure users are logged in before accessing the route.
router.get('/authenticated', authCheck, (req, res) => {
  res.render('authenticated', {
    title: 'Google OAuth | Authenticated',
    user: req.user
  });
});

module.exports = router;