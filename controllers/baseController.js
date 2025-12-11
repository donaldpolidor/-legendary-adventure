/* ******************************************
 * Base Controller
 * Handles basic page rendering
 *******************************************/

const utilities = require("../utilities/");

/* ****************************************
 * Build home page
 * *************************************** */
async function buildHome(req, res, next) {
  try {
    let nav = await utilities.getNav();
    res.render("index", {
      title: "Home",
      nav,
      errors: null,
    });
  } catch (error) {
    console.error("buildHome error:", error);
    next(error);
  }
}

module.exports = {
  buildHome
};