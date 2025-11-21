/* ******************************************
 * Base Controller
 * Contains the main controller functions
 *******************************************/
const utilities = require("../utilities");

const baseController = {};

/**
 * Build the home page
 * @param {object} req - Request object
 * @param {object} res - Response object
 * @param {function} next - Next middleware function
 */
baseController.buildHome = async function(req, res, next) {
  try {
    // Get navigation data
    let nav = await utilities.getNav();
    
    // Render the home page
    res.render("index", {
      title: "Home",
      nav,
      errors: null,
      message: null
    });
  } catch (error) {
    // Log any errors that occur
    console.error("buildHome error:", error.message);
    
    // Use fallback navigation in case of error
    let nav = utilities.getFallbackNav();
    
    // Render the home page with fallback navigation
    res.render("index", {
      title: "Home", 
      nav,
      errors: null,
      message: null
    });
  }
};

// Export the controller
module.exports = baseController;