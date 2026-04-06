// Needed Resources
const express = require("express")
const router = new express.Router()
const invController = require("../controllers/invController")
const utilities = require("../utilities/")
const invValidate = require("../utilities/inventory-validation")

/* ***************************
 *  Management & add flows (must be before /type/:id)
 * ************************** */
router.get(
  "/",
  utilities.handleErrors(invController.buildManagement)
)

router.get(
  "/add-classification",
  utilities.handleErrors(invController.buildAddClassification)
)

router.post(
  "/add-classification",
  invValidate.classificationRules(),
  invValidate.checkClassificationData,
  utilities.handleErrors(invController.registerClassification)
)

router.get(
  "/add-inventory",
  utilities.handleErrors(invController.buildAddInventory)
)

router.post(
  "/add-inventory",
  invValidate.inventoryRules(),
  invValidate.checkInventoryData,
  utilities.handleErrors(invController.registerInventory)
)

/* ***************************
 *  Update inventory data route
 * ************************** */
router.post(
  "/update/",
  invValidate.inventoryRules(),
  invValidate.checkUpdateData,
  utilities.handleErrors(invController.updateInventory)
)

router.get(
  "/getInventory/:classification_id",
  utilities.handleErrors(invController.getInventoryJSON)
)

/* ***************************
 *  Edit inventory view route
 * ************************** */
router.get(
  "/edit/:inv_id",
  utilities.handleErrors(invController.editInventoryView)
)

/* ***************************
 *  Public inventory views
 * ************************** */
router.get(
  "/type/:classificationId",
  utilities.handleErrors(invController.buildByClassificationId)
)

router.get(
  "/detail/:invId",
  utilities.handleErrors(invController.buildByInventoryId)
)

router.get(
  "/error-test",
  utilities.handleErrors(invController.triggerIntentionalError)
)

module.exports = router
