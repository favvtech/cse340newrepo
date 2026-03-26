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
const static = require("./routes/static")
const baseController = require("./controllers/baseController")
const inventoryRoute = require("./routes/inventoryRoute")
const utilities = require("./utilities/")

 
/* ***********************
 * View Engine and Templates
 *************************/
app.set("view engine", "ejs")
app.use(expressLayouts)
app.set("layout", "./layouts/layout") // not at views root

// index route
app.get("/", utilities.handleErrors(baseController.buildHome))


/* ***********************
 * Routes
 *************************/
app.use(static)

// Inventory routes
app.use("/inv", inventoryRoute)

/* ***********************
 * Express Error Handler
 * Place after all other middleware
 *************************/
app.use(async (err, req, res, next) => {
  let nav = ""
  try {
    nav = await utilities.getNav()
  } catch (navErr) {
    console.error("Could not build nav in error handler:", navErr.message)
    nav = '<ul><li><a href="/" title="Home page">Home</a></li></ul>'
  }

  console.error(`Error at: "${req.originalUrl}": ${err.message}`)

  let status = err.statusCode || err.status || 500
  let message = err.message
  if (status === 404) message = err.message
  else message = "Oh no! Something went wrong on our end."

  return res.status(status).render("errors/error", {
    title: err.status || "Server Error",
    message,
    nav,
  })
})

/* ***********************
 * File Not Found Route
 *************************/
app.use(async (req, res, next) => {
  let nav = ""
  try {
    nav = await utilities.getNav()
  } catch (navErr) {
    nav = ""
  }
  res.status(404).render("errors/error", {
    title: 404,
    message: "Sorry, we appear to have lost that page.",
    nav,
  })
})

/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/
const port = process.env.PORT || 5500
const host =
  process.env.NODE_ENV === "development"
    ? process.env.HOST || "localhost"
    : "0.0.0.0"

/* ***********************
 * Log statement to confirm server operation
 *************************/
const server = app.listen(port, host, () => {
  console.log(`app listening on ${host}:${port}`)
})

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`Error: Port ${port} is already in use.`)
    console.error("Please stop the process using that port or set a different PORT in .env.")
    process.exit(1)
  }

  console.error("Server error:", err)
  process.exit(1)
})

const shutdown = () => {
  console.log("Shutting down server...")
  server.close(() => {
    console.log("Server stopped")
    process.exit(0)
  })
}

process.on("SIGINT", shutdown)
process.on("SIGTERM", shutdown)
