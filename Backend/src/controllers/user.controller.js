
import bcrypt from 'bcryptjs'; // Importing bcrypt for password hashing
import User from '../models/user.js'; // Importing the User model
import { v4 as uuidv4, validate } from 'uuid';
import { validationResult } from 'express-validator'; // ✅ CORRECT
import fs from 'fs'; // Importing fs for file system operations
import path from 'path'; // Importing path for handling file paths
import { fileURLToPath } from 'url'; // Importing fileURLToPath for handling file URLs
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename); // Getting the directory name of the current file
import mailer from '../helpers/mailer.js'; // Importing the mailer helper
import { Forgot_Password_Email_Template, Verification_Email_Template, Welcome_Email_Template } from '../helpers/emailTemplate.js'; // Importing the email template for verification
import jwt from 'jsonwebtoken'; // Importing jsonwebtoken for token generation
import UserProfile from '../models/userprofile.js';
import userRole from '../models/userRole.js';
import role from '../models/role.js';
import { enumRole } from '../helpers/enum.js';
export const baseUrl = process.env.BASE_URL;

export const registerUser = async (req, res, next) => {
    console.log("calling registerUser");
    try {
        const error = validationResult(req);
        if (!error.isEmpty()) {
            const err = new Error('Validation failed');
            err.statusCode = 422;
            err.errors = error.array();
            return next(err);
        }

        const { name, password, email, role: roleName } = req.body;

        const allowedRoles = enumRole; // ✅ Use enumRole for allowed roles
        const requestedRole = roleName || 'customer';
        if (!allowedRoles.includes(requestedRole)) {
            const error = new Error('Invalid role specified');
            error.statusCode = 400;
            return next(error);
        }
        const hashedPassword = await bcrypt.hash(password, 10);

        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            const error = new Error('User already exists');
            error.statusCode = 409;
            return next(error);
        }

        // ✅ Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP

        const userRoleData = await role.findOne({
            where: { role_name: roleName || 'customer' }
        });

        if (!userRoleData) {
            const error = new Error('Role not found');
            error.statusCode = 404;
            return next(error);
        }

        const newUser = await User.create({
            id: uuidv4(),
            name,
            password: hashedPassword,
            email,
            created_At: new Date(),
            updated_At: new Date()
        });
        // ✅ Assign default 'customer' role via many-to-many
        await newUser.addRole(userRoleData);
        // Create associated UserProfile
        await UserProfile.create({
            id: uuidv4(),
            user_id: newUser.id,
            // phone: null,
            // image: req.file ? `${baseUrl}/images/${req.file.filename}` : null,
            is_verified: false,
            otp_code: otp,
            otp_expires_at: new Date(Date.now() + 10 * 60 * 1000)
        });


        // ✅ Prepare email with OTP
        const emailHtml = Verification_Email_Template.replace('{verificationCode}', otp);

        const mailOptions = {
            to: newUser.email,
            subject: 'Your Verification Code',
            html: emailHtml
        };

        // ✅ Send the email
        await mailer.sendmail(mailOptions.to, mailOptions.subject, emailHtml);

        return res.status(201).json({
            success: true,
            message: 'User registered successfully. Verification email sent.',
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email
            }
        });

    } catch (error) {
        next(error);
    }
};

