// STEP 1A: Importing mongoose to allow for the creation of a model schema.
const mongoose = require('mongoose');

// STEP 1B: Declaring our Mongoose Schema for the Google User. This model will be used to capture the Google ID and display name, these are important to allow us to store unique Google users in the database, while also displaying their name in the navigation bar when they are logged in.
const googleUser = new mongoose.Schema({

    // STEP 1C: Define the properties of the Google User Schema. In our model, we will store the GoogleId and the displayName of the user.
    googleId: {
        type: String,
        required: true
    },
    displayName: {
        type: String,
        required: true
    }
});

// STEP 1D: Export the Google User model for usage throughout the application.
module.exports = mongoose.model('GoogleUser', googleUser);