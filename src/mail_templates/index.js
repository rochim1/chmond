const crypto = require('crypto');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const handlebars = require('handlebars');
const { Op } = require('sequelize');
const Users = require('../models/userModel');

const blockedMails = [];

const mailOptions = [{
    template_name: 'forgot_password',
    require_params: {
        resetLink: 'link',
        username: 'name'
    },
    from: process.env.EMAIL,
    receiver_role: ['user', 'admin'],
    to: '', // User email will be dynamically set
    subject: 'Password Reset',
    html: '../mail_templates/forgotPassword/'
}];

async function sendEmailFunction(email, template_name, params, lang = 'ind') {
    try {
        if (!blockedMails.includes(template_name)) {
            const getMailOptions = mailOptions.find(options => options.template_name === template_name);

            if (!getMailOptions) {
                return {
                    code: 404,
                    success: false,
                    message: 'Cannot send mail, template not found'
                };
            }

            // Fetch user by email and ensure email is verified
            const Users = await User.findOne({
                where: {
                    email,
                    email_verified_at: {
                        [Op.ne]: null,
                    },
                },
            });

            if (!user) {
                return {
                    success: false,
                    message: 'User not found or email not verified',
                };
            }

            // Generate token and save to the user document
            const token = crypto.randomBytes(32).toString('hex');
            user.resetPasswordToken = token;
            user.resetPasswordExpires = Date.now() + 3600000; // Token expires in 1 hour
            await user.save();

            // Construct template path and read HTML content
            const templatePath = path.join(__dirname, `${getMailOptions.html}${lang === 'ind' ? 'ind.html' : 'eng.html'}`);
            const htmlSource = fs.readFileSync(templatePath, 'utf-8');
            const template = handlebars.compile(htmlSource);

            // Replace placeholders with actual data
            const resetLink = `http://${process.env.HOST}/reset/${token}`;
            const replacements = {
                ...params,
                resetLink,
                username: user.name,
            };
            const emailTemplate = template(replacements);
            // Create transporter for sending email
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL,
                    pass: process.env.PASSWORD,
                },
            });

            // Set dynamic email options
            const finalMailOptions = {
                from: getMailOptions.from,
                to: user.email,
                subject: getMailOptions.subject,
                html: emailTemplate,
            };

            // Send email
            await transporter.sendMail(finalMailOptions);

            return {
                success: true,
                message: 'Verification email sent successfully',
            };
        } else {
            return {
                success: false,
                message: 'Email template is blocked from sending',
            };
        }
    } catch (error) {
        return {
            success: false,
            message: 'INTERNAL_SERVER_ERROR',
            error: error.message,
        };
    }
}

module.exports = {
    sendEmailFunction
};
