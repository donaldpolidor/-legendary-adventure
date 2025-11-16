const invModel = require("../models/inventory-model")

const Util = {}

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function () {
  try {
    let data = await invModel.getClassifications()
    let list = "<ul class='main-nav'>"
    list += '<li><a href="/" title="Home page">Home</a></li>'
    data.rows.forEach((row) => {
      list += "<li>"
      list += '<a href="/inv/type/' + row.classification_id + 
              '" title="See our inventory of ' + row.classification_name + 
              ' vehicles">' + row.classification_name + "</a>"
      list += "</li>"
    })
    list += "</ul>"
    return list
  } catch (error) {
    console.error("getNav error:", error)
    return '<ul class="main-nav"><li><a href="/">Home</a></li></ul>'
  }
}

/* **************************************
 * Build the classification view HTML
 * ************************************ */
Util.buildClassificationGrid = async function(data){
  try {
    let grid = ''
    if(data.length > 0){
      grid = '<ul id="inv-display" class="classification-grid">'
      data.forEach(vehicle => { 
        grid += '<li class="vehicle-card">'
        grid += '<a href="/inv/detail/'+ vehicle.inv_id + 
                '" title="View ' + vehicle.inv_make + ' '+ vehicle.inv_model + 
                ' details"><img src="' + vehicle.inv_thumbnail + 
                '" alt="Image of '+ vehicle.inv_make + ' ' + vehicle.inv_model + 
                ' on CSE Motors" class="vehicle-thumbnail" /></a>'
        grid += '<div class="namePrice">'
        grid += '<hr />'
        grid += '<h2>'
        grid += '<a href="/inv/detail/' + vehicle.inv_id +'" title="View ' + 
                vehicle.inv_make + ' ' + vehicle.inv_model + ' details">' + 
                vehicle.inv_make + ' ' + vehicle.inv_model + '</a>'
        grid += '</h2>'
        grid += '<span class="vehicle-price">$' + 
                new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>'
        grid += '</div>'
        grid += '</li>'
      })
      grid += '</ul>'
    } else { 
      grid = '<p class="notice">Sorry, no matching vehicles could be found.</p>'
    }
    return grid
  } catch (error) {
    console.error("buildClassificationGrid error:", error)
    return '<p class="notice">Error loading vehicles.</p>'
  }
}

/* ****************************************
 * Build the vehicle detail HTML
 * Assignment 3, Task 1
 **************************************** */
Util.buildSingleVehicleDisplay = async function(vehicle) {
  try {
    // Format price with proper currency formatting
    const formattedPrice = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(vehicle.inv_price)

    // Format mileage with commas
    const formattedMileage = new Intl.NumberFormat('en-US').format(vehicle.inv_miles)

    let svd = '<div class="vehicle-detail-container">'
    svd += '<div class="vehicle-detail-grid">'
    
    // Image section
    svd += '<div class="vehicle-image-section">'
    svd += '<img src="' + vehicle.inv_image + 
           '" alt="Image of ' + vehicle.inv_make + ' ' + vehicle.inv_model + 
           ' on CSE Motors" class="vehicle-detail-image">'
    svd += '</div>'
    
    // Info section
    svd += '<div class="vehicle-info-section">'
    svd += '<h1 class="vehicle-detail-title">' + vehicle.inv_make + ' ' + vehicle.inv_model + '</h1>'
    svd += '<div class="vehicle-price-large">' + formattedPrice + '</div>'
    
    // Specifications
    svd += '<div class="vehicle-specs">'
    svd += '<div class="spec-item">'
    svd += '<span class="spec-label">Year:</span>'
    svd += '<span class="spec-value">' + vehicle.inv_year + '</span>'
    svd += '</div>'
    svd += '<div class="spec-item">'
    svd += '<span class="spec-label">Mileage:</span>'
    svd += '<span class="spec-value">' + formattedMileage + ' miles</span>'
    svd += '</div>'
    svd += '<div class="spec-item">'
    svd += '<span class="spec-label">Color:</span>'
    svd += '<span class="spec-value">' + vehicle.inv_color + '</span>'
    svd += '</div>'
    svd += '</div>'
    
    // Description
    svd += '<div class="vehicle-description">'
    svd += '<h3>Vehicle Description</h3>'
    svd += '<p>' + vehicle.inv_description + '</p>'
    svd += '</div>'
    
    svd += '</div>' // Close info section
    svd += '</div>' // Close grid
    svd += '</div>' // Close container
    
    return svd
  } catch (error) {
    console.error("buildSingleVehicleDisplay error:", error)
    return '<p class="error-message">Error loading vehicle details.</p>'
  }
}

/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 **************************************** */
Util.handleErrors = fn => (req, res, next) => {
  return Promise.resolve(fn(req, res, next)).catch(next)
}

module.exports = Util