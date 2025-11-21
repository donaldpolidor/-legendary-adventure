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

/**
 * GET route for login page
 * Path: /login (full path will be /account/login)
 */
router.get("/login", utilities.handleErrors(accountController.buildLogin));

/**
 * GET route for registration page
 * Path: /registration (full path will be /account/registration)
 */
router.get("/registration", utilities.handleErrors(accountController.buildRegistration));

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

// Export routes for use in server.js
module.exports = router;