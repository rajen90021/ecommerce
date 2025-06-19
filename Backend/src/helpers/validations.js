

import { check } from 'express-validator';

export const validateRegisterUser = [
  check('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 3 }).withMessage('Name must be at least 3 characters'),

  check('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Email must be valid'),

  check('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),

];

export const validateUserProfile = [
  check('phone')
    .notEmpty().withMessage('Phone number is required')
    .matches(/^\+?\d{10,15}$/).withMessage('Phone number must be valid'),

  // Don't validate 'image' using express-validator. Let multer handle it.

  check('image')
    .custom((value, { req }) => {
      // If an image is provided, it should be a file uploaded by multer
     if(req.file.mimetype === 'image/jpeg' || req.file.mimetype === 'image/png') {
        return true; // Valid image type
      }
      else{
        return false; // Invalid image type
      }
      
    }).withMessage('Image must be a JPEG or PNG file'),
]


export const validateLoginUser = [
  check('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Email must be valid'),

  check('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),      
];

export const validateResendOtp = [
  check('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Email must be valid'),
];  

export const validateVerifyOtp = [
  check('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Email must be valid'),

  check('otp_code')
    .notEmpty().withMessage('OTP code is required')
    .isLength({ min: 6, max: 6 }).withMessage('OTP code must be exactly 6 characters'),
];

export const forgotPasswordValidation = [
    check('email').isEmail().withMessage('Valid email required')
];

export const verifyOtpValidation = [
    check('email').isEmail(),
    check('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits')
];

export const resetPasswordValidation = [
    check('email').isEmail(),
    check('otp').isLength({ min: 6, max: 6 }),
    check('newPassword').isLength({ min: 6 }).withMessage('Password too short')
];
