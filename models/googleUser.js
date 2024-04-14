// STEP 1A:	We will import Mongoose at the top of our file to allow the creation of a new schema.
const mongoose = require('mongoose');

// STEP 1B: Declaring our Mongoose Schema for the Google User.
const googleUser = new mongoose.Schema({

    // STEP 1C: We will now define the properties of the Google User Schema. In our model, we will store the GoogleId and the displayName of our users.
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