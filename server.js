/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/
/* ***********************
 * Require Statements
 *************************/
const express = require("express")
const expressLayouts = require("express-ejs-layouts")
const env = require("dotenv").config()
const app = express()
const staticRoutes = require("./routes/static") // Renommé pour éviter conflit
const baseController = require("./controllers/baseController")
const inventoryRoute = require("./routes/inventoryRoute")
const utilities = require('./utilities/index')
const session = require("express-session")
const pool = require('./database/')
const PostgreSqlStore = require('connect-pg-simple')(session)

/* ***********************
 * View Engine And Templates
 *************************/
app.set("view engine", "ejs")
app.use(expressLayouts)
app.set("layout", "./layouts/layout")

/* ***********************
 * Middleware
 * ************************/
// SERVIR LES FICHIERS STATIQUES - DOIT ÊTRE EN PREMIER
app.use(express.static("public"))

// Configuration des sessions
app.use(session({
  store: new PostgreSqlStore({
    createTableIfMissing: true,
    pool,
  }),
  secret: process.env.SESSION_SECRET || "fallback_secret_for_dev",
  resave: false,
  saveUninitialized: false,
  name: 'sessionId',
  cookie: {
    maxAge: 1000 * 60 * 60 * 24,
    secure: process.env.NODE_ENV === 'production'
  }
}))

// Express Messages Middleware
app.use(require('connect-flash')())
app.use(function(req, res, next){
  res.locals.messages = require('express-messages')(req, res)
  next()
})

/* ***********************
 * Routes
 *************************/
app.use(staticRoutes) // Utilise le nom corrigé

// Index Route - UNIQUEMENT ICI
app.get("/", utilities.handleErrors(baseController.buildHome))

// Inventory routes
app.use("/inv", inventoryRoute)

// File Not Found Route - must be last route in list
app.use(async (req, res, next) => {
  next({status: 404, message: 'Sorry, we appear to have lost that page.'})
})

/* ***********************
* Express Error Handler
* Place after all other middleware
*************************/
app.use(async (err, req, res, next) => {
  let nav;
  try {
    nav = await utilities.getNav();
  } catch (navError) {
    console.error("Navigation error:", navError);
    nav = '<ul><li><a href="/">Home</a></li></ul>';
  }
  
  console.error(`Error at: "${req.originalUrl}": ${err.message}`)
  
  let message;
  if (err.status == 404) {
    message = err.message;
  } else {
    message = "Oh no! There was a crash. Maybe try a different route?";
  }
  
  res.render("errors/error", {
    title: err.status || "Server Error",
    message,
    nav,
  });
})

/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/
const port = process.env.PORT || 5500
const host = process.env.HOST || 'localhost'

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`)
})