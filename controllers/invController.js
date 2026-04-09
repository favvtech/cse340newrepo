const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")
const favoritesModel = require("../models/favorites-model")

const invCont = {}

const DEFAULT_INV_IMAGE = "/images/no-image.jpg"
const DEFAULT_INV_THUMB = "/images/no-image-tn.jpg"

/* ***************************
 *  Vehicle management hub (Task 1)
 * ************************** */
invCont.buildManagement = async function (req, res, next) {
  const nav = await utilities.getNav()
  const classificationSelect = await utilities.buildClassificationList()
  res.render("./inventory/management", {
    title: "Vehicle Management",
    nav,
    classificationSelect,
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
  let isFavorite = false
  if (res.locals && res.locals.loggedin && res.locals.accountData) {
    isFavorite = await favoritesModel.isFavorite(
      res.locals.accountData.account_id,
      vehicle.inv_id
    )
  }
  res.render("./inventory/detail", {
    title,
    nav,
    detail,
    inv_id: vehicle.inv_id,
    isFavorite,
  })
}

/* ***************************
 *  Intentional error for testing global error middleware (Task 3)
 * ************************** */
invCont.triggerIntentionalError = async function () {
  throw new Error("Intentional server error for class demo.")
}

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id, 10)
  const invData = await invModel.getInventoryByClassificationId(
    classification_id
  )
  if (invData && invData.length > 0 && invData[0].inv_id) {
    return res.json(invData)
  }
  if (!invData || invData.length === 0) {
    return res.json([])
  }
  return next(new Error("No data returned"))
}

/* ***************************
 *  Build edit inventory view
 * ************************** */
invCont.editInventoryView = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id, 10)
  let nav = await utilities.getNav()
  const itemData = await invModel.getInventoryById(inv_id)
  if (!itemData) {
    return next({ status: 404, message: "Inventory item not found." })
  }
  const classificationSelect = await utilities.buildClassificationList(
    itemData.classification_id
  )
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`
  res.render("./inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationSelect: classificationSelect,
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_description: itemData.inv_description,
    inv_image: itemData.inv_image,
    inv_thumbnail: itemData.inv_thumbnail,
    inv_price: itemData.inv_price,
    inv_miles: itemData.inv_miles,
    inv_color: itemData.inv_color,
    classification_id: itemData.classification_id,
  })
}

/* ***************************
 *  Update Inventory Data
 * ************************** */
invCont.updateInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  const {
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id,
  } = req.body
  const updateResult = await invModel.updateInventory(
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id
  )

  if (updateResult) {
    const itemName = updateResult.inv_make + " " + updateResult.inv_model
    req.flash("notice", `The ${itemName} was successfully updated.`)
    res.redirect("/inv/")
  } else {
    const classificationSelect = await utilities.buildClassificationList(
      classification_id
    )
    const itemName = `${inv_make} ${inv_model}`
    req.flash("notice", "Sorry, the insert failed.")
    res.status(501).render("./inventory/edit-inventory", {
      title: "Edit " + itemName,
      nav,
      classificationSelect: classificationSelect,
      errors: null,
      inv_id,
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
    })
  }
}

/* ***************************
 *  Build delete confirmation view
 * ************************** */
invCont.buildDeleteView = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id, 10)
  let nav = await utilities.getNav()
  const itemData = await invModel.getInventoryById(inv_id)
  if (!itemData) {
    return next({ status: 404, message: "Inventory item not found." })
  }
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`
  res.render("./inventory/delete-confirm", {
    title: "Delete " + itemName,
    nav,
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_price: itemData.inv_price,
  })
}

/* ***************************
 *  Delete Inventory Item
 * ************************** */
invCont.deleteInventoryItem = async function (req, res, next) {
  const inv_id = parseInt(req.body.inv_id, 10)
  const deleteResult = await invModel.deleteInventoryItem(inv_id)

  if (deleteResult && deleteResult.rowCount > 0) {
    req.flash("notice", "The inventory item was successfully deleted.")
    return res.redirect("/inv/")
  }

  req.flash("notice", "Sorry, the delete failed.")
  return res.redirect("/inv/delete/" + inv_id)
}

module.exports = invCont
