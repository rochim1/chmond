const {
    validationResult
} = require('express-validator');
const Educations = require('../models/educationModel');

// Create Education
const createEducation = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                code: 'BAD_REQUEST',
                error: errors.array(),
            });
        }

        const {
            title,
            content,
            video_link
        } = req.body;
        let thumbnail = null;

        // Handle file upload
        if (req.file) {
            thumbnail = `/uploads/thumbnails/${req.file.filename}`;
        }

        const newEducation = await Educations.create({
            title,
            content,
            video_link,
            thumbnail,
        });

        return res.status(201).json({
            success: true,
            message: 'Education created successfully',
            data: newEducation,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            code: 'INTERNAL_SERVER_ERROR',
            error: {
                message: error.message
            },
        });
    }
};

// Get One Education
const getOneEducation = async (req, res) => {
    try {
        const {
            id_education
        } = req.params;

        const education = await Educations.findOne({
            where: {
                id_education,
                status: 'active',
            },
        });

        if (!education) {
            return res.status(404).json({
                success: false,
                code: 'NOT_FOUND',
                error: {
                    message: 'Education not found'
                },
            });
        }

        return res.status(200).json({
            success: true,
            data: education,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            code: 'INTERNAL_SERVER_ERROR',
            error: {
                message: error.message
            },
        });
    }
};

// Get All Educations with Pagination
const getAllEducations = async (req, res) => {
    try {
        const {
            page = 1, pageSize = 10
        } = req.body;
        const {
            status
        } = req.body.filter || {
            status: 'active'
        };

        const offset = (page - 1) * pageSize;
        const limit = parseInt(pageSize);

        const educations = await Educations.findAndCountAll({
            where: {
                status
            },
            offset,
            limit,
        });

        return res.status(200).json({
            success: true,
            totalItems: educations.count,
            totalPages: Math.ceil(educations.count / pageSize),
            currentPage: parseInt(page),
            educations: educations.rows,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            code: 'INTERNAL_SERVER_ERROR',
            error: {
                message: error.message
            },
        });
    }
};

// Update Education
const updateEducation = async (req, res) => {
    try {
        const {
            id_education
        } = req.params;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                code: 'BAD_REQUEST',
                error: errors.array(),
            });
        }

        const education = await Educations.findOne({
            where: {
                id_education,
                status: 'active',
            },
        });

        if (!education) {
            return res.status(404).json({
                success: false,
                code: 'NOT_FOUND',
                error: {
                    message: 'Education not found'
                },
            });
        }

        let thumbnail = education.thumbnail;
        // Handle file upload
        if (req.file) {
            thumbnail = `/uploads/thumbnails/${req.file.filename}`;
        }

        const updatedEducation = await education.update({
            ...req.body,
            thumbnail,
        });

        return res.status(200).json({
            success: true,
            message: 'Education updated successfully',
            data: updatedEducation,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            code: 'INTERNAL_SERVER_ERROR',
            error: {
                message: error.message
            },
        });
    }
};

// Soft Delete Education
const deleteEducation = async (req, res) => {
    try {
        const {
            id_education
        } = req.params;

        const education = await Educations.findOne({
            where: {
                id_education,
                status: 'active',
            },
        });

        if (!education) {
            return res.status(404).json({
                success: false,
                code: 'NOT_FOUND',
                error: {
                    message: 'Education not found'
                },
            });
        }

        await education.update({
            status: 'deleted',
        });

        return res.status(200).json({
            success: true,
            message: 'Education soft-deleted successfully',
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            code: 'INTERNAL_SERVER_ERROR',
            error: {
                message: error.message
            },
        });
    }
};

module.exports = {
    createEducation,
    getOneEducation,
    getAllEducations,
    updateEducation,
    deleteEducation,
}