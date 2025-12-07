// inventory-validation.js
const utilities = require(".")
const { body, validationResult } = require("express-validator")

/* ****************************************
 * Inventory Validation Rules
 **************************************** */
const invValidate = {}

/* ****************************************
 * Validation Rules for Adding Inventory
 **************************************** */
invValidate.inventoryRules = () => {
  return [
    // Classification is required
    body("classification_id")
      .notEmpty()
      .withMessage("Please select a classification."),

    // Make is required
    body("inv_make")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Please provide a make."),

    // Model is required
    body("inv_model")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Please provide a model."),

    // Year is required and must be a valid year
    body("inv_year")
      .trim()
      .isNumeric()
      .withMessage("Year must be a number.")
      .isLength({ min: 4, max: 4 })
      .withMessage("Please provide a valid 4-digit year.")
      .custom((value) => {
        const currentYear = new Date().getFullYear()
        if (value < 1900 || value > currentYear + 1) {
          throw new Error(`Year must be between 1900 and ${currentYear + 1}`)
        }
        return true
      }),

    // Description is required
    body("inv_description")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Please provide a description."),

    // Price is required and must be a positive number
    body("inv_price")
      .trim()
      .isNumeric()
      .withMessage("Price must be a number.")
      .custom((value) => {
        if (value <= 0) {
          throw new Error("Price must be greater than 0.")
        }
        return true
      }),

    // Miles is required and must be a positive number
    body("inv_miles")
      .trim()
      .isNumeric()
      .withMessage("Miles must be a number.")
      .custom((value) => {
        if (value < 0) {
          throw new Error("Miles cannot be negative.")
        }
        return true
      }),

    // Color is required
    body("inv_color")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Please provide a color.")
  ]
}

/* ****************************************
 * Check Inventory Data for Add
 * Returns errors to add-inventory view
 **************************************** */
invValidate.checkInventoryData = async (req, res, next) => {
  const { 
    classification_id, 
    inv_make, 
    inv_model, 
    inv_year,
    inv_description, 
    inv_price, 
    inv_miles, 
    inv_color,
    inv_image,
    inv_thumbnail
  } = req.body
  
  let errors = validationResult(req)
  
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    let classificationList = await utilities.buildClassificationList(classification_id)
    
    res.render("inventory/add-inventory", {
      title: "Add New Vehicle",
      nav,
      classificationList,
      errors: errors.array(),
      classification_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_price,
      inv_miles,
      inv_color,
      inv_image,
      inv_thumbnail
    })
    return
  }
  
  next()
}

/* ****************************************
 * Check Update Data for Edit
 * Returns errors to edit-inventory view
 **************************************** */
invValidate.checkUpdateData = async (req, res, next) => {
  const { 
    inv_id,
    classification_id, 
    inv_make, 
    inv_model, 
    inv_year,
    inv_description, 
    inv_price, 
    inv_miles, 
    inv_color,
    inv_image,
    inv_thumbnail
  } = req.body
  
  let errors = validationResult(req)
  
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    let classificationSelect = await utilities.buildClassificationList(classification_id)
    
    res.render("inventory/edit-inventory", {
      title: "Edit Vehicle",
      nav,
      classificationSelect,
      errors: errors.array(),
      inv_id,
      classification_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_price,
      inv_miles,
      inv_color,
      inv_image,
      inv_thumbnail
    })
    return
  }
  
  next()
}

module.exports = invValidate