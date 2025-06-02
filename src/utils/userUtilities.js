const {
  User
} = require('../models/userModel'); // Adjust the path to your models if needed
const passport = require('passport');
const {
  OAuth2Strategy
} = require('passport-google-oauth');
const crypto = require("crypto");

const loginWithGoogle = passport.use(new OAuth2Strategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/auth/google/callback',
},
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user exists in the database by email
      let user = await User.findOne({
        where: { email: profile.emails[0].value }
      });

      // If the user does not exist, create a new user
      if (!user) {
        user = await User.create({
          email: profile.emails[0].value,
          username: profile.displayName,
          name: profile.displayName,
          // Add any additional fields if necessary, such as `googleId` or `avatar`
        });

        return done(null, user); // Successfully created a new user, pass user to done callback
      } else if (user.status === 'active') {
        // User exists and is active
        return done(null, user); // Successfully found an active user, pass user to done callback
      } else {
        // User exists but is inactive/deleted
        return done(null, false, { message: 'This email is associated with an inactive or deleted user.' });
      }
    } catch (error) {
      // Catch and handle any errors during the authentication process
      return done(error, null);
    }
  }
));

// Encryption function using salt as the key
function encrypt(text, salt) {
  try {
    const algorithm = "aes-256-cbc";
    const key = crypto.createHash("sha256").update(salt).digest();
    const iv = Buffer.alloc(16, 0);

    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");

    return encrypted;
  } catch (error) {
    console.error('Encrypt failed:', error.message);
    return null; // atau lempar error lagi sesuai kebutuhan
  }
}


// Decryption function with string salt as the key
function decrypt(encryptedText, salt) {
  try {
    const algorithm = "aes-256-cbc";
    const key = crypto.createHash("sha256").update(salt).digest();
    const iv = Buffer.alloc(16, 0);

    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encryptedText, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch (error) {
    console.error('Decrypt failed:', error.message);
    return null;  // atau throw error jika mau stop proses
  }
}

function isEncrypted(password) {
  // Misalnya password terenkripsi menggunakan AES, panjangnya lebih dari 64 karakter.
  // HEX format (setidaknya lebih panjang dari 64 karakter)
  if (/^[a-f0-9]{32,}$/i.test(password)) {
    return true;
  }
  
  // Base64 format (karena banyak enkripsi menggunakan base64 encoding)
  if (/^[A-Za-z0-9+/=]+$/.test(password)) {
    return true;
  }

  return false;
}


module.exports = {
  loginWithGoogle,
  encrypt,
  decrypt,
  isEncrypted
}