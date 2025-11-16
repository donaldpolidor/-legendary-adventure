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
    next(error);
  }
};

module.exports = baseController;