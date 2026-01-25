import { check } from 'express-validator';

export const validateCreateShippingAddress = [
    check('full_address')
        .notEmpty().withMessage('Full address is required')
        .isLength({ min: 10, max: 500 }).withMessage('Full address must be between 10 and 500 characters'),

    check('state')
        .notEmpty().withMessage('State is required')
        .isLength({ min: 2, max: 50 }).withMessage('State must be between 2 and 50 characters'),

    check('city')
        .notEmpty().withMessage('City is required')
        .isLength({ min: 2, max: 50 }).withMessage('City must be between 2 and 50 characters'),

    check('zip_code')
        .notEmpty().withMessage('Zip code is required')
        .matches(/^\d{5,10}$/).withMessage('Zip code must be 5-10 digits'),
];

export const validateUpdateShippingAddress = [
    check('full_address')
        .optional()
        .isLength({ min: 10, max: 500 }).withMessage('Full address must be between 10 and 500 characters'),

    check('state')
        .optional()
        .isLength({ min: 2, max: 50 }).withMessage('State must be between 2 and 50 characters'),

    check('city')
        .optional()
        .isLength({ min: 2, max: 50 }).withMessage('City must be between 2 and 50 characters'),

    check('zip_code')
        .optional()
        .matches(/^\d{5,10}$/).withMessage('Zip code must be 5-10 digits'),
];
