const {
    validationResult
} = require('express-validator');
const Educations = require('../models/educationModel');
const fs = require('fs');
const path = require('path');

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
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                code: 'BAD_REQUEST',
                error: errors.array(),
            });
        }

        const {
            id_education
        } = req.params; // Get education ID from params
        const {
            title,
            content,
            video_link,
            // status,
            remove_thumbnail, // New form-data field for removing thumbnail
        } = req.body;

        // Check if education exists
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

        // Handle file upload (if a new thumbnail is uploaded)
        let thumbnailPath = education.thumbnail; // Use the existing thumbnail if none is uploaded
        if (req.file) {
            thumbnailPath = req.file.path; // Update with the new thumbnail path
        }

        // Handle removal of the thumbnail if requested
        if (remove_thumbnail === 'true') {
            if (education.thumbnail) {
                const filePath = path.join(__dirname, '../..', 'uploads', 'thumbnails', path.basename(education.thumbnail));
                // Update the path to point directly to the correct directory
                fs.unlink(filePath, (err) => {
                    if (err) {
                        console.error('Error removing thumbnail file:', err);
                    } else {
                        console.log('Thumbnail file removed successfully');
                    }
                });
                thumbnailPath = null;
            }
        }

        // Update the education record
        await education.update({
            title,
            content,
            video_link,
            thumbnail: thumbnailPath, // Use the new or existing (or null if removed) thumbnail path
            // status,
        });

        return res.status(200).json({
            success: true,
            message: 'Education updated successfully',
            data: education,
        });
    } catch (error) {
        console.error('Error updating education:', error);
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