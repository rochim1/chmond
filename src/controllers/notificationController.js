const {
    validationResult
} = require("express-validator");
const {
    Educations,
    Recomendation
} = require("../models");
const fs = require("fs");
const path = require("path");
const {
    Op
} = require("sequelize");
const User = require("../models/userModel");
const firebaseConfig = '../services/messaging.service.js'
// Create Education
const storeFCMtoken = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                code: "BAD_REQUEST",
                error: errors.array(),
            });
        }

        let {
            id_user,
            fcm_token
        } = req.body;

        if (!id_user) {
            id_user = req.user.id_user;
        }

        // Find the user by ID
        const user = await User.findOne({
            where: {
                id_user,
                status: "active",
            },
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                code: "NOT_FOUND",
                error: {
                    message: "User not found",
                },
            });
        }

        await user.update({
            fcm_token
        });

        // Respond with updated user details
        res.status(200).json({
            success: true,
            message: "FCM token stored successfully",
            data: user,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            code: "INTERNAL_SERVER_ERROR",
            error: {
                message: error.message,
            },
        });
    }
};

const pushNotification = async ({ fcm_token = null, title = "", body = "", multi_fcm_token = [], attribute }) => {
    try {
      // Initialize Firebase app
      await firebaseConfig.initializeAppFirebase(admin);
  
      const notification = {
        notification: {
          title,
          body,
        },
        webpush: {
          fcmOptions: attribute,
        },
      };
  
      if (fcm_token) {
        // Send notification to a single device token
        const message = {
          ...notification,
          token: fcm_token,
        };
  
        const response = await admin.messaging().send(message);
        return {
          success: true,
          response,
        };
      }
  
      if (multi_fcm_token && multi_fcm_token.length > 0) {
        // Send notification to multiple device tokens
        const multicastMessage = {
          ...notification,
          tokens: multi_fcm_token,
        };
  
        const response = await admin.messaging().sendMulticast(multicastMessage);
        return {
          success: true,
          response,
        };
      }
  
      return {
        success: false,
        response: "No fcm_token or multi_fcm_token provided.",
      };
    } catch (err) {
      return {
        success: false,
        response: err.message,
      };
    }
  };
  

module.exports = {
    storeFCMtoken,
    pushNotification
};