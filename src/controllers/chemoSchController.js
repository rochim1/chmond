const {
    validationResult
} = require('express-validator');
const ChemoSchedule = require('../models/chemoSchModel');

const createChemoSchedule = async (req, res) => {
    try {
        // Validate request
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                code: 'BAD_REQUEST',
                error: {
                    message: errors.array()
                }
            });
        }

        // Extract data from request body
        let {
            tujuan_kemoterapi,
            tanggal_kemoterapi,
            waktu_kemoterapi,
            remember_before_minutes,
            id_user,
            notes
        } = req.body;

        if (!id_user) {
            id_user = req.user.id_user;
        }

        // Create new ChemoSchedule
        const newChemoSchedule = await ChemoSchedule.create({
            tujuan_kemoterapi,
            tanggal_kemoterapi,
            waktu_kemoterapi,
            remember_before_minutes,
            id_user,
            notes,
        });

        return res.status(201).json({
            success: true,
            message: 'ChemoSchedule created successfully',
            data: newChemoSchedule
        });
    } catch (error) {
        console.error('Error creating ChemoSchedule:', error);
        return res.status(500).json({
            success: false,
            code: 'INTERNAL_SERVER_ERROR',
            error: {
                message: error.message
            }
        });
    }
};

const updateChemoSchedule = async (req, res) => {
    try {
        const {
            id_chemoSchedule
        } = req.params;

        // Validate request
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                code: 'BAD_REQUEST',
                error: {
                    message: errors.array()
                }
            });
        }

        // Extract data from request body
        let {
            tujuan_kemoterapi,
            tanggal_kemoterapi,
            waktu_kemoterapi,
            remember_before_minutes,
            id_user,
            notes
        } = req.body;

        const scheduleToUpdate = await ChemoSchedule.findOne({
            where: {
                id_chemoSchedule: id_chemoSchedule,
                status: 'active'
            }
        });

        if (!scheduleToUpdate) {
            return res.status(404).json({
                success: false,
                code: 'NOT_FOUND',
                error: {
                  message: 'chemo schedule not found'
                }
              });
        }

        if (!id_user) {
            id_user = scheduleToUpdate.id_user || req.user.id_user;
        }
        // Find and update the ChemoSchedule
        const [updated] = await ChemoSchedule.update({
            tujuan_kemoterapi,
            tanggal_kemoterapi,
            waktu_kemoterapi,
            remember_before_minutes,
            id_user,
            notes
        }, {
            where: {
                id_chemoSchedule,
                status: 'active'
            }
        });

        if (!updated) {
            return res.status(404).json({
                success: false,
                code: 'NOT_FOUND',
                error: {
                    message: 'ChemoSchedule not found or already deleted'
                }
            });
        }

        // Fetch updated record
        const updatedChemoSchedule = await ChemoSchedule.findOne({
            where: {
                id_chemoSchedule,
                status: 'active'
            }
        });

        return res.status(200).json({
            success: true,
            message: 'ChemoSchedule updated successfully',
            data: updatedChemoSchedule
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            code: 'INTERNAL_SERVER_ERROR',
            error: {
                message: error.message
            }
        });
    }
};

const deleteChemoSchedule = async (req, res) => {
    try {
        const {
            id_chemoSchedule
        } = req.params;

        // Find the ChemoSchedule to delete
        const chemoSchedule = await ChemoSchedule.findOne({
            where: {
                id_chemoSchedule,
                status: 'active'
            }
        });

        if (!chemoSchedule) {
            return res.status(404).json({
                success: false,
                code: 'NOT_FOUND',
                error: {
                    message: 'ChemoSchedule not found'
                }
            });
        }

        // Update status to 'deleted' and set deletedAt timestamp
        await chemoSchedule.update({
            status: 'deleted',
            deletedAt: new Date()
        });

        return res.status(200).json({
            success: true,
            message: 'ChemoSchedule deleted successfully'
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            code: 'INTERNAL_SERVER_ERROR',
            error: {
                message: error.message
            }
        });
    }
};

const getOneChemoSchedule = async (req, res) => {
    try {
        const {
            id_chemoSchedule
        } = req.params;

        const chemoSchedule = await ChemoSchedule.findOne({
            where: {
                id_chemoSchedule,
                status: 'active'
            }
        });

        if (!chemoSchedule) {
            return res.status(404).json({
                success: false,
                code: 'NOT_FOUND',
                error: {
                    message: 'ChemoSchedule not found'
                }
            });
        }

        return res.status(200).json({
            success: true,
            data: chemoSchedule
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            code: 'INTERNAL_SERVER_ERROR',
            error: {
                message: error.message
            }
        });
    }
};

const getAllChemoSchedules = async (req, res) => {
    try {
        const {
            page = 1, pageSize = 10
        } = req.body;
        const {
            status
          } = req.body && req.body.filter ? req.body.filter : {
            status: 'active'
          };

        const offset = (page - 1) * pageSize;
        const limit = parseInt(pageSize);

        const {
            count,
            rows
        } = await ChemoSchedule.findAndCountAll({
            where: {
                status
            },
            offset,
            limit
        });

        return res.status(200).json({
            success: true,
            totalItems: count,
            totalPages: Math.ceil(count / pageSize),
            currentPage: parseInt(page),
            data: rows
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            code: 'INTERNAL_SERVER_ERROR',
            error: {
                message: error.message
            }
        });
    }
};


module.exports = {
    createChemoSchedule,
    updateChemoSchedule,
    deleteChemoSchedule,
    getOneChemoSchedule,
    getAllChemoSchedules
}