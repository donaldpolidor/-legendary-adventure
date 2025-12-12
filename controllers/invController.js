const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ****************************************
 * Deliver Management View
 * *************************************** */
invCont.buildManagement = async function (req, res, next) {
  try {
    let nav = await utilities.getNav();
    
    // ADD: Create the classification selection list
    const classificationSelect = await utilities.buildClassificationList()
    
    res.render("./inventory/management", {
      title: "Inventory Management",
      nav,
      classificationSelect, // ADD: Pass the selection list to the view
      errors: null,
    });
  } catch (error) {
    console.error("buildManagement error:", error.message);
    let nav = utilities.getFallbackNav ? await utilities.getFallbackNav() : '<ul class="main-nav"><li><a href="/">Home</a></li></ul>';
    
    // ADD: Even in error case
    let classificationSelect = '<select name="classification_id" id="classificationList" class="form-control" required><option value="">Error loading classifications</option></select>';
    
    res.render("./inventory/management", {
      title: "Inventory Management",
      nav,
      classificationSelect, // ADD: Pass the list even in case of error
      errors: null,
    });
  }
}

/* ****************************************
 * API: Get Inventory by Classification (JSON)
 * For AJAX requests from management view
 * *************************************** */
invCont.getInventoryJSON = async function (req, res, next) {
  try {
    const classification_id = req.params.classification_id;
    
    if (!classification_id) {
      return res.status(400).json({ 
        error: "Classification ID is required" 
      });
    }
    
    const data = await invModel.getInventoryByClassificationId(classification_id);
    
    // Format data for JSON response
    const formattedData = data.map(item => ({
      inv_id: item.inv_id,
      inv_make: item.inv_make,
      inv_model: item.inv_model,
      inv_year: item.inv_year,
      inv_description: item.inv_description,
      inv_image: item.inv_image,
      inv_thumbnail: item.inv_thumbnail,
      inv_price: item.inv_price,
      inv_miles: item.inv_miles,
      inv_color: item.inv_color,
      classification_id: item.classification_id,
      classification_name: item.classification_name
    }));
    
    res.setHeader('Content-Type', 'application/json');
    res.json(formattedData);
    
  } catch (error) {
    console.error("getInventoryJSON error:", error.message);
    res.status(500).json({ 
      error: "Error loading inventory data",
      message: error.message 
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
    // Fallback for errors
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
    // Console log pour déboguer
    console.log("Données reçues:", req.body);
    
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
    
    // VALIDER que tous les champs sont présents
    if (!inv_make || !inv_model) {
      req.flash("notice", "Le modèle et la marque sont requis.");
      let nav = await utilities.getNav();
      let classificationList = await utilities.buildClassificationList(classification_id);
      return res.render("./inventory/add-inventory", {
        title: "Add New Vehicle",
        nav,
        classificationList,
        errors: null,
        ...req.body
      });
    }
    
    // Créer un objet avec toutes les données
    const invData = {
      inv_make,
      inv_model,
      inv_year: parseInt(inv_year),
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price: parseFloat(inv_price),
      inv_miles: parseInt(inv_miles),
      inv_color,
      classification_id: parseInt(classification_id)
    };
    
    console.log("Données envoyées au modèle:", invData);
    
    // Appeler le modèle CORRECTEMENT avec un objet
    const result = await invModel.addInventory(invData);
    
    if (result) {
      // Success
      req.flash("notice", `Vehicle "${inv_make} ${inv_model}" was successfully added.`);
      return res.redirect("/inv/");
    } else {
      throw new Error("Failed to add vehicle to database");
    }
  } catch (error) {
    console.error("addInventory error:", error.message);
    req.flash("notice", "Sorry, adding the vehicle failed: " + error.message);
    
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

/* ***************************
 *  Build edit inventory view
 * ************************** */
invCont.editInventoryView = async function (req, res, next) {
  try {
    const inv_id = parseInt(req.params.inv_id)
    
    if (!inv_id || isNaN(inv_id)) {
      req.flash("notice", "Invalid vehicle ID.");
      return res.redirect("/inv/");
    }
    
    let nav = await utilities.getNav()
    const itemData = await invModel.getInventoryById(inv_id)
    
    if (!itemData) {
      req.flash("notice", "Vehicle not found.");
      return res.redirect("/inv/");
    }
    
    const classificationSelect = await utilities.buildClassificationList(itemData.classification_id)
    const itemName = `${itemData.inv_make} ${itemData.inv_model}`
    
    res.render("./inventory/edit-inventory", {
      title: "Edit " + itemName,
      nav,
      classificationSelect: classificationSelect,
      errors: null,
      inv_id: itemData.inv_id,
      inv_make: itemData.inv_make,
      inv_model: itemData.inv_model,
      inv_year: itemData.inv_year,
      inv_description: itemData.inv_description,
      inv_image: itemData.inv_image,
      inv_thumbnail: itemData.inv_thumbnail,
      inv_price: itemData.inv_price,
      inv_miles: itemData.inv_miles,
      inv_color: itemData.inv_color,
      classification_id: itemData.classification_id
    })
  } catch (error) {
    console.error("editInventoryView error:", error.message);
    req.flash("notice", "Error loading edit page.");
    res.redirect("/inv/");
  }
}

/* ***************************
 *  Update Inventory Data
 * ************************** */
invCont.updateInventory = async function (req, res, next) {
  try {
    let nav = await utilities.getNav()
    const {
      inv_id,
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color,
      classification_id,
    } = req.body
    
    // Créer l'objet de données
    const invData = {
      inv_make,
      inv_model,
      inv_year: parseInt(inv_year),
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price: parseFloat(inv_price),
      inv_miles: parseInt(inv_miles),
      inv_color,
      classification_id: parseInt(classification_id)
    }
    
    const updateResult = await invModel.updateInventory(inv_id, invData)

    if (updateResult) {
      const itemName = updateResult.inv_make + " " + updateResult.inv_model
      req.flash("notice", `The ${itemName} was successfully updated.`)
      return res.redirect("/inv/")
    } else {
      throw new Error("Update failed");
    }
  } catch (error) {
    console.error("updateInventory error:", error.message);
    
    // In case of error, redisplay the form with the data
    let nav = await utilities.getNav();
    const {
      inv_id,
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color,
      classification_id,
    } = req.body;
    
    const classificationSelect = await utilities.buildClassificationList(classification_id);
    const itemName = `${inv_make} ${inv_model}`;
    
    req.flash("notice", "Sorry, the update failed: " + error.message);
    
    res.status(500).render("inventory/edit-inventory", {
      title: "Edit " + itemName,
      nav,
      classificationSelect: classificationSelect,
      errors: null,
      inv_id,
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
    });
  }
}

/* ***************************
 * Delete Inventory Item
 * ************************** */
invCont.deleteInventoryView = async function (req, res, next) {
  try {
    const inv_id = parseInt(req.params.inv_id)
    
    if (!inv_id || isNaN(inv_id)) {
      req.flash("notice", "Invalid vehicle ID.");
      return res.redirect("/inv/");
    }
    
    let nav = await utilities.getNav()
    const itemData = await invModel.getInventoryById(inv_id)
    
    if (!itemData) {
      req.flash("notice", "Vehicle not found.");
      return res.redirect("/inv/");
    }
    
    const itemName = `${itemData.inv_make} ${itemData.inv_model}`
    
    res.render("./inventory/delete-confirm", {
      title: "Delete " + itemName,
      nav,
      errors: null,
      inv_id: itemData.inv_id,
      inv_make: itemData.inv_make,
      inv_model: itemData.inv_model,
      inv_year: itemData.inv_year,
      inv_price: itemData.inv_price
    })
  } catch (error) {
    console.error("deleteInventoryView error:", error.message);
    req.flash("notice", "Error loading delete page.");
    res.redirect("/inv/");
  }
}

/* ***************************
 * Process Inventory Deletion
 * ************************** */
invCont.deleteInventory = async function (req, res, next) {
  try {
    const { inv_id } = req.body;
    
    if (!inv_id) {
      req.flash("notice", "Invalid vehicle ID.");
      return res.redirect("/inv/");
    }
    
    const itemData = await invModel.getInventoryById(inv_id);
    if (!itemData) {
      req.flash("notice", "Vehicle not found.");
      return res.redirect("/inv/");
    }
    
    const result = await invModel.deleteInventory(inv_id);
    
    if (result) {
      const itemName = `${itemData.inv_make} ${itemData.inv_model}`;
      req.flash("notice", `The ${itemName} was successfully deleted.`);
      return res.redirect("/inv/");
    } else {
      throw new Error("Delete failed");
    }
  } catch (error) {
    console.error("deleteInventory error:", error.message);
    req.flash("notice", "Sorry, deleting the vehicle failed: " + error.message);
    res.redirect("/inv/");
  }
}

module.exports = invCont;