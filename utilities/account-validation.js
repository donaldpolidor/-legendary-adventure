const utilities = require("../utilities/")
const { body, validationResult } = require("express-validator")

/* *******************************
 * Registration Validation Rules
 ******************************* */
const regValidate = {}

regValidate.registrationRules = () => {
  return [
    // firstname is required and must be string
    body("account_firstname")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Please provide a first name."), 

    // lastname is required and must be string
    body("account_lastname")
      .trim()
      .isLength({ min: 2 })
      .withMessage("Please provide a last name."), 

    // valid email is required and cannot already exist in the DB
    body("account_email")
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage("A valid email is required."), 

    // password is required and must be strong password
    body("account_password")
      .trim()
      .isStrongPassword({
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage("Password does not meet requirements."),
  ]
}

/* *******************************
 * Check data against rules
 ******************************* */
regValidate.checkRegData = async (req, res, next) => {
  const { account_firstname, account_lastname, account_email } = req.body
  let errors = []
  
  errors = validationResult(req)
  
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.render("account/registration", {
      title: "Registration",
      nav,
      errors: errors.array(),
      account_firstname,
      account_lastname,
      account_email,
    })
    return
  }
  
  next()
}

/* *******************************
 * Login Validation Rules
 ******************************* */
regValidate.loginRules = () => {
  return [
    // email is required and must be valid email
    body("account_email")
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage("A valid email is required."),

    // password is required
    body("account_password")
      .trim()
      .notEmpty()
      .withMessage("Please provide a password.")
  ]
}

/* *******************************
 * Check login data against rules
 ******************************* */
regValidate.checkLoginData = async (req, res, next) => {
  const { account_email } = req.body
  let errors = []
  
  errors = validationResult(req)
  
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.render("account/login", {
      title: "Login",
      nav,
      errors: errors.array(),
      account_email,
    })
    return
  }
  
  next()
}

module.exports = regValidate