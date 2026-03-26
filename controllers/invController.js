const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  if (!data || data.length === 0) {
    return next({
      status: 404,
      message: "No vehicles found for this classification.",
    })
  }
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const className = data[0].classification_name
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  })
}

/* ***************************
 *  Build vehicle detail view by inventory id
 * ************************** */
invCont.buildByInventoryId = async function (req, res, next) {
  const invId = req.params.invId
  const vehicle = await invModel.getInventoryByInvId(invId)
  if (!vehicle) {
    return next({ status: 404, message: "That vehicle could not be found." })
  }
  const detail = utilities.buildInventoryDetail(vehicle)
  const nav = await utilities.getNav()
  const title =
    vehicle.inv_year + " " + vehicle.inv_make + " " + vehicle.inv_model
  res.render("./inventory/detail", {
    title,
    nav,
    detail,
  })
}

/* ***************************
 *  Intentional error for testing global error middleware (Task 3)
 * ************************** */
invCont.triggerIntentionalError = async function () {
  throw new Error("Intentional server error for class demo.")
}

module.exports = invCont