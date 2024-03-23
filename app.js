let createError = require('http-errors');
let express = require('express');
let path = require('path');
let cookieParser = require('cookie-parser');
let logger = require('morgan');

// Controller Imports
let index = require('./controllers/index');
let users = require('./controllers/users');
let auth = require('./controllers/auth');

// Custom/External Imports
let mongoose = require('mongoose');
let dotenv = require('dotenv');

// STEP 2A: Enable Passport & Session Support, and import the passport and express-session modules.
let passport = require('passport');
let session = require('express-session');


// STEP 2B: Import the Local User Model & Google User Models. We will be focusing on Google User, and to implement Google Authentication, we will pass this model into a Google Strategy for Passport to use when authenticating users.
let User = require('./models/user');
const GoogleUser = require('./models/googleUser');

// Load environment variables from the .env file.
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

else {
  require('dotenv').config();
}

// MongoDB Connection
mongoose.connect(process.env.CONNECTION_STRING)
  .then((res) => { console.log('MongoDB Connection Successful') })
  .catch(() => { console.log('MongoDB Connection Failed.') });

let app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


// STEP 2C: Configuring Express Session Support, we will allow users to remain logged in when navigating between pages.
// STEP 2D: Initialize Passport Session Support.
app.use(session({
  secret: process.env.PASSPORT_SECRET,
  resave: true,
  saveUninitialized: false
}));

// STEP 2E: Allow the application to use Passport for authentication. We must define to use session support before defining routes to ensure the session is available first to prevent errors.
app.use(passport.initialize());
app.use(passport.session());

// Configuring the Passport Authentication Strategies for local and google user's of the application. To learn more about the Google Strategy, visit the Passport Google OAuth20 documentation here: https://www.passportjs.org/packages/passport-google-oauth2/

// STEP 3A: Allow the user to authenticate using the local strategy.
passport.use(User.createStrategy());

// STEP 3B: Define the Google Strategy, by importing the Google Strategy from the passport-google-oauth20 module.
const GoogleStrategy = require('passport-google-oauth20').Strategy;



// STEP 3C: Configure the Google Strategy for Passport to use when authenticating users. Creating the initial skeleton of the Strategy, to then populate with the options required to authenticate users. (Client ID, Client Secret, Callback URL, and the function to be executed when a user is authenticated).
passport.use(new GoogleStrategy({

  // STEP 3D: Define the Google Strategy options. Including the Client ID, Client Secret, and Callback URL.
  // STEP 3E: Assigning values to the options, we will set the ClientID and Secret from the environement variables for security purposes. And then define the Callback URL for the Google authentication routing.
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "http://localhost:3000/auth/google/callback",
  passReqToCallback: true
  // STEP 3F: Define the skeleton code for the function to be executed when a user is authenticated. Passing the request, access token, refresh token, profile, and done callback to the function.
}, async (request, accessToken, refreshToken, profile, done) => {
  // STEP 4A: Structure a try/catch block, so we can add authentication logic to the Google Strategy. 
  try {
    // STEP 4B: Declare a variable to store the Google User, and we will search for any existing user's in our googleUser model database documents by their Google ID.
    let googleUser = await GoogleUser.findOne({ googleId: profile.id });
    // STEP 4C: Write a conditional statement to check if a googleUser is present in the database, if not, create a new Google User and store their Google ID and Display Name.
    if (!googleUser) {
      googleUser = await GoogleUser.create({
        googleId: profile.id,
        displayName: profile.displayName
      });
    }
    // STEP 4D: IF a user exists, return the Google User to the done callback, as a user now exists in the database, which we can now use when serializing and deserializing users into a session.
    done(null, googleUser);
  } catch (error) {
    // STEP 4E: IF an error occurs, we can return the error to the done callback. We do this to handle the error while preventing the application from crashing.
    done(error);
  }
}));


// STEP 5A: We must now serialize the user into a session by storing their ID in the session. IF we don't serialize the user, we will get an error that we couldn't serialize the user into the session, meaning we can't store the user in the session.
// STEP 5B: Pass the user object and the done callback to the serializeUser method.
passport.serializeUser((user, done) => {
  // STEP 5C: Call the done callback and store the user's ID in the session.
  done(null, user.id);
});

// STEP 6A: Creating the skeleton code for the deserializeUser method, which will be used to retrieve the user from the session.
// STEP 6B: Pass the ID and done callback to the deserializeUser method. We will write this code asynchronously as we are querying a database, which may take some time to complete.
passport.deserializeUser(async (id, done) => {
  // STEP 6C: Structure a try/catch block to handle the deserialization of the user.
  try {
      // STEP 6D: Search for any existing user's in our local user model database documents by their ID.
      let user = await User.findById(id);
      // STEP 6E: Check IF a user is present in the database, is so we will return it.
      if (user) {
          done(null, user);
      } 
      // STEP 6F: IF no local user is found, we will search for a Google user by their ID in the Google User model and return the Google user. IF a google user is not found, we will return null.
      else {
          let googleUser = await GoogleUser.findById(id);
          done(null, googleUser || null);
      }
  } 
  // STEP 6G: In our catch statement, we will return any errors that occur.
  catch (error) {
      done(error, null);
  }
});

// STEP 7: Let's test our application to see if we can register as a Google user. We will encounter an error, does anyone have any ideas why we can't register as a Google user?

// Defining the routes for the application.
app.use('/', index);
app.use('/users', users);
app.use('/auth', auth);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
