const { validationResult } = require("express-validator");
const {
  Educations, Recomendation, DrugSchedule, User,
  NotificationSent, DrugConsumeTime
} = require("../models");
const ChemoSchedule = require("../models/chemoSchModel");
const { Op } = require("sequelize");
const fs = require("fs");
const path = require("path");
const admin = require("firebase-admin");
const firebaseConfig = require("../services/messaging.service");

// ========== PUSH NOTIFICATION FUNCTION ==========
const pushNotification = async ({
  fcm_token = null,
  title = "",
  body = "",
  multi_fcm_token = [],
  attribute = {},
  data = {}
}) => {
  try {
    // Initialize Firebase App only once
    if (!admin.apps.length) {
      await firebaseConfig.initializeAppFirebase(admin);
      console.log("Initialized Firebase App");
    }

    const notification = {
      notification: { title, body },
      webpush: { fcmOptions: attribute },
      android: {
        notification: {
          sound: "custom_midi_sound"
        }
      },
      apns: {
        payload: {
          aps: { sound: "custom_midi_sound.mid" }
        }
      },
      data
    };

    if (fcm_token) {
      const message = { ...notification, token: fcm_token };
      const response = await admin.messaging().send(message);
      return { success: true, response };
    }

    if (Array.isArray(multi_fcm_token) && multi_fcm_token.length > 0) {
      const multicastMessage = { ...notification, tokens: multi_fcm_token };
      const response = await admin.messaging().sendMulticast(multicastMessage);
      return { success: true, response };
    }

    return {
      success: false,
      response: "No fcm_token or multi_fcm_token provided."
    };

  } catch (err) {
    console.error("Error sending FCM message:", err);
    return {
      success: false,
      response: err.message
    };
  }
};

// ========== STORE FCM TOKEN ==========
const storeFCMtoken = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        code: "BAD_REQUEST",
        error: errors.array()
      });
    }

    let { id_user, fcm_token } = req.body;
    id_user = id_user || req.user?.id_user;

    if (!id_user) {
      return res.status(400).json({
        success: false,
        code: "MISSING_USER_ID",
        error: { message: "id_user is required" }
      });
    }

    const user = await User.findOne({
      where: { id_user, status: "active" }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        code: "NOT_FOUND",
        error: { message: "User not found" }
      });
    }

    await user.update({ fcm_token });

    return res.status(200).json({
      success: true,
      message: "FCM token stored successfully",
      data: user
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      code: "INTERNAL_SERVER_ERROR",
      error: { message: error.message }
    });
  }
};

// ========== GET ALL NOTIFICATIONS ==========
const getAllNotifications = async (req, res) => {
  try {
    const {
      page = 1,
      pageSize = 10,
      filter = {}
    } = req.body;

    const {
      id_user,
      status = "active",
      tipe
    } = filter;

    const whereClause = {
      status,
      ...(id_user && { receiver: id_user }),
      ...(tipe && { tipe })
    };

    const offset = (page - 1) * pageSize;
    const limit = parseInt(pageSize, 10);

    const { count, rows } = await NotificationSent.findAndCountAll({
      where: whereClause,
      offset,
      limit
    });

    return res.status(200).json({
      success: true,
      totalItems: count,
      totalPages: Math.ceil(count / pageSize),
      currentPage: parseInt(page, 10),
      data: rows
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      code: "INTERNAL_SERVER_ERROR",
      error: { message: error.message }
    });
  }
};

// ========== GET ONE NOTIFICATION ==========
const getOneNotification = async (req, res) => {
  try {
    const { id_notification_sent } = req.params;

    const notificationData = await NotificationSent.findOne({
      where: {
        id_notification_sent,
        status: "active"
      },
      include: [
        {
          model: ChemoSchedule,
          as: "chemo_schedule",
          required: false
        },
        {
          model: DrugConsumeTime,
          as: "drug_consume_time",
          required: false,
          include: [
            {
              model: DrugSchedule,
              as: "drug_schedule",
              required: false
            }
          ]
        }
      ]
    });

    if (!notificationData) {
      return res.status(404).json({
        success: false,
        code: "NOT_FOUND",
        error: { message: "Notification not found" }
      });
    }

    return res.status(200).json({
      success: true,
      data: notificationData
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      code: "INTERNAL_SERVER_ERROR",
      error: { message: error.message }
    });
  }
};

// ========== EXPORT ==========
module.exports = {
  storeFCMtoken,
  pushNotification,
  getAllNotifications,
  getOneNotification
};
