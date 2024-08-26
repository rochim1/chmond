const { validationResult } = require("express-validator");
const UserSideEffects = require("../models/userSideEffectsModel");
const Recomendation = require("../models/recomendationModel");

const createUserSideEffect = async (req, res) => {
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
      id_side_effect,
      id_user,
      date_feel,
      time_feel,
      cycle_to,
      severity,
      frekuensi,
      distress,
      note,
      status,
    } = req.body;

    if (!id_user) {
      id_user = req.user.id_user;
    }

    // todo, mybe in the future can add automatically cycle_to value
    const newUserSideEffect = await UserSideEffects.create({
      id_side_effect,
      id_user,
      date_feel,
      time_feel,
      cycle_to,
      severity,
      frekuensi,
      distress,
      note,
      status,
    });

    return res.status(201).json({
      success: true,
      message: "User Side Effect created successfully",
      data: newUserSideEffect,
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

const updateUserSideEffect = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        code: "BAD_REQUEST",
        error: errors.array(),
      });
    }

    const { id_user_side_effect } = req.params;
    const {
      id_side_effect,
      id_user,
      date_feel,
      time_feel,
      cycle_to,
      severity,
      frekuensi,
      distress,
      note,
      status,
    } = req.body;

    if (!id_user) {
      id_user = req.user.id_user;
    }

    const userSideEffect = await UserSideEffects.findOne({
      where: {
        id_user_side_effect,
        status: "active",
      },
    });

    if (!userSideEffect) {
      return res.status(404).json({
        success: false,
        code: "NOT_FOUND",
        error: {
          message: "User Side Effect not found",
        },
      });
    }

    await userSideEffect.update({
      id_side_effect,
      id_user,
      date_feel,
      time_feel,
      cycle_to,
      severity,
      frekuensi,
      distress,
      note,
      status,
    });

    return res.status(200).json({
      success: true,
      message: "User Side Effect updated successfully",
      data: userSideEffect,
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

const deleteUserSideEffect = async (req, res) => {
  try {
    const { id_user_side_effect } = req.params;

    // get user side effect first
    const userSideEffect = await UserSideEffects.findOne({
      where: {
        id_user_side_effect,
        status: "active",
      },
    });

    if (!userSideEffect) {
      return res.status(404).json({
        success: false,
        code: "NOT_FOUND",
        error: {
          message: "User Side Effect not found",
        },
      });
    }
    
    await userSideEffect.update({
      status: "deleted",
    });

    const deleteRecomendation = await Recomendation.update({
      id_side_effect: userSideEffect.id_side_effect,
      status: "active",
    });
    
    // delete also rekomendasi artikel

    return res.status(200).json({
      success: true,
      message: "User Side Effect soft-deleted successfully",
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

const getOneUserSideEffect = async (req, res) => {
  try {
    const { id_user_side_effect } = req.params;

    const userSideEffect = await UserSideEffects.findOne({
      where: {
        id_user_side_effect,
        status: "active",
      },
    });

    if (!userSideEffect) {
      return res.status(404).json({
        success: false,
        code: "NOT_FOUND",
        error: {
          message: "User Side Effect not found",
        },
      });
    }

    return res.status(200).json({
      success: true,
      data: userSideEffect,
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

const getAllUserSideEffects = async (req, res) => {
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

    const { count, rows } = await UserSideEffects.findAndCountAll({
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
  createUserSideEffect,
  updateUserSideEffect,
  deleteUserSideEffect,
  getOneUserSideEffect,
  getAllUserSideEffects,
};
