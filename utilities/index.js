const invModel = require("../models/inventory-model")

const Util = {}

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function () {
  try {
    let data = await invModel.getClassifications()
    
    // GESTION D'ERREUR AMÉLIORÉE
    if (!data || !data.rows || !Array.isArray(data.rows)) {
      console.error("Invalid data structure from database")
      return Util.getFallbackNav() // CORRECTION: Util au lieu de this
    }
    
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
    console.error("getNav error:", error.message)
    return Util.getFallbackNav() // CORRECTION: Util au lieu de this
  }
}

/* **************************************
 * Fallback navigation when DB fails
 ************************************** */
Util.getFallbackNav = function () {
  console.log("Using fallback navigation")
  return `
    <ul class="main-nav">
      <li><a href="/" title="Home page">Home</a></li>
      <li><a href="/inv/type/1" title="Custom Vehicles">Custom</a></li>
      <li><a href="/inv/type/2" title="Sedan Vehicles">Sedan</a></li>
      <li><a href="/inv/type/3" title="Sport Vehicles">Sport</a></li>
      <li><a href="/inv/type/4" title="SUV Vehicles">SUV</a></li>
      <li><a href="/inv/type/5" title="Truck Vehicles">Truck</a></li>
    </ul>
  `
}

/* **************************************
 * Build the classification view HTML
 * ************************************ */
Util.buildClassificationGrid = async function(data){
  try {
    let grid = ''
    if(data && data.length > 0){
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
 **************************************** */
Util.buildSingleVehicleDisplay = async function(vehicle) {
  try {
    if (!vehicle) {
      return '<p class="notice">Vehicle not found.</p>'
    }

    const formattedPrice = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(vehicle.inv_price)

    const formattedMileage = new Intl.NumberFormat('en-US').format(vehicle.inv_miles)

    let svd = '<div class="vehicle-detail-container">'
    svd += '<div class="vehicle-detail-grid">'
    svd += '<div class="vehicle-image-section">'
    svd += '<img src="' + vehicle.inv_image + 
           '" alt="Image of ' + vehicle.inv_make + ' ' + vehicle.inv_model + 
           ' on CSE Motors" class="vehicle-detail-image">'
    svd += '</div>'
    svd += '<div class="vehicle-info-section">'
    svd += '<h1 class="vehicle-detail-title">' + vehicle.inv_make + ' ' + vehicle.inv_model + '</h1>'
    svd += '<div class="vehicle-price-large">' + formattedPrice + '</div>'
    svd += '<div class="vehicle-specs">'
    svd += '<div class="spec-item"><span class="spec-label">Year:</span><span class="spec-value">' + vehicle.inv_year + '</span></div>'
    svd += '<div class="spec-item"><span class="spec-label">Mileage:</span><span class="spec-value">' + formattedMileage + ' miles</span></div>'
    svd += '<div class="spec-item"><span class="spec-label">Color:</span><span class="spec-value">' + vehicle.inv_color + '</span></div>'
    svd += '</div>'
    svd += '<div class="vehicle-description"><h3>Vehicle Description</h3><p>' + vehicle.inv_description + '</p></div>'
    svd += '</div></div></div>'
    
    return svd
  } catch (error) {
    console.error("buildSingleVehicleDisplay error:", error)
    return '<p class="error-message">Error loading vehicle details.</p>'
  }
}

/* ****************************************
 * Middleware For Handling Errors
 **************************************** */
Util.handleErrors = fn => (req, res, next) => {
  return Promise.resolve(fn(req, res, next)).catch(next)
}

module.exports = Util