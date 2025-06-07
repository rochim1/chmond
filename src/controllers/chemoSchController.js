const { validationResult } = require("express-validator");
const ChemoSchedule = require("../models/chemoSchModel");
const cronController = require("./cronController");
const moment = require('moment');
const momentz = require('moment-timezone');

// Create Chemo Schedule
const createChemoSchedule = async (req, res) => {
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
      tujuan_kemoterapi,
      tanggal_kemoterapi,
      waktu_kemoterapi,
      remember_before_minutes,
      id_user,
      note,
    } = req.body;

    if (!id_user) {
      id_user = req.user.id_user;
    }

    const newChemoSchedule = await ChemoSchedule.create({
      tujuan_kemoterapi,
      tanggal_kemoterapi,
      waktu_kemoterapi,
      remember_before_minutes,
      id_user,
      note,
    });

    const notifTime = momentz(`${tanggal_kemoterapi} ${waktu_kemoterapi}`, 'YYYY-MM-DD HH:mm')
      .subtract(remember_before_minutes, 'minutes')
      .startOf('minute');

    if (notifTime.isSameOrAfter(moment().startOf('minute'))) {
      await cronController.scheduleNotification(newChemoSchedule, 'chemotherapy');
    }

    return res.status(201).json({
      success: true,
      message: "ChemoSchedule created successfully",
      data: newChemoSchedule,
    });
  } catch (error) {
    console.error("Error creating ChemoSchedule:", error);
    return res.status(500).json({
      success: false,
      code: "INTERNAL_SERVER_ERROR",
      error: { message: error.message },
    });
  }
};

// Update Chemo Schedule
const updateChemoSchedule = async (req, res) => {
  try {
    const { id_chemoSchedule } = req.params;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        code: "BAD_REQUEST",
        error: errors.array(),
      });
    }

    let {
      tujuan_kemoterapi,
      tanggal_kemoterapi,
      waktu_kemoterapi,
      remember_before_minutes,
      id_user,
      note,
    } = req.body;

    const schedule = await ChemoSchedule.findOne({
      where: { id_chemoSchedule, status: "active" },
    });

    if (!schedule) {
      return res.status(404).json({
        success: false,
        code: "NOT_FOUND",
        error: { message: "ChemoSchedule not found" },
      });
    }

    if (schedule.is_sent) {
      return res.status(403).json({
        success: false,
        code: "FORBIDDEN",
        error: { message: "Cannot update. Notification already sent." },
      });
    }

    const timeChanged = (
      schedule.tanggal_kemoterapi !== tanggal_kemoterapi ||
      schedule.waktu_kemoterapi !== waktu_kemoterapi
    );

    if (timeChanged) {
      const notifTime = momentz(`${tanggal_kemoterapi} ${waktu_kemoterapi}`, 'YYYY-MM-DD HH:mm')
        .subtract(remember_before_minutes, 'minutes')
        .startOf('minute');

      if (notifTime.isBefore(moment())) {
        cronController.stopScheduledJob(schedule, 'chemotherapy');
      }
    }

    if (!id_user) {
      id_user = schedule.id_user || req.user.id_user;
    }

    await schedule.update({
      tujuan_kemoterapi,
      tanggal_kemoterapi,
      waktu_kemoterapi,
      remember_before_minutes,
      id_user,
      note,
    });

    // Update cron job
    cronController.updateNotificationSchedule(schedule, 'chemotherapy');

    return res.status(200).json({
      success: true,
      message: "ChemoSchedule updated successfully",
      data: schedule,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      code: "INTERNAL_SERVER_ERROR",
      error: { message: error.message },
    });
  }
};

// Delete Chemo Schedule
const deleteChemoSchedule = async (req, res) => {
  try {
    const { id_chemoSchedule } = req.params;

    const schedule = await ChemoSchedule.findOne({
      where: { id_chemoSchedule, status: "active" },
    });

    if (!schedule) {
      return res.status(404).json({
        success: false,
        code: "NOT_FOUND",
        error: { message: "ChemoSchedule not found" },
      });
    }

    await schedule.update({
      status: "deleted",
      deletedAt: new Date(),
    });

    cronController.stopScheduledJob(schedule, 'chemotherapy');

    return res.status(200).json({
      success: true,
      message: "ChemoSchedule deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      code: "INTERNAL_SERVER_ERROR",
      error: { message: error.message },
    });
  }
};

// Get One Chemo Schedule
const getOneChemoSchedule = async (req, res) => {
  try {
    const { id_chemoSchedule } = req.params;

    const schedule = await ChemoSchedule.findOne({
      where: { id_chemoSchedule, status: "active" },
    });

    if (!schedule) {
      return res.status(404).json({
        success: false,
        code: "NOT_FOUND",
        error: { message: "ChemoSchedule not found" },
      });
    }

    return res.status(200).json({
      success: true,
      data: schedule,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      code: "INTERNAL_SERVER_ERROR",
      error: { message: error.message },
    });
  }
};

// Get All Chemo Schedules
const getAllChemoSchedules = async (req, res) => {
  try {
    const { page = 1, pageSize = 10 } = req.body;
    const filter = req.body?.filter || {};
    const { status = "active", id_user } = filter;

    const whereClause = {
      status,
      ...(id_user && { id_user }),
    };

    const offset = (page - 1) * pageSize;
    const limit = parseInt(pageSize);

    const { count, rows } = await ChemoSchedule.findAndCountAll({
      where: whereClause,
      offset,
      limit,
    });

    return res.status(200).json({
      success: true,
      totalItems: count,
      totalPages: Math.ceil(count / pageSize),
      currentPage: parseInt(page),
      data: rows,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      code: "INTERNAL_SERVER_ERROR",
      error: { message: error.message },
    });
  }
};

module.exports = {
  createChemoSchedule,
  updateChemoSchedule,
  deleteChemoSchedule,
  getOneChemoSchedule,
  getAllChemoSchedules,
};
