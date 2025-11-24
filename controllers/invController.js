const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ****************************************
 * Deliver Management View
 * *************************************** */
invCont.buildManagement = async function (req, res, next) {
  try {
    let nav = await utilities.getNav();
    res.render("./inventory/management", {
      title: "Inventory Management",
      nav,
      errors: null,
    });
  } catch (error) {
    console.error("buildManagement error:", error.message);
    let nav = utilities.getFallbackNav ? await utilities.getFallbackNav() : '<ul class="main-nav"><li><a href="/">Home</a></li></ul>';
    res.render("./inventory/management", {
      title: "Inventory Management",
      nav,
      errors: null,
    });
  }
}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  try {
    const classification_id = req.params.classificationId
    const data = await invModel.getInventoryByClassificationId(classification_id)
    
    // ERROR HANDLING - If no data
    if (!data || data.length === 0) {
      let nav = await utilities.getNav()
      return res.render("./inventory/classification", {
        title: "Vehicles",
        nav,
        grid: '<p class="notice">Sorry, no vehicles found in this category.</p>',
      })
    }
    
    const grid = await utilities.buildClassificationGrid(data)
    let nav = await utilities.getNav()
    const className = data[0].classification_name
    
    res.render("./inventory/classification", {
      title: className + " vehicles",
      nav,
      grid,
    })
  } catch (error) {
    console.error("buildByClassificationId error:", error.message)
    // Fallback for database errors
    let nav = utilities.getFallbackNav ? await utilities.getFallbackNav() : '<ul class="main-nav"><li><a href="/">Home</a></li></ul>'
    res.render("./inventory/classification", {
      title: "Vehicles",
      nav,
      grid: '<p class="notice">Error loading vehicles. Please try again later.</p>',
    })
  }
}

/* ***************************
 *  Build vehicle detail view
 * ************************** */
invCont.buildDetail = async function (req, res, next) {
  try {
    const invId = req.params.id
    const vehicle = await invModel.getInventoryById(invId)
    
    // ERROR HANDLING - If vehicle not found
    if (!vehicle) {
      let nav = await utilities.getNav()
      return res.render("./inventory/detail", {
        title: "Vehicle Not Found",
        nav,
        htmlData: '<p class="notice">Sorry, the requested vehicle could not be found.</p>',
      })
    }
    
    const htmlData = await utilities.buildSingleVehicleDisplay(vehicle)
    let nav = await utilities.getNav()
    const vehicleTitle = `${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}`
    
    res.render("./inventory/detail", {
      title: vehicleTitle,
      nav,
      htmlData,
    })
  } catch (error) {
    console.error("buildDetail error:", error.message)
    // Fallback pour les erreurs
    let nav = utilities.getFallbackNav ? await utilities.getFallbackNav() : '<ul class="main-nav"><li><a href="/">Home</a></li></ul>'
    res.render("./inventory/detail", {
      title: "Error",
      nav,
      htmlData: '<p class="notice">Error loading vehicle details. Please try again later.</p>',
    })
  }
}

/* ****************************************
 *  Process intentional error
 * ************************************ */
invCont.throwError = async function (req, res, next) {
  // Intentional error for testing
  throw new Error("Intentional 500 Error - This is a test error for assignment 3")
}


/* ****************************************
 * Deliver Add Classification View
 * *************************************** */
invCont.buildAddClassification = async function (req, res, next) {
  try {
    let nav = await utilities.getNav();
    res.render("./inventory/add-classification", {
      title: "Add New Classification",
      nav,
      errors: null,
    });
  } catch (error) {
    console.error("buildAddClassification error:", error.message);
    let nav = await utilities.getNav();
    res.render("./inventory/add-classification", {
      title: "Add New Classification",
      nav,
      errors: null,
    });
  }
}

/* ****************************************
 * Process Classification Addition
 * *************************************** */
invCont.addClassification = async function (req, res, next) {
  try {
    const { classification_name } = req.body;
    
    const result = await invModel.addClassification(classification_name);
    
    if (result && result.rows && result.rows.length > 0) {
      // Success - regenerate navigation with new classification
      req.flash("notice", `Classification "${classification_name}" was successfully added.`);
      res.redirect("/inv/");
    } else {
      req.flash("notice", "Sorry, adding the classification failed.");
      let nav = await utilities.getNav();
      res.status(501).render("./inventory/add-classification", {
        title: "Add New Classification",
        nav,
        errors: null,
      });
    }
  } catch (error) {
    console.error("addClassification error:", error.message);
    req.flash("notice", "Sorry, adding the classification failed.");
    let nav = await utilities.getNav();
    res.status(500).render("./inventory/add-classification", {
      title: "Add New Classification",
      nav,
      errors: null,
    });
  }
}

/* ****************************************
 * Deliver Add Inventory View
 * *************************************** */
invCont.buildAddInventory = async function (req, res, next) {
  try {
    let nav = await utilities.getNav();
    let classificationList = await utilities.buildClassificationList();
    res.render("./inventory/add-inventory", {
      title: "Add New Vehicle",
      nav,
      classificationList,
      errors: null,
    });
  } catch (error) {
    console.error("buildAddInventory error:", error.message);
    let nav = await utilities.getNav();
    let classificationList = await utilities.buildClassificationList();
    res.render("./inventory/add-inventory", {
      title: "Add New Vehicle",
      nav,
      classificationList,
      errors: null,
    });
  }
}

/* ****************************************
 * Process Inventory Addition
 * *************************************** */
invCont.addInventory = async function (req, res, next) {
  try {
    const {
      classification_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color
    } = req.body;
    
    const result = await invModel.addInventory(
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
      classification_id
    );
    
    if (result && result.rows && result.rows.length > 0) {
      // Success
      req.flash("notice", `Vehicle "${inv_make} ${inv_model}" was successfully added.`);
      res.redirect("/inv/");
    } else {
      req.flash("notice", "Sorry, adding the vehicle failed.");
      let nav = await utilities.getNav();
      let classificationList = await utilities.buildClassificationList(classification_id);
      res.status(501).render("./inventory/add-inventory", {
        title: "Add New Vehicle",
        nav,
        classificationList,
        errors: null,
        // Data persistence
        classification_id,
        inv_make,
        inv_model,
        inv_year,
        inv_description,
        inv_image,
        inv_thumbnail,
        inv_price,
        inv_miles,
        inv_color
      });
    }
  } catch (error) {
    console.error("addInventory error:", error.message);
    req.flash("notice", "Sorry, adding the vehicle failed.");
    let nav = await utilities.getNav();
    let classificationList = await utilities.buildClassificationList(req.body.classification_id);
    res.status(500).render("./inventory/add-inventory", {
      title: "Add New Vehicle",
      nav,
      classificationList,
      errors: null,
      // Data persistence
      ...req.body
    });
  }
}

module.exports = invCont;