let mongoose = require('mongoose');
let passportLocalMongoose = require('passport-local-mongoose');

// Defining the user scehma for local users.
let user = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    // Password is required in the form, client-side.
    password: {
        type: String,
        minLength: 8
    }
});

// Allow the user model to use the methods and functionality fo the local Mongoose package.
user.plugin(passportLocalMongoose);

// Export the user model to be used in the applications authentication files.
module.exports = mongoose.model('User', user);