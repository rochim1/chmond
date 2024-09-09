const {
  validationResult
} = require('express-validator');
const {
  DrugSchedule,
  DrugConsumeTime
} = require('../models/index');
const moment = require('moment');
const {
  Op
} = require('sequelize'); // Import Sequelize operators
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
    const { id_drug_schedule, name, time, id_user, date, is_consumed, status } = req.body;
    
    const newDrugConsumeTime = await DrugConsumeTime.create({
      id_drug_schedule,
      name,
      time,
      id_user,
      date,
      is_consumed,
      status
    });

    return res.status(201).json({
      success: true,
      message: 'Drug consume time created successfully',
      data: newDrugConsumeTime
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      code: "INTERNAL_SERVER_ERROR",
      error: error.message,
    });
  }
};

// GET All DrugConsumeTimes (with optional filters)
const getAllDrugConsumeTimes = async (req, res) => {
  try {
    const { page = 1, pageSize = 10 } = req.query;
    const { id_user, id_drug_schedule, date, is_consumed, status } = req.body.filter || {};

    const whereClause = {
      ...(id_user && { id_user }),
      ...(id_drug_schedule && { id_drug_schedule }),
      ...(date && { date }),
      ...(is_consumed !== undefined && { is_consumed }),
      ...(status && { status })
    };

    const offset = (page - 1) * pageSize;
    const limit = parseInt(pageSize);

    const { count, rows } = await DrugConsumeTime.findAndCountAll({
      where: whereClause,
      offset,
      limit,
      include: [
        {
          model: DrugSchedule,
          as: 'drug_schedule',  // Optional alias
          required: true,      // Inner join, set to false for outer join
        },
      ],
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
      error: error.message,
    });
  }
};

// GET DrugConsumeTime by ID
const getDrugConsumeTimeById = async (req, res) => {
  try {
    const { id } = req.params;
    const drugConsumeTime = await DrugConsumeTime.findByPk(id);

    if (!drugConsumeTime) {
      return res.status(404).json({
        success: false,
        code: "NOT_FOUND",
        message: 'Drug consume time not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: drugConsumeTime
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      code: "INTERNAL_SERVER_ERROR",
      error: error.message,
    });
  }
};

// UPDATE DrugConsumeTime by ID
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
    const { id } = req.params;
    const updatedData = req.body;

    const drugConsumeTime = await DrugConsumeTime.findByPk(id);
    if (!drugConsumeTime) {
      return res.status(404).json({
        success: false,
        code: "NOT_FOUND",
        message: 'Drug consume time not found'
      });
    }

    await drugConsumeTime.update(updatedData);

    return res.status(200).json({
      success: true,
      message: 'Drug consume time updated successfully',
      data: drugConsumeTime
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      code: "INTERNAL_SERVER_ERROR",
      error: error.message,
    });
  }
};

// DELETE DrugConsumeTime by ID (Soft delete)
const deleteDrugConsumeTime = async (req, res) => {
  try {
    const { id } = req.params;
    const drugConsumeTime = await DrugConsumeTime.findByPk(id);

    if (!drugConsumeTime) {
      return res.status(404).json({
        success: false,
        code: "NOT_FOUND",
        message: 'Drug consume time not found'
      });
    }

    await drugConsumeTime.update({ status: 'deleted', deletedAt: new Date() });

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
  getDrugConsumeTimeById,
  updateDrugConsumeTime,
  deleteDrugConsumeTime,
};