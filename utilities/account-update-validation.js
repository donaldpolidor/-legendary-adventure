const utilities = require("./");
const { body, validationResult } = require("express-validator");

/* ************************
 * Account Update Validation Rules
 ************************** */
const accountUpdateRules = () => {
  return [
    // First Name
    body("account_firstname")
      .trim()
      .notEmpty()
      .withMessage("Please provide a first name")
      .isLength({ min: 1 })
      .withMessage("First name must be at least 1 character long")
      .matches(/^[A-Za-z]+$/)
      .withMessage("First name must contain only letters"),
    
    // Last Name
    body("account_lastname")
      .trim()
      .notEmpty()
      .withMessage("Please provide a last name")
      .isLength({ min: 2 })
      .withMessage("Last name must be at least 2 characters long")
      .matches(/^[A-Za-z]+$/)
      .withMessage("Last name must contain only letters"),
    
    // Email
    body("account_email")
      .trim()
      .notEmpty()
      .withMessage("Please provide an email address")
      .isEmail()
      .withMessage("Please provide a valid email address")
      .normalizeEmail()
  ];
};

/* ************************
 * Password Update Validation Rules
 ************************** */
const passwordUpdateRules = () => {
  return [
    // Current Password
    body("current_password")
      .trim()
      .notEmpty()
      .withMessage("Please provide your current password"),
    
    // New Password
    body("new_password")
      .trim()
      .notEmpty()
      .withMessage("Please provide a new password")
      .isStrongPassword({
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage("Password must be at least 12 characters long and contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character"),
    
    // Confirm Password
    body("confirm_password")
      .trim()
      .custom((value, { req }) => {
        if (value !== req.body.new_password) {
          throw new Error("Passwords do not match");
        }
        return true;
      })
  ];
};

/* ************************
 * Check Account Update Data
 ************************** */
const checkAccountUpdateData = async (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    const account_id = req.body.account_id || req.params.account_id;
    
    // Get account data from database
    const accountModel = require("../models/account-model");
    const accountData = await accountModel.getAccountById(account_id);
    
    res.render("account/update-account", {
      title: "Update Account",
      nav,
      errors: errors.array(),
      accountData
    });
    return;
  }
  next();
};

/* ************************
 * Check Password Update Data
 ************************** */
const checkPasswordUpdateData = async (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    const account_id = req.body.account_id;
    
    // Get account data from database
    const accountModel = require("../models/account-model");
    const accountData = await accountModel.getAccountById(account_id);
    
    res.render("account/update-account", {
      title: "Update Account",
      nav,
      errors: errors.array(),
      accountData
    });
    return;
  }
  next();
};

module.exports = {
  accountUpdateRules,
  passwordUpdateRules,
  checkAccountUpdateData,
  checkPasswordUpdateData
};