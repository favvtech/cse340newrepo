const invModel = require("../models/inventory-model")
const Util = {}

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
  let data
  try {
    data = await invModel.getClassifications()
  } catch (err) {
    console.error("getNav: database error:", err.message)
    return '<ul><li><a href="/" title="Home page">Home</a></li></ul>'
  }
  if (!data || !data.rows) {
    return '<ul><li><a href="/" title="Home page">Home</a></li></ul>'
  }
  let list = "<ul>"
  list += '<li><a href="/" title="Home page">Home</a></li>'
  data.rows.forEach((row) => {
    list += "<li>"
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>"
    list += "</li>"
  })
  list += "</ul>"
  return list
}

/* **************************************
* Build the classification view HTML
* ************************************ */
Util.buildClassificationGrid = async function(data){
  let grid
  if(data.length > 0){
    grid = '<ul id="inv-display" class="inv-card-list">'
    data.forEach((vehicle) => {
      const detailPath = "/inv/detail/" + vehicle.inv_id
      const vehicleLabel = vehicle.inv_make + " " + vehicle.inv_model
      grid += '<li class="inv-card">'
      grid +=
        '<a class="inv-card__media" href="' +
        detailPath +
        '" title="View ' +
        vehicleLabel +
        ' details"><img src="' +
        vehicle.inv_thumbnail +
        '" alt="Image of ' +
        vehicleLabel +
        ' on CSE Motors" /></a>'
      grid += '<div class="namePrice">'
      grid += "<hr />"
      grid += "<h2>"
      grid +=
        '<a href="' +
        detailPath +
        '" title="View ' +
        vehicleLabel +
        ' details">' +
        vehicleLabel +
        "</a>"
      grid += "</h2>"
      grid +=
        '<span class="inv-card__price">$' +
        new Intl.NumberFormat("en-US").format(vehicle.inv_price) +
        "</span>"
      grid += "</div>"
      grid += "</li>"
    })
    grid += "</ul>"
  } else {
    // Defensive: ensure `grid` is initialized even if we ever call this
    // with an empty array (normally handled as a 404 by the controller).
    grid = '<p class="notice">Sorry, no matching vehicles could be found.</p>'
  }
  return grid
}

/* **************************************
 * Build HTML for a single vehicle detail view
 * ************************************ */
Util.buildInventoryDetail = function (vehicle) {
  const priceFmt = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(vehicle.inv_price)

  const milesFmt = new Intl.NumberFormat("en-US").format(vehicle.inv_miles)

  let html = '<article class="vehicle-detail">'
  html += '<div class="vehicle-detail__media">'
  html +=
    '<img src="' +
    vehicle.inv_image +
    '" alt="Full size photo of ' +
    vehicle.inv_year +
    " " +
    vehicle.inv_make +
    " " +
    vehicle.inv_model +
    '" class="vehicle-detail__image-full" />'
  html += "</div>"

  html += '<div class="vehicle-detail__info">'
  html += '<div class="vehicle-detail__highlights">'
  html += '<div class="vehicle-detail__highlight"><span class="vehicle-detail__label">Year</span><span class="vehicle-detail__value vehicle-detail__value--prominent">' + vehicle.inv_year + "</span></div>"
  html += '<div class="vehicle-detail__highlight"><span class="vehicle-detail__label">Make</span><span class="vehicle-detail__value vehicle-detail__value--prominent">' + vehicle.inv_make + "</span></div>"
  html += '<div class="vehicle-detail__highlight"><span class="vehicle-detail__label">Model</span><span class="vehicle-detail__value vehicle-detail__value--prominent">' + vehicle.inv_model + "</span></div>"
  html += '<div class="vehicle-detail__highlight"><span class="vehicle-detail__label">Price</span><span class="vehicle-detail__value vehicle-detail__value--price">' + priceFmt + "</span></div>"
  html += '<div class="vehicle-detail__highlight"><span class="vehicle-detail__label">Mileage</span><span class="vehicle-detail__value vehicle-detail__value--prominent">' + milesFmt + "</span></div>"
  html += "</div>"

  html += '<section class="vehicle-detail__description" aria-labelledby="vehicle-desc-heading">'
  html += '<h2 id="vehicle-desc-heading">Description</h2>'
  html += "<p>" + vehicle.inv_description + "</p>"
  html += "</section>"

  html += '<dl class="vehicle-detail__specs">'
  html += "<dt>Exterior color</dt><dd>" + vehicle.inv_color + "</dd>"
  html += "<dt>Classification</dt><dd>" + vehicle.classification_name + "</dd>"
  html += "<dt>Inventory ID</dt><dd>" + vehicle.inv_id + "</dd>"
  html += "</dl>"

  html += "</div></article>"
  return html
}

/*
 * Middleware For Handling Errors
 * Wrap other function in this for
 * General Error Handling
 */
Util.handleErrors = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next)

module.exports = Util