export const loginUser = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const error = new Error('Validation failed');
            error.statusCode = 422;
            error.errors = errors.array();
            return next(error);
        }

        const { email, password } = req.body;

        const user = await User.findOne({
            where: { email },
            include: [
                {
                    model: UserProfile,
                    as: 'user_profile',
                },
                {
                    model: role,
                    as: 'roles', // Assuming the alias for the roles association is 'roles'
                    through: { attributes: [] }, // Exclude attributes from the join table
                    attributes: ['role_name'] // Include only the role_name attribute
                }

            ]
        });

        if (!user) {
            const error = new Error('User not found');
            error.statusCode = 404;
            return next(error);
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            const error = new Error('Invalid credentials');
            error.statusCode = 401;
            return next(error);
        }

        const profile = user.user_profile;
        if (!profile.is_verified) {
            const now = new Date();
            if (profile.otp_expires_at && now > profile.otp_expires_at) {
                const error = new Error('OTP expired. Please request a new one.');
                error.statusCode = 403;
                error.resend_otp = true;
                return next(error);
            } else {
                const error = new Error('Email not verified. Please check your inbox.');
                error.statusCode = 403;
                return next(error);
            }
        }


        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRATION } // Token expires in 1 hour
        );
        const userJson = user.toJSON();

        // Clean user_profile
        if (userJson.user_profile) {
            delete userJson.user_profile.otp_code;
            delete userJson.user_profile.otp_expires_at;
            delete userJson.user_profile.reset_otp;
            delete userJson.user_profile.reset_otp_expires_at;
            delete userJson.user_profile.created_At;
            delete userJson.user_profile.updated_At;
        }

        // Clean top-level unnecessary fields
        delete userJson.password;
        userJson.roles = user.roles.map(role => role.role_name); // Flatten roles

        return res.status(200).json({
            success: true,
            message: 'Login successful',
            user: userJson,
            token
        });


    } catch (error) {
        next(error);
    }
};

export const resendOtp = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const err = new Error('Validation failed');
            err.statusCode = 422;
            err.errors = errors.array();
            return next(err);
        }

        const { email } = req.body;

        const user = await User.findOne({
            where: { email },
            include: { model: UserProfile, as: 'user_profile' }
        });

        if (!user || !user.user_profile) {
            const error = new Error('User or profile not found');
            error.statusCode = 404;
            return next(error);
        }

        const profile = user.user_profile;

        if (profile.is_verified) {
            return res.status(400).json({ message: 'User already verified.' });
        }

        const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        profile.otp_code = newOtp;
        profile.otp_expires_at = expiresAt;
        await profile.save();

        const emailHtml = Verification_Email_Template.replace('{verificationCode}', newOtp);
        await mailer.sendmail(user.email, 'Your New Verification Code', emailHtml);

        return res.status(200).json({
            success: true,
            message: 'New OTP sent to your email.'
        });

    } catch (error) {
        next(error);
    }
};

export const verifyOtp = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const err = new Error('Validation failed');
            err.statusCode = 422;
            err.errors = errors.array();
            return next(err);
        }

        const { email, otp_code } = req.body;

        const user = await User.findOne({
            where: { email },
            include: { model: UserProfile, as: 'user_profile' }
        });

        if (!user || !user.user_profile) {
            const error = new Error('User or profile not found');
            error.statusCode = 404;
            return next(error);
        }

        const profile = user.user_profile;

        if (profile.is_verified) {
            return res.status(400).json({ message: 'User already verified.' });
        }

        const now = new Date();
        if (profile.otp_expires_at && now > profile.otp_expires_at) {
            const error = new Error('OTP expired. Please request a new one.');
            error.statusCode = 403;
            error.resend_otp = true;
            return next(error);
        }

        if (profile.otp_code !== otp_code) {
            const error = new Error('Invalid OTP');
            error.statusCode = 401;
            return next(error);
        }

        profile.is_verified = true;
        profile.otp_code = null;
        profile.otp_expires_at = null;
        await profile.save();

        // Send welcome email (optional)
        const welcomeHtml = Welcome_Email_Template.replace('{name}', user.name);
        await mailer.sendmail(user.email, 'Welcome!', welcomeHtml);

        return res.status(200).json({
            success: true,
            message: 'Email verified successfully.'
        });

    } catch (error) {
        next(error);
    }
};


export const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({
            where: { email },
            include: { model: UserProfile, as: 'user_profile' }
        });

        if (!user || !user.user_profile) {
            const error = new Error('User not found');
            error.statusCode = 404;
            return next(error);
        }

        const resetOtp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        user.user_profile.reset_otp = resetOtp;
        user.user_profile.reset_otp_expires_at = expiresAt;
        await user.user_profile.save();

        const emailHtml = Forgot_Password_Email_Template.replace('{resetCode}', resetOtp);
        await mailer.sendmail(user.email, 'Password Reset Code', emailHtml);

        res.status(200).json({ success: true, message: 'Reset OTP sent to your email' });

    } catch (error) {
        next(error);
    }
};

