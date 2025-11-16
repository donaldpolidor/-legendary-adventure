const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const className = data[0].classification_name
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  })
}

/* ***************************
 *  Build vehicle detail view
 *  Assignment 3, Task 1
 * ************************** */
invCont.buildDetail = async function (req, res, next) {
  const inv_id = req.params.invId
  const vehicleData = await invModel.getInventoryById(inv_id)
  
  if (!vehicleData) {
    return next({ status: 404, message: "Vehicle not found" })
  }
  
  const htmlData = await utilities.buildSingleVehicleDisplay(vehicleData)
  let nav = await utilities.getNav()
  const vehicleTitle = `${vehicleData.inv_year} ${vehicleData.inv_make} ${vehicleData.inv_model}`
  
  res.render("./inventory/detail", {
    title: vehicleTitle,
    nav,
    htmlData,
  })
}

/* ****************************************
 *  Process intentional error
 *  Assignment 3, Task 3
 * ************************************ */
invCont.throwError = async function (req, res, next) {
  // Intentional error for testing
  throw new Error("Intentional 500 Error - This is a test error for assignment 3")
}

module.exports = invCont