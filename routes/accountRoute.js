/* ******************************************
 * Account Routes
 * Handles all account-related routes
 *******************************************/

// External resources required
const express = require("express");
const router = express.Router();
const utilities = require("../utilities/");
const accountController = require("../controllers/accountController");
const regValidate = require('../utilities/account-validation');
const accountValidate = require('../utilities/account-update-validation'); 

/**
 * GET route for login page
 * Path: /login (full path will be /account/login)
 */
router.get("/login", utilities.handleErrors(accountController.buildLogin));

/**
 * POST route for processing login
 * Path: /login (full path will be /account/login)
 */
router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
);

/**
 * GET route for account management page
 * Path: / (full path will be /account/)
 */
router.get("/", 
  utilities.checkLogin, 
  utilities.handleErrors(accountController.buildAccountManagement)
);

/**
 * GET route for registration page
 * Path: /registration (full path will be /account/registration)
 */
router.get("/registration", utilities.handleErrors(accountController.buildRegistration));

/**
 * GET route for registration page (alternative path /register)
 * AJOUTÉ: Pour supporter /account/register en GET
 */
router.get("/register", utilities.handleErrors(accountController.buildRegistration));

/**
 * POST route for registering new account
 * Path: /register (full path will be /account/register)
 */
router.post(
  "/register",
  regValidate.registrationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
);

/**
 * GET route for logout
 * Path: /logout (full path will be /account/logout)
 */
router.get("/logout", 
  utilities.handleErrors(accountController.accountLogout)
);

/* ****************************************
 * GET route to build account update view
 **************************************** */
router.get(
  "/update/:account_id",
  utilities.checkJWTToken,
  utilities.checkLogin,
  utilities.handleErrors(accountController.buildUpdateAccount)
);

/* ****************************************
 * POST route to process account update
 * Validation for account information update
 **************************************** */
router.post(
  "/update",
  utilities.checkJWTToken,
  utilities.checkLogin,
  accountValidate.accountUpdateRules(),
  accountValidate.checkAccountUpdateData,
  utilities.handleErrors(accountController.updateAccount)
);

/* ****************************************
 * POST route to process password update
 * Validation for password change
 **************************************** */
router.post(
  "/update-password",
  utilities.checkJWTToken,
  utilities.checkLogin,
  accountValidate.passwordUpdateRules(),
  accountValidate.checkPasswordUpdateData,
  utilities.handleErrors(accountController.updatePassword)
);

// Export routes for use in server.js
module.exports = router;