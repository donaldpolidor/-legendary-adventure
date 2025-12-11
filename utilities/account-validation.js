const utilities = require("./");
const { body, validationResult } = require("express-validator");

/* ************************
 * Registration Validation Rules
 ************************** */
const registrationRules = () => {
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
      .normalizeEmail(),
    
    // Password
    body("account_password")
      .trim()
      .notEmpty()
      .withMessage("Please provide a password")
      .isStrongPassword({
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage("Password must be at least 12 characters long and contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character")
  ];
};

/* ************************
 * Login Validation Rules
 ************************** */
const loginRules = () => {
  return [
    // Email
    body("account_email")
      .trim()
      .notEmpty()
      .withMessage("Please provide an email address")
      .isEmail()
      .withMessage("Please provide a valid email address")
      .normalizeEmail(),
    
    // Password
    body("account_password")
      .trim()
      .notEmpty()
      .withMessage("Please provide a password")
  ];
};

/* ************************
 * Check Registration Data
 * Returns validation results
 ************************** */
const checkRegData = async (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    const { account_firstname, account_lastname, account_email } = req.body;
    
    res.render("account/registration", {
      title: "Register",
      nav,
      errors: errors.array(),
      account_firstname,
      account_lastname,
      account_email,
    });
    return;
  }
  next();
};

/* ************************
 * Check Login Data
 * Returns validation results
 ************************** */
const checkLoginData = async (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    const { account_email } = req.body;
    
    res.render("account/login", {
      title: "Login",
      nav,
      errors: errors.array(),
      account_email,
    });
    return;
  }
  next();
};

module.exports = {
  registrationRules,
  checkRegData,
  loginRules,
  checkLoginData
};