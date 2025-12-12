const invModel = require("../models/inventory-model")
const jwt = require("jsonwebtoken") 
require("dotenv").config() 

const Util = {}

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function () {
  try {
    let data = await invModel.getClassifications()
    
    // CORRECTION : data est directement un array
    if (!data || !Array.isArray(data)) {
      console.error("Invalid data structure from database - expected array, got:", typeof data)
      return Util.getFallbackNav()
    }
    
    let list = "<ul class='main-nav'>"
    list += '<li><a href="/" title="Home page">Home</a></li>'
    
    // CORRECTION : Utiliser data directement
    data.forEach((row) => {
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
    return Util.getFallbackNav()
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
      <li><a href="/inv/type/1" title="Sedan Vehicles">Sedan</a></li>
      <li><a href="/inv/type/2" title="Sport Vehicles">Sport</a></li>
      <li><a href="/inv/type/3" title="SUV Vehicles">SUV</a></li>
      <li><a href="/inv/type/4" title="Truck Vehicles">Truck</a></li>
      <li><a href="/inv/type/5" title="Custom Vehicles">Custom</a></li>
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

    // Format price with USD and commas
    const formattedPrice = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(vehicle.inv_price)

    // Format mileage with commas
    const formattedMileage = new Intl.NumberFormat('en-US').format(vehicle.inv_miles)

    // Get correct color based on vehicle model
    const getVehicleColor = (make, model) => {
      const colorMap = {
        'Batmobile': 'Black',
        'FBI': 'Brown',
        'Dog': 'White',
        'Aerocar': 'Yellow & Green',
        'Monster': 'Blue',
        'Mystery': 'Blue',
        'Camaro': 'Black',
        'Lamborghini': 'White',
        'Jeep': 'Yellow',
        'Cadillac': 'Black',
        'Spartan': 'Red',
        'Hummer': 'Silver',
        'Mechanic': 'Rust',
        'Model T': 'Black',
        'Crown Victoria': 'White'
      }

      if (colorMap[model]) return colorMap[model]
      if (colorMap[make]) return colorMap[make]
      
      return vehicle.inv_color || 'Not specified'
    }

    const vehicleColor = getVehicleColor(vehicle.inv_make, vehicle.inv_model)

    let svd = '<div class="vehicle-detail-container">'
    
    // Certification banner
    svd += '<div class="certification-banner">'
    svd += '<p class="certification-text">This vehicle has passed inspection by an ASE-certified technician</p>'
    svd += '</div>'
    
    svd += '<div class="vehicle-detail-grid">'
    svd += '<div class="vehicle-image-section">'
    svd += '<img src="' + (vehicle.inv_image || '/images/vehicles/no-image.jpg') + 
           '" alt="Image of ' + vehicle.inv_make + ' ' + vehicle.inv_model + 
           ' on CSE Motors" class="vehicle-detail-image">'
    svd += '</div>'
    
    svd += '<div class="vehicle-info-section">'
    
    // Vehicle title
    svd += '<h1 class="vehicle-detail-title">' + vehicle.inv_year + ' ' + vehicle.inv_make + ' ' + vehicle.inv_model + '</h1>'
    
    // Price section
    svd += '<div class="price-section">'
    svd += '<div class="no-haggle">No-Haggle Price</div>'
    svd += '<div class="vehicle-price-large">' + formattedPrice + '</div>'
    svd += '<div class="vehicle-mileage">' + formattedMileage + ' miles</div>'
    svd += '</div>'
    
    // Action buttons
    svd += '<div class="action-buttons">'
    svd += '<button class="btn-estimate">ESTIMATE PAYMENTS</button>'
    svd += '<button class="btn-purchase">START MY PURCHASE</button>'
    svd += '</div>'
    
    // Detailed specifications
    svd += '<div class="vehicle-specs-detailed">'
    svd += '<div class="specs-grid">'
    svd += '<div class="spec-item"><span class="spec-label">Year:</span><span class="spec-value">' + vehicle.inv_year + '</span></div>'
    svd += '<div class="spec-item"><span class="spec-label">Mileage:</span><span class="spec-value">' + formattedMileage + ' miles</span></div>'
    svd += '<div class="spec-item"><span class="spec-label">Color:</span><span class="spec-value">' + vehicleColor + '</span></div>'
    svd += '<div class="spec-item"><span class="spec-label">MPG:</span><span class="spec-value">' + (vehicle.inv_mpg || 'Not specified') + '</span></div>'
    svd += '<div class="spec-item"><span class="spec-label">Fuel Type:</span><span class="spec-value">Gasoline</span></div>'
    svd += '<div class="spec-item"><span class="spec-label">Drivetrain:</span><span class="spec-value">Front Wheel Drive</span></div>'
    svd += '<div class="spec-item"><span class="spec-label">Transmission:</span><span class="spec-value">Automatic</span></div>'
    svd += '</div>'
    svd += '</div>'
    
    // Secondary action buttons
    svd += '<div class="secondary-actions">'
    svd += '<button class="btn-secondary">SCHEDULE TEST DRIVE</button>'
    svd += '<button class="btn-secondary">APPLY FOR FINANCING</button>'
    svd += '</div>'
    
    // Contact section
    svd += '<div class="contact-section">'
    svd += '<h3>CONTACT US:</h3>'
    svd += '<div class="contact-info">'
    svd += '<p><strong>Call Us:</strong> 800-396-7886</p>'
    svd += '<p><strong>Visit Us:</strong> CSE Motors Showroom</p>'
    svd += '</div>'
    svd += '</div>'
    
    // Vehicle description
    svd += '<div class="vehicle-description">'
    svd += '<h3>Vehicle Description</h3>'
    svd += '<p>' + vehicle.inv_description + '</p>'
    svd += '<p class="prior-use">The principal prior use of this vehicle was rental/service.</p>'
    svd += '</div>'
    
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

/* ****************************************
 * Build classification list HTML
 * *************************************** */
Util.buildClassificationList = async function (classification_id = null) {
  try {
    let data = await invModel.getClassifications()
    
    // CORRECTION : data est directement un array
    if (!data || !Array.isArray(data)) {
      return '<select name="classification_id" id="classificationList" class="form-control" required><option value="">Error loading classifications</option></select>'
    }
    
    let classificationList = '<select name="classification_id" id="classificationList" class="form-control" required>'
    classificationList += "<option value=''>Choose a Classification</option>"
    data.forEach((row) => {
      classificationList += '<option value="' + row.classification_id + '"'
      if (classification_id != null && row.classification_id == classification_id) {
        classificationList += " selected "
      }
      classificationList += ">" + row.classification_name + "</option>"
    })
    classificationList += "</select>"
    return classificationList
  } catch (error) {
    console.error("buildClassificationList error:", error)
    return '<select name="classification_id" id="classificationList" class="form-control" required><option value="">Error loading classifications</option></select>'
  }
}

/* ****************************************
 * Middleware to check token validity
 **************************************** */
Util.checkJWTToken = (req, res, next) => {
  if (req.cookies.jwt) {
    jwt.verify(
      req.cookies.jwt,
      process.env.ACCESS_TOKEN_SECRET,
      function (err, accountData) {
        if (err) {
          req.flash("notice", "Please log in")
          res.clearCookie("jwt")
          return res.redirect("/account/login")
        }
        res.locals.accountData = accountData
        res.locals.loggedin = 1
        next()
      })
  } else {
    next()
  }
}

/* ****************************************
 *  Check Login
 * ************************************ */
Util.checkLogin = (req, res, next) => {
  if (res.locals.loggedin) {
    next()
  } else {
    req.flash("notice", "Please log in.")
    return res.redirect("/account/login")
  }
}

/* ****************************************
 * Check account type for authorization
 **************************************** */
Util.checkAccountType = (requiredType) => {
  return (req, res, next) => {
    if (res.locals.accountData && res.locals.accountData.account_type === requiredType) {
      return next()
    }
    req.flash("notice", "You don't have permission to access this page.")
    res.redirect("/account/login")
  }
}

module.exports = Util