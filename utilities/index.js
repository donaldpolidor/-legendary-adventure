const jwt = require("jsonwebtoken") 
require("dotenv").config() 

const Util = {}

// DONNÉES MOCKÉES pour la navigation (temporaire)
const mockClassifications = [
  { classification_id: 1, classification_name: 'Sedan' },
  { classification_id: 2, classification_name: 'Sport' },
  { classification_id: 3, classification_name: 'SUV' },
  { classification_id: 4, classification_name: 'Truck' },
  { classification_id: 5, classification_name: 'Custom' }
]

// Cache pour éviter de charger le modèle multiple fois
let invModelCache = null;

/* ************************
 * Charger le modèle une seule fois
 ************************** */
const loadInventoryModel = () => {
  if (!invModelCache) {
    try {
      invModelCache = require("../models/inventory-model");
    } catch (error) {
      console.error("Failed to load inventory model:", error.message);
      invModelCache = null;
    }
  }
  return invModelCache;
};

/* ************************
 * Constructs the nav HTML unordered list
 * VERSION SIMPLIFIÉE ET SÛRE
 ************************** */
Util.getNav = async function () {
  try {
    // D'ABORD essayer les données mockées pour éviter les erreurs DB
    let data = mockClassifications;
    
    // Essayer la DB SEULEMENT si on est sûr qu'elle fonctionne
    try {
      const model = loadInventoryModel();
      if (model && typeof model.getClassifications === 'function') {
        // Ajouter un timeout pour éviter les blocages
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Database timeout')), 5000);
        });
        
        const dbPromise = model.getClassifications();
        const dbResult = await Promise.race([dbPromise, timeoutPromise]);
        
        if (dbResult && Array.isArray(dbResult) && dbResult.length > 0) {
          data = dbResult;
        }
      }
    } catch (dbError) {
      // Silencieux - utiliser les données mockées
      // console.log("Using mock classifications:", dbError.message);
    }
    
    let list = "<ul class='main-nav'>";
    list += '<li><a href="/" title="Home page">Home</a></li>';
    
    data.forEach((row) => {
      list += "<li>";
      list += '<a href="/inv/type/' + row.classification_id + 
              '" title="See our inventory of ' + row.classification_name + 
              ' vehicles">' + row.classification_name + "</a>";
      list += "</li>";
    });
    
    list += "</ul>";
    return list;
  } catch (error) {
    console.error("getNav error (using mock):", error.message);
    return Util.getFallbackNav();
  }
}

/* **************************************
 * Fallback navigation when DB fails
 ************************************** */
Util.getFallbackNav = function () {
  return `<ul class="main-nav">
      <li><a href="/" title="Home page">Home</a></li>
      <li><a href="/inv/type/1" title="Sedan Vehicles">Sedan</a></li>
      <li><a href="/inv/type/2" title="Sport Vehicles">Sport</a></li>
      <li><a href="/inv/type/3" title="SUV Vehicles">SUV</a></li>
      <li><a href="/inv/type/4" title="Truck Vehicles">Truck</a></li>
      <li><a href="/inv/type/5" title="Custom Vehicles">Custom</a></li>
    </ul>`;
}

/* **************************************
 * Build the classification view HTML
 * ************************************ */
Util.buildClassificationGrid = async function(data){
  try {
    let grid = '';
    if(data && data.length > 0){
      grid = '<ul id="inv-display" class="classification-grid">';
      data.forEach(vehicle => { 
        const safeThumbnail = vehicle.inv_thumbnail || '/images/vehicles/no-image.jpg';
        const safeMake = vehicle.inv_make || '';
        const safeModel = vehicle.inv_model || '';
        const formattedPrice = vehicle.inv_price ? 
          new Intl.NumberFormat('en-US').format(vehicle.inv_price) : 'N/A';
        
        grid += '<li class="vehicle-card">';
        grid += '<a href="/inv/detail/'+ vehicle.inv_id + 
                '" title="View ' + safeMake + ' '+ safeModel + 
                ' details"><img src="' + safeThumbnail + 
                '" alt="Image of '+ safeMake + ' ' + safeModel + 
                ' on CSE Motors" class="vehicle-thumbnail" /></a>';
        grid += '<div class="namePrice">';
        grid += '<hr />';
        grid += '<h2>';
        grid += '<a href="/inv/detail/' + vehicle.inv_id +'" title="View ' + 
                safeMake + ' ' + safeModel + ' details">' + 
                safeMake + ' ' + safeModel + '</a>';
        grid += '</h2>';
        grid += '<span class="vehicle-price">$' + formattedPrice + '</span>';
        grid += '</div>';
        grid += '</li>';
      });
      grid += '</ul>';
    } else { 
      grid = '<p class="notice">Sorry, no matching vehicles could be found.</p>';
    }
    return grid;
  } catch (error) {
    console.error("buildClassificationGrid error:", error);
    return '<p class="notice">Error loading vehicles.</p>';
  }
}

