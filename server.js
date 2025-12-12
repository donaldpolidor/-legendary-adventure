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
const staticRoutes = require("./routes/static")
const baseController = require("./controllers/baseController")
const inventoryRoute = require("./routes/inventoryRoute")
const accountRoute = require("./routes/accountRoute") 
const utilities = require('./utilities/')
const session = require("express-session")
const cookieParser = require("cookie-parser")

/* ***********************
 * View Engine And Templates
 *************************/
app.set("view engine", "ejs")
app.use(expressLayouts)
app.set("layout", "./layouts/layout")

/* ***********************
 * Middleware
 * ************************/
// SERVE STATIC FILES
app.use(express.static("public"))

// Body Parser Middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Cookie Parser Middleware
app.use(cookieParser())

// SESSION CONFIGURATION - CORRECTION CRITIQUE
// Utiliser MemoryStore temporairement pour éviter les erreurs DB
app.use(session({
  store: new session.MemoryStore(), // TEMPORAIRE : MemoryStore au lieu de PostgreSQL
  secret: process.env.SESSION_SECRET || "fallback_secret_for_dev",
  resave: false,
  saveUninitialized: false,
  name: 'sessionId',
  cookie: {
    maxAge: 1000 * 60 * 60 * 24, // 24 heures
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  }
}))

// Express Messages Middleware
app.use(require('connect-flash')())
app.use(function(req, res, next){
  res.locals.messages = require('express-messages')(req, res)
  next()
})

// JWT Token Check Middleware 
app.use(utilities.checkJWTToken)

/* ****************************************
 * MIDDLEWARE DE NAVIGATION - OPTIMISÉ
 * CORRECTION : Éviter les appels DB multiples
 *****************************************/
let navigationCache = {
  data: null,
  timestamp: 0,
  ttl: 60000 // 1 minute de cache
};

app.use(async (req, res, next) => {
  try {
    const now = Date.now();
    
    // Utiliser le cache si disponible et récent
    if (navigationCache.data && (now - navigationCache.timestamp) < navigationCache.ttl) {
      res.locals.nav = navigationCache.data;
      return next();
    }
    
    // Sinon, charger la navigation AVEC GESTION D'ERREUR
    try {
      const nav = await utilities.getNav();
      res.locals.nav = nav;
      
      // Mettre en cache
      navigationCache.data = nav;
      navigationCache.timestamp = now;
      
    } catch (navError) {
      console.error("Navigation load failed, using fallback:", navError.message);
      // Navigation de secours SIMPLE
      res.locals.nav = '<ul class="main-nav"><li><a href="/">Home</a></li><li><a href="/inv/type/1">Sedan</a></li><li><a href="/inv/type/2">Sport</a></li><li><a href="/inv/type/3">SUV</a></li><li><a href="/inv/type/4">Truck</a></li><li><a href="/inv/type/5">Custom</a></li></ul>';
    }
    
  } catch (error) {
    console.error("Navigation middleware error:", error.message);
    // Navigation de secours ULTIME
    res.locals.nav = '<ul><li><a href="/">Home</a></li></ul>';
  }
  
  next();
});

/* ***********************
 * Routes
 *************************/
app.use(staticRoutes)

// Index Route 
app.get("/", utilities.handleErrors(baseController.buildHome))

// Inventory routes
app.use("/inv", inventoryRoute)

// Account routes
app.use("/account", accountRoute)

// File Not Found Route - must be last route in list
app.use(async (req, res, next) => {
  next({status: 404, message: 'Sorry, we appear to have lost that page.'})
})

/* ***********************
* Express Error Handler
* CORRECTION : Prévenir les réponses multiples
*************************/
app.use(async (err, req, res, next) => {
  // VÉRIFICATION CRITIQUE : Si les headers ont déjà été envoyés, ne rien faire
  if (res.headersSent) {
    console.error('Headers already sent, cannot send error response');
    return;
  }
  
  // Assurer qu'on a une navigation
  if (!res.locals.nav) {
    res.locals.nav = '<ul><li><a href="/">Home</a></li></ul>';
  }
  
  console.error(`Error at: "${req.originalUrl}": ${err.message}`)
  
  let message;
  let status = err.status || 500;
  
  if (status === 404) {
    message = err.message || 'Page not found';
  } else {
    message = "Oh no! There was a crash. Maybe try a different route?";
  }
  
  // RENDRE UNE SEULE FOIS
  res.status(status).render("errors/error", {
    title: status === 404 ? "404 Not Found" : "Server Error",
    message,
    nav: res.locals.nav,
  });
})

/* ***********************
 * Local Server Information
 *************************/
const port = process.env.PORT || 5500
const host = process.env.HOST || 'localhost'

/* ***********************
 * Start server
 *************************/
app.listen(port, host, () => {
  console.log(`app listening on ${host}:${port}`)
})