const utilities = require("../utilities");

const baseController = {};

baseController.buildHome = async function(req, res, next) {
  try {
    let nav = await utilities.getNav();
    res.render("index", {
      title: "Home",
      nav,
      errors: null,
      message: null
    });
  } catch (error) {
    console.error("buildHome error:", error.message);
    // Use fallback navigation directly
    let nav = utilities.getFallbackNav();
    res.render("index", {
      title: "Home", 
      nav,
      errors: null,
      message: null
    });
  }
};

module.exports = baseController;