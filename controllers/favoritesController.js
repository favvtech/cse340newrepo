const utilities = require("../utilities/")
const favoritesModel = require("../models/favorites-model")

const favCont = {}

favCont.buildFavorites = async function (req, res) {
  const nav = await utilities.getNav()
  const account_id = res.locals.accountData.account_id
  const favorites = await favoritesModel.getFavoritesByAccountId(account_id)

  if (typeof favorites === "string") {
    req.flash("notice", "Sorry, we could not load your favorites.")
    return res.status(500).render("account/favorites", {
      title: "My Favorites",
      nav,
      errors: null,
      favorites: [],
    })
  }

  res.render("account/favorites", {
    title: "My Favorites",
    nav,
    errors: null,
    favorites,
  })
}

favCont.addFavorite = async function (req, res) {
  const account_id = res.locals.accountData.account_id
  const inv_id = parseInt(req.body.inv_id, 10)
  const note = req.body.note || null

  const result = await favoritesModel.addFavorite(account_id, inv_id, note)
  if (result && typeof result !== "string") {
    req.flash("notice", "Saved to favorites.")
  } else {
    req.flash("notice", "Sorry, could not save favorite.")
  }
  res.redirect("/inv/detail/" + inv_id)
}

favCont.removeFavorite = async function (req, res) {
  const account_id = res.locals.accountData.account_id
  const inv_id = parseInt(req.body.inv_id, 10)

  const result = await favoritesModel.removeFavorite(account_id, inv_id)
  if (result && typeof result !== "string") {
    req.flash("notice", "Removed from favorites.")
  } else {
    req.flash("notice", "Sorry, could not remove favorite.")
  }
  res.redirect("back")
}

favCont.updateNote = async function (req, res) {
  const account_id = res.locals.accountData.account_id
  const inv_id = parseInt(req.body.inv_id, 10)
  const note = req.body.note || ""

  const result = await favoritesModel.updateFavoriteNote(account_id, inv_id, note)
  if (result && typeof result !== "string") {
    req.flash("notice", "Note updated.")
  } else {
    req.flash("notice", "Sorry, could not update note.")
  }
  res.redirect("/account/favorites")
}

module.exports = favCont

