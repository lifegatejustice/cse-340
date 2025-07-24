const { body } = require('express-validator');
const accountModel = require('../models/account-model');

const registrationRules = [
  // First name is required and must be at least 2 characters
  body('account_firstname')
    .trim()
    .isLength({ min: 2 })
    .withMessage('First name must be at least 2 characters long.'),

  // Last name is required and must be at least 2 characters
  body('account_lastname')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Last name must be at least 2 characters long.'),

  // Email is required, must be valid, normalized, and unique
  body('account_email')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('A valid email is required.')
    .custom(async (account_email) => {
      const emailExists = await accountModel.checkExistingEmail(account_email);
      if (emailExists) {
        throw new Error('Email exists. Please log in or use a different email.');
      }
    }),

  // Password is required and must meet complexity requirements
  body('account_password')
    .isStrongPassword({
      minLength: 12,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    })
    .withMessage('Password must be at least 12 characters and include 1 uppercase letter, 1 number, and 1 special character.'),
];

const loginRules = [
  // Email is required and must be valid
  body('account_email')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('A valid email is required.'),

  // Password is required
  body('account_password')
    .notEmpty()
    .withMessage('Password is required.'),
];

module.exports = {
  registrationRules,
  loginRules,
};
