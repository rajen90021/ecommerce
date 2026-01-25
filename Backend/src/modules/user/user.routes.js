import express from 'express';
import multer from 'multer';
import {
    forgotPassword,
    getUserProfile,
    loginUser,
    loginWithPhone,
    registerUser,
    resendOtp,
    resetPassword,
    updateUserProfile,
    verifyOtp,
    verifyResetOtp
} from './user.controller.js';

import {
    forgotPasswordValidation,
    resetPasswordValidation,
    validateLoginUser,
    validateRegisterUser,
    validateResendOtp,
    validateVerifyOtp,
    verifyOtpValidation
} from '../auth/auth.validators.js';

import { validateUserProfile } from './user.validators.js';

import { authMiddleware } from '../../middleware/authMiddleware.js';
import { registerRateLimiter } from '../../middleware/rateLimiter.js';

const userRoutes = express.Router();

// Configure multer to use memory storage for Cloudinary uploads
const upload = multer({
    storage: multer.memoryStorage(),
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg') {
            cb(null, true);
        } else {
            cb(null, false);
            return cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
        }
    },
    limits: { fileSize: 2 * 1024 * 1024 } // max 2MB
});

userRoutes.post('/register', validateRegisterUser, registerRateLimiter, registerUser);
userRoutes.post('/login', validateLoginUser, loginUser);
userRoutes.post('/login-phone', loginWithPhone);
userRoutes.post('/resend-otp', validateResendOtp, resendOtp);
userRoutes.post('/verify-otp', validateVerifyOtp, verifyOtp);
userRoutes.get("/user-profile", authMiddleware, getUserProfile);
userRoutes.put("/user-profile", authMiddleware, upload.single('image'), validateUserProfile, updateUserProfile);

userRoutes.post('/forgot-password', forgotPasswordValidation, forgotPassword);
userRoutes.post('/verify-reset-otp', verifyOtpValidation, verifyResetOtp);
userRoutes.post('/reset-password', resetPasswordValidation, resetPassword);

export default userRoutes;
