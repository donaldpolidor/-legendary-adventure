/* ******************************************
 * Base Controller
 * Handles basic page rendering
 *******************************************/

const utilities = require("../utilities/");

/* ****************************************
 * Build home page
 * CORRECTION : Simple et direct
 * *************************************** */
async function buildHome(req, res, next) {
  try {
    // Utiliser la navigation déjà dans res.locals (définie par le middleware)
    const nav = res.locals.nav || '<ul><li><a href="/">Home</a></li></ul>';
    
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