// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const utilities = require("../utilities")
const invValidate = require("../utilities/inventory-validation") 

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
router.post("/add-inventory", 
  invValidate.inventoryRules(),
  invValidate.checkInventoryData,
  utilities.handleErrors(invController.addInventory)
);

/* ****************************************
 * API Route: Get inventory by classification (JSON)
 * For AJAX requests from management view
 * ADD: This new route
 **************************************** */
router.get(
  "/getInventory/:classification_id", 
  utilities.handleErrors(invController.getInventoryJSON)
);

/* ****************************************
 * Route to build edit inventory view
 * For editing existing inventory items
 * ADD: This new route as requested
 **************************************** */
router.get(
  "/edit/:inv_id", 
  utilities.handleErrors(invController.editInventoryView)  
);

/* ****************************************
 * Route to process inventory update
 * For updating existing inventory items
 * ADD: This new route as requested
 **************************************** */
router.post(
  "/update/", 
  invValidate.inventoryRules(),     
  invValidate.checkUpdateData,        
  utilities.handleErrors(invController.updateInventory) 
);

/* ****************************************
 * Route to build delete confirmation view
 * ADD: This new route for deletion
 **************************************** */
router.get(
  "/delete/:inv_id", 
  utilities.handleErrors(invController.deleteInventoryView)  
);

/* ****************************************
 * Route to process inventory deletion
 * ADD: This new route for deletion
 **************************************** */
router.post(
  "/delete/", 
  utilities.handleErrors(invController.deleteInventory) 
);

module.exports = router;