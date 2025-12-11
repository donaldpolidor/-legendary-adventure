/* ******************************************
 * Account Controller
 * Handles account-related operations
 *******************************************/

// Require utilities and account model
const utilities = require("../utilities/");
const accountModel = require("../models/account-model");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const bcrypt = require("bcryptjs");

/* ****************************************
 * Deliver login view
 * *************************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/login", {
    title: "Login",
    nav,
    errors: null,  
  })
}

/* ****************************************
 * Deliver registration view
 * *************************************** */
async function buildRegistration(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null 
  })
}

/* ****************************************
 * Process Registration
 * *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_password } = req.body

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    account_password
  )

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you\'re registered ${account_firstname}. Please log in.`
    )
    res.status(201).redirect("/account/login")
  } else {
    req.flash("notice", "Sorry, the registration failed.")
    res.status(501).render("account/registration", {
      title: "Registration",
      nav,
      errors: null, 
    })
  }
}

/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.")
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    })
    return
  }
  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
      if(process.env.NODE_ENV === 'development') {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
      } else {
        res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
      }
      return res.redirect("/account/")
    }
    else {
      req.flash("notice", "Please check your credentials and try again.") 
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      })
    }
  } catch (error) {
    throw new Error('Access Forbidden')
  }
}

/* ****************************************
 * Deliver account management view
 * *************************************** */
async function buildAccountManagement(req, res, next) {
  try {
    let nav = await utilities.getNav()
    res.render("account/account-management", {
      title: "Account Management",
      nav,
      errors: null,
    })
  } catch (error) {
    console.error("Error in buildAccountManagement:", error)
    req.flash("notice", "Error loading account management page")
    res.redirect("/")
  }
}

/* ****************************************
 * Deliver account update view
 * *************************************** */
async function buildUpdateAccount(req, res, next) {
  try {
    let nav = await utilities.getNav()
    const account_id = parseInt(req.params.account_id)
    
    // Verify the logged-in user matches the requested account
    if (res.locals.accountData && res.locals.accountData.account_id !== account_id) {
      req.flash("notice", "You can only update your own account.")
      return res.redirect("/account/")
    }
    
    // Get account data from database
    const accountData = await accountModel.getAccountById(account_id)
    
    if (!accountData) {
      req.flash("notice", "Account not found.")
      return res.redirect("/account/")
    }
    
    res.render("account/update-account", {
      title: "Update Account",
      nav,
      errors: null,
      accountData
    })
    
  } catch (error) {
    console.error("buildUpdateAccount error:", error.message)
    req.flash("notice", "Error loading update page.")
    res.redirect("/account/")
  }
}

/* ****************************************
 * Process account update
 * *************************************** */
async function updateAccount(req, res, next) {
  try {
    const {
      account_id,
      account_firstname,
      account_lastname,
      account_email
    } = req.body
    
    // Verify user is updating their own account
    if (res.locals.accountData && res.locals.accountData.account_id !== parseInt(account_id)) {
      req.flash("notice", "You can only update your own account.")
      return res.redirect("/account/")
    }
    
    // Update account in database
    const updateResult = await accountModel.updateAccountBasic(
      parseInt(account_id),
      account_firstname,
      account_lastname,
      account_email
    )
    
    if (updateResult) {
      // Update JWT token with new data
      const updatedAccount = {
        account_id: updateResult.account_id,
        account_firstname: updateResult.account_firstname,
        account_lastname: updateResult.account_lastname,
        account_email: updateResult.account_email,
        account_type: updateResult.account_type
      }
      
      const accessToken = jwt.sign(
        updatedAccount, 
        process.env.ACCESS_TOKEN_SECRET, 
        { expiresIn: 3600 * 1000 }
      )
      
      // Update cookie
      if(process.env.NODE_ENV === 'development') {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
      } else {
        res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
      }
      
      // Update res.locals for current request
      res.locals.accountData = updatedAccount
      
      req.flash("success", "Account updated successfully.")
      res.redirect("/account/")
    } else {
      req.flash("notice", "Sorry, the account update failed.")
      res.redirect(`/account/update/${account_id}`)
    }
    
  } catch (error) {
    console.error("updateAccount error:", error.message)
    req.flash("notice", "Error updating account.")
    res.redirect("/account/")
  }
}

/* ****************************************
 * Process password update
 * *************************************** */
async function updatePassword(req, res, next) {
  try {
    const {
      account_id,
      current_password,
      new_password
    } = req.body
    
    // Verify user is updating their own account
    if (res.locals.accountData && res.locals.accountData.account_id !== parseInt(account_id)) {
      req.flash("notice", "You can only update your own account.")
      return res.redirect("/account/")
    }
    
    // If no new password provided, redirect back
    if (!new_password) {
      req.flash("notice", "No password change requested.")
      return res.redirect(`/account/update/${account_id}`)
    }
    
    // Hash the new password
    const hashedPassword = await bcrypt.hash(new_password, 10)
    
    // Update password in database
    const updateResult = await accountModel.updateAccountPassword(
      parseInt(account_id),
      hashedPassword
    )
    
    if (updateResult) {
      req.flash("success", "Password updated successfully.")
      res.redirect("/account/")
    } else {
      req.flash("notice", "Sorry, the password update failed.")
      res.redirect(`/account/update/${account_id}`)
    }
    
  } catch (error) {
    console.error("updatePassword error:", error.message)
    req.flash("notice", "Error updating password.")
    res.redirect("/account/")
  }
}

/* ****************************************
 * Process logout request
 * *************************************** */
async function accountLogout(req, res, next) {
  try {
    // Clear the JWT cookie
    res.clearCookie("jwt")
    
    req.flash("success", "You have been successfully logged out.")
    res.redirect("/")
  } catch (error) {
    console.error("accountLogout error:", error.message)
    req.flash("notice", "Error during logout.")
    res.redirect("/")
  }
}

// Export the controller functions
module.exports = { 
  buildLogin, 
  buildRegistration, 
  registerAccount, 
  accountLogin,
  buildAccountManagement,
  buildUpdateAccount,
  updateAccount,
  updatePassword,      
  accountLogout
}