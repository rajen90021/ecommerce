import fs from 'fs';
import express from 'express';
import path from 'path';
import multer from 'multer';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const userRoutes = express.Router();

const imagePath = path.join(__dirname, '../public/images');


// Ensure the directory exists
if (!fs.existsSync(imagePath)) {
  fs.mkdirSync(imagePath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
  // Ensure the directory exists
    if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg') {
      cb(null, path.join(__dirname, '../public/images'));

    }
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg') {
      cb(null, true);

    }else{
      cb(null, false);
      return cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
    }
  },
  limits: { fileSize: 2 * 1024 * 1024 } // max 2MB
});


import { forgotPassword, getUserProfile, loginUser, registerUser, resendOtp, resetPassword, updateUserProfile, verifyOtp, verifyResetOtp  } from '../controllers/user.controller.js';
import { forgotPasswordValidation, resetPasswordValidation, validateLoginUser, validateRegisterUser, validateResendOtp, validateUserProfile, validateVerifyOtp, verifyOtpValidation } from '../helpers/validations.js';
import {authMiddleware} from '../middleware/authMiddleware.js';
import { registerRateLimiter } from '../middleware/rateLimiter.js';



userRoutes.post('/register', validateRegisterUser, registerRateLimiter, registerUser);
userRoutes.post('/login', validateLoginUser, loginUser);
userRoutes.post('/resend-otp', validateResendOtp, resendOtp);
userRoutes.post('/verify-otp', validateVerifyOtp, verifyOtp);
userRoutes.get("/user-profile", authMiddleware,  getUserProfile);
userRoutes.put("/user-profile", authMiddleware, upload.single('image'), validateUserProfile, updateUserProfile);

userRoutes.post('/forgot-password', forgotPasswordValidation, forgotPassword);
userRoutes.post('/verify-reset-otp', verifyOtpValidation, verifyResetOtp);
userRoutes.post('/reset-password', resetPasswordValidation, resetPassword);


export default userRoutes;