export const verifyResetOtp = async (req, res, next) => {
    try {
        const { email, otp } = req.body;

        const user = await User.findOne({
            where: { email },
            include: { model: UserProfile, as: 'user_profile' }
        });

        if (!user || !user.user_profile) {
            const error = new Error('User not found');
            error.statusCode = 404;
            return next(error);
        }

        const profile = user.user_profile;

        if (!profile.reset_otp || profile.reset_otp !== otp) {
            const error = new Error('Invalid OTP');
            error.statusCode = 401;
            return next(error);
        }

        if (profile.reset_otp_expires_at < new Date()) {
            const error = new Error('OTP expired');
            error.statusCode = 403;
            return next(error);
        }

        return res.status(200).json({
            success: true,
            message: 'OTP verified. You can now reset your password.'
        });

    } catch (error) {
        next(error);
    }
};

export const resetPassword = async (req, res, next) => {
    try {
        const { email, otp, newPassword } = req.body;

        const user = await User.findOne({
            where: { email },
            include: { model: UserProfile, as: 'user_profile' }
        });

        if (!user || !user.user_profile) {
            const error = new Error('User not found');
            error.statusCode = 404;
            return next(error);
        }

        const profile = user.user_profile;

        if (profile.reset_otp !== otp || profile.reset_otp_expires_at < new Date()) {
            const error = new Error('Invalid or expired OTP');
            error.statusCode = 403;
            return next(error);
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        // Invalidate OTP
        profile.reset_otp = null;
        profile.reset_otp_expires_at = null;
        await profile.save();

        return res.status(200).json({
            success: true,
            message: 'Password reset successful.'
        });

    } catch (error) {
        next(error);
    }
};


export const getUserProfile = async (req, res, next) => {
    try {
        const id = req.user.userId;

        const user = await User.findOne({
            where: { id },
            attributes: { exclude: ['password'] },
            include: [
                {
                model: UserProfile,
                as: 'user_profile',
                attributes: { exclude: ['otp_code', 'otp_expires_at'] }
            },
            {
                model: role,
                as: 'roles', // Assuming the alias for the roles association is 'roles'
                through: { attributes: [] }, // Exclude attributes from the join table
                attributes: ['role_name'] // Include only the role_name attribute
            }
            ]
        });

            const userJson = user.toJSON();
            if( userJson.user_profile) {
            delete userJson.user_profile.otp_code;
            delete userJson.user_profile.otp_expires_at;
            delete userJson.user_profile.reset_otp;
            delete userJson.user_profile.reset_otp_expires_at;
            delete userJson.user_profile.created_At;
            delete userJson.user_profile.updated_At;
        }
            userJson.roles = user.roles.map(role => role.role_name); // Flatten roles

        if (!user) {
            const error = new Error('User not found');
            error.statusCode = 404;
            return next(error);
        }

        return res.status(200).json({
            success: true,
            user: userJson
        });

    } catch (error) {
        next(error);
    }
};

export const updateUserProfile = async (req, res, next) => {
    try {

         const error = validationResult(req);
        if (!error.isEmpty()) {


            if (req.file) {
                const filePath = path.join(__dirname, '../public/images', req.file.filename);
                fs.unlink(filePath, (err) => {
                    if (err) console.error('Failed to delete file:', err);
                });
            }
            const err = new Error('Validation failed');
            err.statusCode = 422;
            err.errors = error.array();
            return next(err);
        }
        const id = req.user.userId;
        const { phone } = req.body;

        const user = await User.findOne({
            where: { id },
            include: { model: UserProfile, as: 'user_profile' }
        });
        if (!user || !user.user_profile) {
            const error = new Error('User or profile not found');
            error.statusCode = 404;
            return next(error);
        }
        const profile = user.user_profile;

        profile.phone = phone;
        profile.image = req.file ? `${baseUrl}/images/${req.file.filename}` : profile.image; // Use existing image if not updated
        await profile.save();

        return res.status(200).json({
            success: true,
            message: 'Profile updated successfully.',
            user: {
                id: user.id,
                email: user.email,
                phone: profile.phone,
                image: profile.image
            }
        });

    } catch (error) {
        next(error);
    }
};