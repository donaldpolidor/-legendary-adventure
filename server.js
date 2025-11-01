/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/
/* ***********************
 * Require Statements
 *************************/
const path = require("path");
const express = require("express");
const expressLayouts = require("express-ejs-layouts");
require("dotenv").config();

const app = express();
const staticRoutes = require("./routes/static");

/* ***********************
 * View Engine and Templates
 *************************/
app.set("view engine", "ejs");
app.use(expressLayouts);
app.set("layout", "./layouts/layout"); // not a views root

/* ***********************
 * Routes
 *************************/
app.use(express.static("public"))

// Index route
app.get("/", function (req, res) {
  res.render("index", { title: "Home"});
});

/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/
const port = process.env.PORT || 5500;
const host = process.env.HOST || "localhost";

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`);
});
