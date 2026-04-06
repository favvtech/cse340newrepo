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
  utilities.checkAccountType,
  utilities.handleErrors(invController.buildManagement)
)

router.get(
  "/add-classification",
  utilities.checkAccountType,
  utilities.handleErrors(invController.buildAddClassification)
)

router.post(
  "/add-classification",
  utilities.checkAccountType,
  invValidate.classificationRules(),
  invValidate.checkClassificationData,
  utilities.handleErrors(invController.registerClassification)
)

router.get(
  "/add-inventory",
  utilities.checkAccountType,
  utilities.handleErrors(invController.buildAddInventory)
)

router.post(
  "/add-inventory",
  utilities.checkAccountType,
  invValidate.inventoryRules(),
  invValidate.checkInventoryData,
  utilities.handleErrors(invController.registerInventory)
)

/* ***************************
 *  Update inventory data route
 * ************************** */
router.post(
  "/update/",
  utilities.checkAccountType,
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
  utilities.checkAccountType,
  utilities.handleErrors(invController.editInventoryView)
)

/* ***************************
 *  Delete inventory view route
 * ************************** */
router.get(
  "/delete/:inv_id",
  utilities.checkAccountType,
  utilities.handleErrors(invController.buildDeleteView)
)

/* ***************************
 *  Delete inventory data route
 * ************************** */
router.post(
  "/delete/",
  utilities.checkAccountType,
  utilities.handleErrors(invController.deleteInventoryItem)
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