/* ****************************************
 * Build classification list HTML
 * OPTIMISÉ : Utiliser mock si DB échoue
 * *************************************** */
Util.buildClassificationList = async function (classification_id = null) {
  try {
    // D'abord utiliser les données mockées
    let data = mockClassifications;
    
    // Essayer la DB seulement si disponible
    try {
      const model = loadInventoryModel();
      if (model && typeof model.getClassifications === 'function') {
        const dbData = await model.getClassifications();
        if (dbData && Array.isArray(dbData) && dbData.length > 0) {
          data = dbData;
        }
      }
    } catch (error) {
      // Rester avec les données mockées
    }
    
    let classificationList = '<select name="classification_id" id="classificationList" class="form-control" required>';
    classificationList += "<option value=''>Choose a Classification</option>";
    data.forEach((row) => {
      const safeName = row.classification_name || '';
      classificationList += '<option value="' + row.classification_id + '"';
      if (classification_id != null && parseInt(row.classification_id) === parseInt(classification_id)) {
        classificationList += " selected ";
      }
      classificationList += ">" + safeName + "</option>";
    });
    classificationList += "</select>";
    return classificationList;
  } catch (error) {
    console.error("buildClassificationList error (using mock):", error);
    // Retourner toujours un HTML utilisable
    return `<select name="classification_id" id="classificationList" class="form-control" required>
        <option value="">Choose a Classification</option>
        <option value="1">Sedan</option>
        <option value="2">Sport</option>
        <option value="3">SUV</option>
        <option value="4">Truck</option>
        <option value="5">Custom</option>
      </select>`;
  }
}

/* ****************************************
 * Build the vehicle detail HTML
 **************************************** */
