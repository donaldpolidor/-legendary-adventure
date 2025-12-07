// account-update-validation.js
const utilities = require(".")
const { body, validationResult } = require("express-validator")
const accountModel = require("../models/account-model")

/* ****************************************
 * Account Update Validation Rules
 **************************************** */
const accountValidate = {}

/* ****************************************
 * Validation Rules for Account Information Update
 **************************************** */
accountValidate.accountUpdateRules = () => {
  return [
    // Firstname is required
    body("account_firstname")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Please provide a first name."),

    // Lastname is required
    body("account_lastname")
      .trim()
      .isLength({ min: 2 })
      .withMessage("Please provide a last name."),

    // Email is required and must be valid
    body("account_email")
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage("A valid email is required.")
      // Check if email already exists for another account
      .custom(async (email, { req }) => {
        const account = await accountModel.getAccountByEmail(email)
        if (account && account.account_id !== parseInt(req.body.account_id)) {
          throw new Error("Email already exists. Please use a different email.")
        }
        return true
      })
  ]
}

/* ****************************************
 * Validation Rules for Password Update
 **************************************** */
accountValidate.passwordUpdateRules = () => {
  return [
    // Current password is required if changing password
    body("current_password")
      .if(body("new_password").notEmpty())
      .notEmpty()
      .withMessage("Current password is required to change password."),

    // New password must meet requirements
    body("new_password")
      .if(body("new_password").notEmpty())
      .trim()
      .isStrongPassword({
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage("Password does not meet requirements."),

    // Confirm password must match
    body("confirm_password")
      .custom((value, { req }) => {
        if (req.body.new_password && value !== req.body.new_password) {
          throw new Error("Passwords do not match.")
        }
        return true
      })
  ]
}

/* ****************************************
 * Check Account Update Data
 * Returns errors to update-account view
 **************************************** */
accountValidate.checkAccountUpdateData = async (req, res, next) => {
  const { 
    account_id,
    account_firstname, 
    account_lastname, 
    account_email 
  } = req.body
  
  let errors = validationResult(req)
  
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    
    // Get account data for repopulating the form
    const accountData = await accountModel.getAccountById(account_id)
    
    res.render("account/update-account", {
      title: "Update Account",
      nav,
      accountData: {
        ...accountData,
        account_firstname,
        account_lastname,
        account_email
      },
      errors: errors.array()
    })
    return
  }
  
  next()
}

/* ****************************************
 * Check Password Update Data
 * Returns errors to update-account view
 **************************************** */
accountValidate.checkPasswordUpdateData = async (req, res, next) => {
  const { 
    account_id,
    current_password,
    new_password
  } = req.body
  
  let errors = validationResult(req)
  
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    
    // Get account data for repopulating the form
    const accountData = await accountModel.getAccountById(account_id)
    
    res.render("account/update-account", {
      title: "Update Account",
      nav,
      accountData,
      errors: errors.array()
    })
    return
  }
  
  // Additional validation: verify current password
  if (new_password) {
    const accountData = await accountModel.getAccountById(account_id)
    const isPasswordValid = await require("bcryptjs").compare(
      current_password, 
      accountData.account_password
    )
    
    if (!isPasswordValid) {
      let nav = await utilities.getNav()
      
      res.render("account/update-account", {
        title: "Update Account",
        nav,
        accountData,
        errors: [{ msg: "Current password is incorrect." }]
      })
      return
    }
  }
  
  next()
}

module.exports = accountValidate