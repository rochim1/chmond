const {
  validationResult
} = require('express-validator');
const DrugSchedule = require('../models/drugSchModel');

// Create DrugSchedule
const createDrugSchedule = async (req, res) => {
  const errors = validationResult(req);

  // If validation fails, return the errors
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      code: "BAD_REQUEST",
      error: errors.array(),
    });
  }

  const {
    drug_name,
    dose,
    drug_unit,
    periode,
    choosen_days,
    consume_per_day,
    consume_regulation,
    first_date_consume,
    long_consume,
    activate_notive,
    note,
    // status
  } = req.body;

  try {
    const newDrugSchedule = await DrugSchedule.create({
      drug_name,
      dose,
      drug_unit,
      periode,
      choosen_days,
      consume_per_day,
      consume_regulation,
      first_date_consume,
      long_consume,
      activate_notive,
      note,
      // status
    });

    return res.status(201).json({
      success: true,
      message: 'Drug schedule created successfully',
      data: newDrugSchedule
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      code: "INTERNAL_SERVER_ERROR",
      error: error.message,
    });
  }
};

// Update DrugSchedule
const updateDrugSchedule = async (req, res) => {
  const errors = validationResult(req);

  // If validation fails, return the errors
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      code: "BAD_REQUEST",
      error: errors.array(),
    });
  }

  const {
    id
  } = req.params;
  const {
    drug_name,
    dose,
    drug_unit,
    periode,
    choosen_days,
    consume_per_day,
    consume_regulation,
    first_date_consume,
    long_consume,
    activate_notive,
    note,
    // status
  } = req.body;

  try {
    const drugSchedule = await DrugSchedule.findByPk(id);

    if (!drugSchedule) {
      return res.status(404).json({
        success: false,
        code: "NOT_FOUND",
        message: 'Drug schedule not found'
      });
    }

    await drugSchedule.update({
      drug_name,
      dose,
      drug_unit,
      periode,
      choosen_days,
      consume_per_day,
      consume_regulation,
      first_date_consume,
      long_consume,
      activate_notive,
      note,
      // status
    });

    return res.status(200).json({
      success: true,
      message: 'Drug schedule updated successfully',
      data: drugSchedule
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      code: "INTERNAL_SERVER_ERROR",
      error: error.message,
    });
  }
};


// Get all DrugSchedules
const getAllDrugSchedules = async (req, res) => {
  try {
    const drugSchedules = await DrugSchedule.findAll();

    return res.status(200).json({
      success: true,
      message: 'Drug schedules retrieved successfully',
      data: drugSchedules
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      code: "INTERNAL_SERVER_ERROR",
      error: error.message,
    });
  }
};

// Get a specific DrugSchedule by ID
const getOneDrugSchdules = async (req, res) => {
  const {
    id
  } = req.params;

  try {
    const drugSchedule = await DrugSchedule.findByPk(id);

    if (!drugSchedule) {
      return res.status(404).json({
        success: false,
        code: "NOT_FOUND",
        message: 'Drug schedule not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Drug schedule retrieved successfully',
      data: drugSchedule
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      code: "INTERNAL_SERVER_ERROR",
      error: error.message,
    });
  }
};

// Soft-delete a DrugSchedule by ID (update the status to 'deleted')
const deleteDrugSchedule = async (req, res) => {
  const {
    id
  } = req.params;

  try {
    const drugSchedule = await DrugSchedule.findByPk(id);

    if (!drugSchedule) {
      return res.status(404).json({
        success: false,
        code: "NOT_FOUND",
        message: 'Drug schedule not found',
      });
    }

    // Soft-delete by updating the status and adding a timestamp to deletedAt
    await drugSchedule.update({
      status: 'deleted',
      deletedAt: new Date(),
    });

    return res.status(200).json({
      success: true,
      message: 'Drug schedule deleted successfully',
      data: drugSchedule
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
  createDrugSchedule,
  updateDrugSchedule,
  getAllDrugSchedules,
  getOneDrugSchdules,
  deleteDrugSchedule,
}