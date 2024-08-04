const { User } = require('../models/userModel'); // Adjust the path to your models if needed
const passport = require('passport');
const { OAuth2Strategy } = require('passport-google-oauth');


const loginWithGoogle = passport.use(new OAuth2Strategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/auth/google/callback',
  },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user exists in the database
        let user = await User.findOne({ where: { email: profile.emails[0].value } });
        
        if (!user) {
          // Create a new user if not found
          user = await User.create({
            email: profile.emails[0].value,
            username: profile.displayName,
            name: profile.displayName,
            // Add any other fields if necessary
          });
        } else if (user && user.status == 'active') {
            // redirect to login function
        } else {
            // user is not active 
            // flow reactive user
        }
  
        done(null, user);
      } catch (error) {
        done(error, null);
      }
    }
  ));

  module.exports = {
    loginWithGoogle
  }