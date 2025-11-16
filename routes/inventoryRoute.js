// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const utilities = require("../utilities")

// Route existante
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));

/* ****************************************
 * Route to build vehicle detail view
 * Assignment 3, Task 1
 **************************************** */
router.get("/detail/:invId", utilities.handleErrors(invController.buildDetail))

/* ****************************************
 * Error Route
 * Assignment 3, Task 3
 **************************************** */
router.get("/broken", utilities.handleErrors(invController.throwError))

module.exports = router;