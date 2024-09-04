const { validationResult } = require("express-validator");
const MonitoringLabModel = require("../models/monitoringLabModel");

const createMonitorLab = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        code: "BAD_REQUEST",
        error: errors.array(),
      });
    }

    const {
      id_user,
      date_lab,
      body_weight,
      body_height,
      hemoglobin,
      leucocytes,
      platelets,
      neutrophyle,
      sgot,
      sgpt,
      bun,
      creatinine,
      glucose,
      amylase,
      Lipase,
      note,
    } = req.body;

    if (!id_user) {
      id_user = req.user.id_user;
    }

    // todo, mybe in the future can add automatically cycle_to value
    const newMonitoringLab = await MonitoringLabModel.create({
      id_user,
      date_lab,
      body_weight,
      body_height,
      hemoglobin,
      leucocytes,
      platelets,
      neutrophyle,
      sgot,
      sgpt,
      bun,
      creatinine,
      glucose,
      amylase,
      Lipase,
      note,
    });

    return res.status(201).json({
      success: true,
      message: "monitoring lab created successfully",
      data: newMonitoringLab,
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

const updateMonitorLab = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        code: "BAD_REQUEST",
        error: errors.array(),
      });
    }

    const { id_monitoring_lab } = req.params;
    const {
      id_user,
      date_lab,
      body_weight,
      body_height,
      hemoglobin,
      leucocytes,
      platelets,
      neutrophyle,
      sgot,
      sgpt,
      bun,
      creatinine,
      glucose,
      amylase,
      Lipase,
      note,
    } = req.body;

    if (!id_user) {
      id_user = req.user.id_user;
    }

    let monitoringLab = await MonitoringLabModel.findOne({
      where: {
        id_monitoring_lab,
        status: "active",
      },
    });

    if (!monitoringLab) {
      return res.status(404).json({
        success: false,
        code: "NOT_FOUND",
        error: {
          message: "monitoring lab not found",
        },
      });
    }

    monitoringLab = await monitoringLab.update({
      id_user,
      date_lab,
      body_weight,
      body_height,
      hemoglobin,
      leucocytes,
      platelets,
      neutrophyle,
      sgot,
      sgpt,
      bun,
      creatinine,
      glucose,
      amylase,
      Lipase,
      note,
    });

    return res.status(200).json({
      success: true,
      message: "monitoring lab updated successfully",
      data: monitoringLab,
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

const deleteMonitorLab = async (req, res) => {
  try {
    const { id_monitoring_lab } = req.params;

    // get user side effect first
    const MonitorLab = await MonitoringLabModel.findOne({
      where: {
        id_monitoring_lab,
        status: "active",
      },
    });

    if (!MonitorLab) {
      return res.status(404).json({
        success: false,
        code: "NOT_FOUND",
        error: {
          message: "monitor lab not found",
        },
      });
    }

    await MonitorLab.update({
      status: "deleted",
    });

    return res.status(200).json({
      success: true,
      message: "monitor lab deleted successfully",
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

const getOneMonitorLab = async (req, res) => {
  try {
    const { id_monitoring_lab } = req.params;

    const monitorLab = await MonitoringLabModel.findOne({
      where: {
        id_monitoring_lab,
        status: "active",
      },
    });

    if (!monitorLab) {
      return res.status(404).json({
        success: false,
        code: "NOT_FOUND",
        error: {
          message: "monitoring lab not found",
        },
      });
    }

    return res.status(200).json({
      success: true,
      data: monitorLab,
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

const getAllMonitoringLab = async (req, res) => {
  try {
    const { page = 1, pageSize = 10 } = req.body;
    const { status, id_user } =
      req.body && req.body.filter
        ? req.body.filter
        : {
            status: "active",
          };

    let whereClause = {
      status,
      ...(id_user && { id_user }), // Add id_user to the filter if it exists
    };

    const offset = (page - 1) * pageSize;
    const limit = parseInt(pageSize);

    const { count, rows } = await MonitoringLabModel.findAndCountAll({
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
      error: {
        message: error.message,
      },
    });
  }
};

module.exports = {
  getOneMonitorLab,
  getAllMonitoringLab,
  createMonitorLab,
  updateMonitorLab,
  deleteMonitorLab,
};
