const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

const DEFAULT_INV_IMAGE = "/images/no-image.jpg"
const DEFAULT_INV_THUMB = "/images/no-image-tn.jpg"

/* ***************************
 *  Vehicle management hub (Task 1)
 * ************************** */
invCont.buildManagement = async function (req, res, next) {
  const nav = await utilities.getNav()
  res.render("./inventory/management", {
    title: "Vehicle Management",
    nav,
  })
}

/* ***************************
 *  Add classification — deliver form
 * ************************** */
invCont.buildAddClassification = async function (req, res, next) {
  const nav = await utilities.getNav()
  res.render("./inventory/add-classification", {
    title: "Add Classification",
    nav,
    errors: null,
    classification_name: "",
  })
}

/* ***************************
 *  Add classification — process
 * ************************** */
invCont.registerClassification = async function (req, res) {
  const nav = await utilities.getNav()
  const { classification_name } = req.body

  const result = await invModel.addClassification(classification_name)

  if (result && typeof result !== "string" && result.rowCount > 0) {
    req.flash(
      "notice",
      "The new classification was successfully added."
    )
    const freshNav = await utilities.getNav()
    res.status(201).render("./inventory/management", {
      title: "Vehicle Management",
      nav: freshNav,
    })
  } else {
    req.flash("notice", "Sorry, adding the classification failed.")
    res.status(500).render("./inventory/add-classification", {
      title: "Add Classification",
      nav,
      errors: null,
      classification_name,
    })
  }
}

/* ***************************
 *  Add inventory — deliver form
 * ************************** */
invCont.buildAddInventory = async function (req, res, next) {
  const nav = await utilities.getNav()
  const classificationList = await utilities.buildClassificationList()
  res.render("./inventory/add-inventory", {
    title: "Add Inventory",
    nav,
    errors: null,
    classificationList,
    inv_make: "",
    inv_model: "",
    inv_year: "",
    inv_description: "",
    inv_image: DEFAULT_INV_IMAGE,
    inv_thumbnail: DEFAULT_INV_THUMB,
    inv_price: "",
    inv_miles: "",
    inv_color: "",
  })
}

/* ***************************
 *  Add inventory — process
 * ************************** */
invCont.registerInventory = async function (req, res) {
  const nav = await utilities.getNav()
  const {
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
    classification_id,
  } = req.body

  const result = await invModel.addInventory(
    inv_make,
    inv_model,
    String(inv_year).slice(0, 4),
    inv_description,
    inv_image.trim(),
    inv_thumbnail.trim(),
    Number(inv_price),
    parseInt(inv_miles, 10),
    inv_color,
    parseInt(classification_id, 10)
  )

  if (result && typeof result !== "string" && result.rowCount > 0) {
    req.flash(
      "notice",
      "The new vehicle was successfully added. View it under its classification in the navigation."
    )
    const freshNav = await utilities.getNav()
    res.status(201).render("./inventory/management", {
      title: "Vehicle Management",
      nav: freshNav,
    })
  } else {
    req.flash("notice", "Sorry, adding the inventory item failed.")
    const classificationList = await utilities.buildClassificationList(
      classification_id
    )
    res.status(500).render("./inventory/add-inventory", {
      title: "Add Inventory",
      nav,
      errors: null,
      classificationList,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
    })
  }
}

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
