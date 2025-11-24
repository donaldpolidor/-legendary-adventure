// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const utilities = require("../utilities")

/* ****************************************
 * Route to build management view
 * Task 1
 **************************************** */
router.get("/", utilities.handleErrors(invController.buildManagement))

// Route existing
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));

/* ****************************************
 * Route to build vehicle detail view
 * Assignment 3, Task 1
 **************************************** */
// CORRECTION: Change :invId to :id to match the controller
router.get("/detail/:id", utilities.handleErrors(invController.buildDetail))

/* ****************************************
 * Error Route
 * Assignment 3, Task 3
 **************************************** */
router.get("/broken", utilities.handleErrors(invController.throwError))

/* ****************************************
 * Route to build add classification view
 * Task 2
 **************************************** */
router.get("/add-classification", utilities.handleErrors(invController.buildAddClassification));

/* ****************************************
 * Route to process classification addition
 * Task 2
 **************************************** */
router.post("/add-classification", utilities.handleErrors(invController.addClassification));

/* ****************************************
 * Route to build add inventory view
 * Task 3
 **************************************** */
router.get("/add-inventory", utilities.handleErrors(invController.buildAddInventory));

/* ****************************************
 * Route to process inventory addition
 * Task 3
 **************************************** */
router.post("/add-inventory", utilities.handleErrors(invController.addInventory));

module.exports = router;