Util.buildSingleVehicleDisplay = async function(vehicle) {
  try {
    if (!vehicle || typeof vehicle !== 'object') {
      return '<p class="notice">Vehicle not found.</p>';
    }

    // Données sécurisées
    const safeMake = vehicle.inv_make || '';
    const safeModel = vehicle.inv_model || '';
    const safeYear = vehicle.inv_year || '';
    const safeDescription = vehicle.inv_description || 'No description available.';
    const safeMpg = vehicle.inv_mpg || 'Not specified';
    const safeColor = vehicle.inv_color || 'Not specified';

    // Format price
    const formattedPrice = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(vehicle.inv_price || 0);

    // Format mileage
    const formattedMileage = new Intl.NumberFormat('en-US').format(vehicle.inv_miles || 0);

    let svd = '<div class="vehicle-detail-container">';
    
    // Certification banner
    svd += '<div class="certification-banner">';
    svd += '<p class="certification-text">This vehicle has passed inspection by an ASE-certified technician</p>';
    svd += '</div>';
    
    svd += '<div class="vehicle-detail-grid">';
    svd += '<div class="vehicle-image-section">';
    svd += '<img src="' + (vehicle.inv_image || '/images/vehicles/no-image.jpg') + 
           '" alt="Image of ' + safeMake + ' ' + safeModel + 
           ' on CSE Motors" class="vehicle-detail-image">';
    svd += '</div>';
    
    svd += '<div class="vehicle-info-section">';
    
    // Vehicle title
    svd += '<h1 class="vehicle-detail-title">' + safeYear + ' ' + safeMake + ' ' + safeModel + '</h1>';
    
    // Price section
    svd += '<div class="price-section">';
    svd += '<div class="no-haggle">No-Haggle Price</div>';
    svd += '<div class="vehicle-price-large">' + formattedPrice + '</div>';
    svd += '<div class="vehicle-mileage">' + formattedMileage + ' miles</div>';
    svd += '</div>';
    
    // Action buttons
    svd += '<div class="action-buttons">';
    svd += '<button type="button" class="btn-estimate">ESTIMATE PAYMENTS</button>';
    svd += '<button type="button" class="btn-purchase">START MY PURCHASE</button>';
    svd += '</div>';
    
    // Detailed specifications
    svd += '<div class="vehicle-specs-detailed">';
    svd += '<div class="specs-grid">';
    svd += '<div class="spec-item"><span class="spec-label">Year:</span><span class="spec-value">' + safeYear + '</span></div>';
    svd += '<div class="spec-item"><span class="spec-label">Mileage:</span><span class="spec-value">' + formattedMileage + ' miles</span></div>';
    svd += '<div class="spec-item"><span class="spec-label">Color:</span><span class="spec-value">' + safeColor + '</span></div>';
    svd += '<div class="spec-item"><span class="spec-label">MPG:</span><span class="spec-value">' + safeMpg + '</span></div>';
    svd += '<div class="spec-item"><span class="spec-label">Fuel Type:</span><span class="spec-value">Gasoline</span></div>';
    svd += '<div class="spec-item"><span class="spec-label">Drivetrain:</span><span class="spec-value">Front Wheel Drive</span></div>';
    svd += '<div class="spec-item"><span class="spec-label">Transmission:</span><span class="spec-value">Automatic</span></div>';
    svd += '</div>';
    svd += '</div>';
    
    // Secondary action buttons
    svd += '<div class="secondary-actions">';
    svd += '<button type="button" class="btn-secondary">SCHEDULE TEST DRIVE</button>';
    svd += '<button type="button" class="btn-secondary">APPLY FOR FINANCING</button>';
    svd += '</div>';
    
    // Contact section
    svd += '<div class="contact-section">';
    svd += '<h3>CONTACT US:</h3>';
    svd += '<div class="contact-info">';
    svd += '<p><strong>Call Us:</strong> 800-396-7886</p>';
    svd += '<p><strong>Visit Us:</strong> CSE Motors Showroom</p>';
    svd += '</div>';
    svd += '</div>';
    
    // Vehicle description
    svd += '<div class="vehicle-description">';
    svd += '<h3>Vehicle Description</h3>';
    svd += '<p>' + safeDescription + '</p>';
    svd += '<p class="prior-use">The principal prior use of this vehicle was rental/service.</p>';
    svd += '</div>';
    
    svd += '</div></div></div>';
    
    return svd;
  } catch (error) {
    console.error("buildSingleVehicleDisplay error:", error);
    return '<p class="error-message">Error loading vehicle details.</p>';
  }
}

/* ****************************************
 * Middleware For Handling Errors
 * CORRECTION : Gestion propre des erreurs
 **************************************** */
Util.handleErrors = fn => (req, res, next) => {
  return Promise.resolve(fn(req, res, next)).catch(next);
}

/* ****************************************
 * Middleware to check token validity
 * CORRECTION : Gestion d'erreur améliorée
 **************************************** */
Util.checkJWTToken = (req, res, next) => {
  const token = req.cookies?.jwt;
  
  if (!token) {
    return next();
  }

  jwt.verify(
    token,
    process.env.ACCESS_TOKEN_SECRET,
    function (err, accountData) {
      if (err) {
        req.flash("notice", "Please log in");
        res.clearCookie("jwt");
        return res.redirect("/account/login");
      }
      res.locals.accountData = accountData;
      res.locals.loggedin = 1;
      next();
    }
  );
}

/* ****************************************
 *  Check Login
 * ************************************ */
Util.checkLogin = (req, res, next) => {
  if (res.locals.loggedin) {
    next();
  } else {
    req.flash("notice", "Please log in.");
    return res.redirect("/account/login");
  }
}

/* ****************************************
 * Check account type for authorization
 **************************************** */
Util.checkAccountType = (requiredType) => {
  return (req, res, next) => {
    if (res.locals.accountData && res.locals.accountData.account_type === requiredType) {
      return next();
    }
    req.flash("notice", "You don't have permission to access this page.");
    res.redirect("/account/login");
  };
}

module.exports = Util;