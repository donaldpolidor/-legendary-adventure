const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  try {
    const classification_id = req.params.classificationId
    const data = await invModel.getInventoryByClassificationId(classification_id)
    
    // GESTION D'ERREUR - Si pas de données
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
    // Fallback pour les erreurs de base de données
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
    
    // GESTION D'ERREUR - Si véhicule non trouvé
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

module.exports = invCont