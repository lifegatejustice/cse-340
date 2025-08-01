const express = require("express");
const router = new express.Router();
const invController = require("../controllers/invController");
const { body } = require("express-validator");
const inventoryValidation = require("../utilities/inventory-validation");
const utilities = require("../utilities/index");

/* Middleware to restrict access to Employee and Admin only */
const checkEmployeeAdmin = utilities.checkEmployeeAdmin;

/* Route to build inventory by classification view */
router.get("/type/:classificationId", invController.buildByClassificationId);

/* Route to build inventory detail view by inventory id */
router.get("/detail/:invId", invController.buildByInventoryId);

/* Route to deliver add-classification view */
router.get("/add-classification", checkEmployeeAdmin, invController.buildAddClassification);

/* Route to process add-classification form submission */
router.post(
  "/add-classification",
  checkEmployeeAdmin,
  body("classification_name")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Classification name is required")
    .matches(/^[A-Za-z0-9]+$/)
    .withMessage("Classification name cannot contain spaces or special characters"),
  invController.processAddClassification
);

/* Route to deliver add-inventory view */
router.get("/add-inventory", checkEmployeeAdmin, invController.buildAddInventory);

/* Route to process add-inventory form submission */
router.post(
  "/add-inventory",
  checkEmployeeAdmin,
  inventoryValidation.newInventoryRules(),
  inventoryValidation.checkUpdateData,
  invController.processAddInventory
);

/* Route to deliver inventory management view */
router.get("/", checkEmployeeAdmin, invController.buildManagement);

/* Route to get inventory items by classification as JSON */
router.get("/getInventory/:classification_id", utilities.handleErrors(invController.getInventoryJSON));

/* Route to build edit inventory view */
router.get("/edit/:inv_id", checkEmployeeAdmin, utilities.handleErrors(invController.editInventoryView));

/* Route to process update inventory form submission */
router.post(
  "/update",
  checkEmployeeAdmin,
  inventoryValidation.newInventoryRules(),
  inventoryValidation.checkUpdateData,
  utilities.handleErrors(invController.updateInventory)
);

/* Route to deliver delete confirmation view */
router.get("/delete/:inv_id", checkEmployeeAdmin, utilities.handleErrors(invController.deleteInventoryView));

/* Route to process delete inventory form submission */
router.post("/delete", checkEmployeeAdmin, utilities.handleErrors(invController.deleteInventory));

module.exports = router;
