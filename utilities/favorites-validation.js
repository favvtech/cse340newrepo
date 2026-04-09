const utilities = require(".")
const { body, validationResult } = require("express-validator")
const validate = {}

validate.addRules = () => {
  return [
    body("inv_id").trim().isInt().withMessage("Invalid vehicle id."),
    body("note")
      .optional({ checkFalsy: true })
      .trim()
      .isLength({ max: 200 })
      .withMessage("Note must be 200 characters or less."),
  ]
}

validate.removeRules = () => {
  return [body("inv_id").trim().isInt().withMessage("Invalid vehicle id.")]
}

validate.noteRules = () => {
  return [
    body("inv_id").trim().isInt().withMessage("Invalid vehicle id."),
    body("note")
      .trim()
      .isLength({ max: 200 })
      .withMessage("Note must be 200 characters or less."),
  ]
}

validate.checkResult = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const nav = await utilities.getNav()
    res.status(400).render("account/favorites", {
      title: "My Favorites",
      nav,
      errors,
      favorites: [],
    })
    return
  }
  next()
}

module.exports = validate

