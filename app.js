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


let passport = require('passport');
let session = require('express-session');


let User = require('./models/user');
// STEP 2A: Import the Google User Model. We must import the model as we will be referencing the user data in our Passport Google Authentication Strategy.
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

app.use(session({
  secret: process.env.PASSPORT_SECRET,
  resave: true,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(User.createStrategy());

// Configuring the Passport Authentication Strategy for google user's of the application. To learn more about the Google Strategy, visit the Passport Google OAuth20 documentation here: https://www.passportjs.org/packages/passport-google-oauth2/

// STEP 3A: Define the Google Strategy, by importing the Google Strategy from the passport-google-oauth20 module.
const GoogleStrategy = require('passport-google-oauth20').Strategy;


// STEP 3B: We now want to let Passport know that we must use the Google Strategy when authenticating users.
passport.use(new GoogleStrategy({

  // STEP 3C and 3D: And now we need to define the options for our strategy. Including the Client ID, Client Secret, and Callback URL. And then assigning values to the options. We will set the ClientID and Secret from the environment variables for security purposes. And then define the Callback URL for the Google authentication routing.
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "http://localhost:3000/auth/google/callback",
  passReqToCallback: true
  // STEP 3E: Write an asynchronous function that will execute when a user is attempting to authenticate. We will pass the request, access token, refresh token, profile, and done callback arguments to the function.
}, async (request, accessToken, refreshToken, profile, done) => {
  // STEP 4A: Structure a try/catch block, so we can add authentication logic, which will prevent the application from crashing if errors occur.
  try {
    // STEP 4B: Declare a variable to store the Google User, and we will search for any existing users in our database filtering by their Google ID.
    let googleUser = await GoogleUser.findOne({ googleId: profile.id });
    // STEP 4C: Now we must write a conditional statement to check IF a googleUser exists in the database. If there is no user, we will create a new Google User and store their Google ID and Display Name.
    if (!googleUser) {
      googleUser = await GoogleUser.create({
        googleId: profile.id,
        displayName: profile.displayName
      });
    }
    // STEP 4D: IF a user exists, we will return the Google User to the done callback, as a user now exists in the database.
    done(null, googleUser);
  } 
  catch (error) {
    // STEP 4E: IF an error occurs, we can return the error to the done callback. We would like to handle any errors to prevent the application from crashing.
    done(error);
  }
}));


// STEP 5A: Serialize the user into a session by storing their ID in the session.

// STEP 5B: Pass the user object and the done callback to the serializeUser method.
passport.serializeUser((user, done) => {
  // STEP 5C: Call the done callback to store the user's ID in the session.
  done(null, user.id);
});

// STEP 6A: Create a method to deserialize the user, which will be used to retrieve the user from the session.

// STEP 6B: Pass the ID and done callback to the deserializeUser method.
passport.deserializeUser(async (id, done) => {

  // STEP 6C: Structure a try-and-catch block to handle the deserializing users.
  try {

      // STEP 6D: Search for any existing user's in our local user database, by searching for their ID.
      let user = await User.findById(id);
    
      // STEP 6E: Check IF a user is present in the database, if there is a user, we will return it.
      if (user) {
          done(null, user);
      }
    
      // STEP 6F: And IF no local user is found, we will search for a Google user by their ID, referencing the googleUser model. If a Google user is not found, we will return null.
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

// STEP 7: Let's test our application to see if we can register as a Google user. We will encounter an error? Does anyone have any ideas of what could be preventing us from registering as a Google User?

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
