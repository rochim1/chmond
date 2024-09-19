const {
    validationResult
} = require("express-validator");
const {
    Educations,
    Recomendation
} = require("../models");
const fs = require("fs");
const path = require("path");
const {
    Op
} = require("sequelize");
const User = require("../models/userModel");

// Create Education
const storeFCMtoken = async (req, res) => {
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
            fcm_token
        } = req.body;

        if (!id_user) {
            id_user = req.user.id_user;
        }

        // Find the user by ID
        const user = await User.findOne({
            where: {
                id_user,
                status: "active",
            },
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                code: "NOT_FOUND",
                error: {
                    message: "User not found",
                },
            });
        }

        await user.update({
            fcm_token
        });

        // Respond with updated user details
        res.status(200).json({
            success: true,
            message: "FCM token stored successfully",
            data: user,
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
    storeFCMtoken,
};