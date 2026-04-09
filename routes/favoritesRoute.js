const express = require("express")
const router = new express.Router()
const utilities = require("../utilities/")
const favoritesController = require("../controllers/favoritesController")
const favValidate = require("../utilities/favorites-validation")

router.get(
  "/",
  utilities.checkLogin,
  utilities.handleErrors(favoritesController.buildFavorites)
)

router.post(
  "/add",
  utilities.checkLogin,
  favValidate.addRules(),
  favValidate.checkResult,
  utilities.handleErrors(favoritesController.addFavorite)
)

router.post(
  "/remove",
  utilities.checkLogin,
  favValidate.removeRules(),
  favValidate.checkResult,
  utilities.handleErrors(favoritesController.removeFavorite)
)

router.post(
  "/note",
  utilities.checkLogin,
  favValidate.noteRules(),
  favValidate.checkResult,
  utilities.handleErrors(favoritesController.updateNote)
)

module.exports = router

