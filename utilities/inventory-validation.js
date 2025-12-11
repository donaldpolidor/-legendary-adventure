const utilities = require("./");
const { body, validationResult } = require("express-validator");

/* ************************
 * Inventory Validation Rules
 ************************** */
const inventoryRules = () => {
  return [
    // Classification ID
    body("classification_id")
      .notEmpty()
      .withMessage("Please select a classification")
      .isInt()
      .withMessage("Classification must be a valid number"),
    
    // Make
    body("inv_make")
      .trim()
      .notEmpty()
      .withMessage("Please provide a vehicle make")
      .isLength({ min: 1 })
      .withMessage("Make must be at least 1 character long"),
    
    // Model
    body("inv_model")
      .trim()
      .notEmpty()
      .withMessage("Please provide a vehicle model")
      .isLength({ min: 1 })
      .withMessage("Model must be at least 1 character long"),
    
    // Year
    body("inv_year")
      .trim()
      .notEmpty()
      .withMessage("Please provide a vehicle year")
      .isInt({ min: 1900, max: new Date().getFullYear() + 1 })
      .withMessage(`Year must be between 1900 and ${new Date().getFullYear() + 1}`),
    
    // Description
    body("inv_description")
      .trim()
      .notEmpty()
      .withMessage("Please provide a vehicle description")
      .isLength({ min: 10 })
      .withMessage("Description must be at least 10 characters long"),
    
    // Price
    body("inv_price")
      .trim()
      .notEmpty()
      .withMessage("Please provide a vehicle price")
      .isFloat({ min: 0 })
      .withMessage("Price must be a positive number"),
    
    // Miles
    body("inv_miles")
      .trim()
      .notEmpty()
      .withMessage("Please provide vehicle mileage")
      .isInt({ min: 0 })
      .withMessage("Mileage must be a positive number"),
    
    // Color
    body("inv_color")
      .trim()
      .notEmpty()
      .withMessage("Please provide a vehicle color")
      .isLength({ min: 3 })
      .withMessage("Color must be at least 3 characters long"),
    
    // Image paths (optional but with validation)
    body("inv_image")
      .trim()
      .optional({ checkFalsy: true })
      .isLength({ max: 255 })
      .withMessage("Image path is too long"),
    
    body("inv_thumbnail")
      .trim()
      .optional({ checkFalsy: true })
      .isLength({ max: 255 })
      .withMessage("Thumbnail path is too long")
  ];
};

/* ************************
 * Check Inventory Data
 ************************** */
const checkInventoryData = async (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    let classificationList = await utilities.buildClassificationList(req.body.classification_id);
    
    res.render("inventory/add-inventory", {
      title: "Add New Vehicle",
      nav,
      classificationList,
      errors: errors.array(),
      // Data persistence
      ...req.body
    });
    return;
  }
  next();
};

/* ************************
 * Check Update Data (for editing)
 ************************** */
const checkUpdateData = async (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    let classificationList = await utilities.buildClassificationList(req.body.classification_id);
    const { inv_id, inv_make, inv_model } = req.body;
    const itemName = `${inv_make} ${inv_model}`;
    
    res.render("inventory/edit-inventory", {
      title: "Edit " + itemName,
      nav,
      classificationSelect: classificationList,
      errors: errors.array(),
      // Data persistence
      ...req.body
    });
    return;
  }
  next();
};

module.exports = {
  inventoryRules,
  checkInventoryData,
  checkUpdateData
};