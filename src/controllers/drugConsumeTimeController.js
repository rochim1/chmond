const { validationResult } = require('express-validator');
const { DrugSchedule, DrugConsumeTime } = require('../models/index');
const moment = require('moment');
const momentz = require('moment-timezone');
const { Op } = require('sequelize');
const cronController = require('./cronController');

// CREATE DrugConsumeTime
const createDrugConsumeTime = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      code: "BAD_REQUEST",
      error: errors.array(),
    });
  }

  try {
    let { id_drug_schedule, name, time, id_user, date } = req.body;
    id_user = id_user || req.user?.id_user;

    const drugSchedule = await DrugSchedule.findOne({
      where: { id_drug_schedule, status: "active" },
    });

    if (!drugSchedule) {
      return res.status(404).json({
        success: false,
        code: "NOT_FOUND",
        message: 'Drug schedule not found',
      });
    }

    name = name || drugSchedule.name;

    const newDrugConsumeTime = await DrugConsumeTime.create({
      id_drug_schedule,
      name,
      time,
      id_user,
      date,
    });

    const drugConsumeTimeMoment = momentz(`${date} ${time}`, 'YYYY-MM-DD HH:mm').startOf('minute');
    const currentTime = moment().startOf('minute');

    if (drugConsumeTimeMoment.isSameOrAfter(currentTime)) {
      cronController.scheduleNotification(newDrugConsumeTime, 'drug_consume_time');
    }

    return res.status(201).json({
      success: true,
      message: 'Drug consume time created successfully',
      data: newDrugConsumeTime,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      code: "INTERNAL_SERVER_ERROR",
      error: error.message,
    });
  }
};

// GET ALL
const getAllDrugConsumeTimes = async (req, res) => {
  try {
    const { page, pageSize } = req.body;
    const { id_user, id_drug_schedule, date, is_consumed, status, dateType } = req.body.filter || {};

    let whereClause = {
      ...(id_user && { id_user }),
      ...(id_drug_schedule && { id_drug_schedule }),
      ...(is_consumed !== undefined && { is_consumed }),
      ...(status && { status }),
    };

    if (date) {
      if (dateType === 'bulanan') {
        const startOfMonth = moment(date, 'YYYY-MM').startOf('month').format('YYYY-MM-DD');
        const endOfMonth = moment(date, 'YYYY-MM').endOf('month').format('YYYY-MM-DD');
        whereClause.date = { [Op.gte]: startOfMonth, [Op.lte]: endOfMonth };
      } else {
        whereClause.date = { [Op.eq]: moment(date).format('YYYY-MM-DD') };
      }
    }

    const offset = page && pageSize ? (parseInt(page) - 1) * parseInt(pageSize) : null;
    const limit = pageSize ? parseInt(pageSize) : null;

    const { count, rows } = await DrugConsumeTime.findAndCountAll({
      where: whereClause,
      offset: offset ?? undefined,
      limit: limit ?? undefined,
      include: [{
        model: DrugSchedule,
        as: 'drug_schedule',
        required: true,
      }],
      order: [['createdAt', 'DESC']],
    });

    return res.status(200).json({
      success: true,
      totalItems: count,
      totalPages: pageSize ? Math.ceil(count / pageSize) : 1,
      currentPage: page ? parseInt(page) : null,
      data: rows,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      code: 'INTERNAL_SERVER_ERROR',
      error: error.message,
    });
  }
};

// GET by ID
const GetOneDrugConsumeTime = async (req, res) => {
  try {
    const { id_drug_consume_time } = req.params;

    const drugConsumeTime = await DrugConsumeTime.findOne({
      where: { id_drug_consume_time, status: "active" },
      include: [{
        model: DrugSchedule,
        as: 'drug_schedule',
        required: true,
        where: { status: 'active' },
      }],
    });

    if (!drugConsumeTime) {
      return res.status(404).json({
        success: false,
        code: "NOT_FOUND",
        message: 'Drug consume time not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: drugConsumeTime,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      code: "INTERNAL_SERVER_ERROR",
      error: error.message,
    });
  }
};

// UPDATE
const updateDrugConsumeTime = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      code: "BAD_REQUEST",
      error: errors.array(),
    });
  }

  try {
    const { id_drug_consume_time } = req.params;
    const updatedData = req.body;

    let drugConsumeTime = await DrugConsumeTime.findOne({
      where: { id_drug_consume_time, status: "active" },
    });

    if (!drugConsumeTime) {
      return res.status(404).json({
        success: false,
        code: "NOT_FOUND",
        message: 'Drug consume time not found',
      });
    }

    await drugConsumeTime.update(updatedData);

    // Refresh after update
    drugConsumeTime = await DrugConsumeTime.findOne({
      where: { id_drug_consume_time, status: "active" },
    });

    const consumeTime = momentz(`${drugConsumeTime.date} ${drugConsumeTime.time}`, 'YYYY-MM-DD HH:mm').startOf('minute');
    const currentTime = moment().startOf('minute');

    if (consumeTime.isSameOrAfter(currentTime)) {
      cronController.scheduleNotification(drugConsumeTime, 'drug_consume_time');
    }

    return res.status(200).json({
      success: true,
      message: 'Drug consume time updated successfully',
      data: drugConsumeTime,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      code: "INTERNAL_SERVER_ERROR",
      error: error.message,
    });
  }
};

// DELETE (Soft delete)
const deleteDrugConsumeTime = async (req, res) => {
  try {
    const { id_drug_consume_time } = req.params;

    const drugConsumeTime = await DrugConsumeTime.findOne({
      where: { id_drug_consume_time, status: "active" },
    });

    if (!drugConsumeTime) {
      return res.status(404).json({
        success: false,
        code: "NOT_FOUND",
        message: 'Drug consume time not found',
      });
    }

    await drugConsumeTime.update({
      status: 'deleted',
      deletedAt: new Date(),
    });

    cronController.stopScheduledJob(id_drug_consume_time, 'drug_consume_time');

    return res.status(200).json({
      success: true,
      message: 'Drug consume time deleted successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      code: "INTERNAL_SERVER_ERROR",
      error: error.message,
    });
  }
};

module.exports = {
  createDrugConsumeTime,
  getAllDrugConsumeTimes,
  GetOneDrugConsumeTime,
  updateDrugConsumeTime,
  deleteDrugConsumeTime,
};
