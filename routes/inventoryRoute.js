const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const { body } = require("express-validator")

// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);

// Route to build inventory detail view by inventory id
router.get("/detail/:invId", invController.buildByInventoryId);

// Route to deliver add-classification view
router.get("/add-classification", invController.buildAddClassification);

// Route to process add-classification form submission
router.post(
  "/add-classification",
  body("classification_name")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Classification name is required")
    .matches(/^[A-Za-z0-9]+$/)
    .withMessage("Classification name cannot contain spaces or special characters"),
  invController.processAddClassification
);

// Route to deliver add-inventory view
router.get("/add-inventory", invController.buildAddInventory);

// Route to process add-inventory form submission
router.post(
  "/add-inventory",
  body("classification_id")
    .trim()
    .isInt({ min: 1 })
    .withMessage("Classification is required"),
  body("inv_make")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Make is required"),
  body("inv_model")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Model is required"),
  body("inv_year")
    .trim()
    .isInt({ min: 1900, max: 2099 })
    .withMessage("Year must be a valid year"),
  body("inv_description")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Description is required"),
  body("inv_price")
    .trim()
    .isFloat({ min: 0 })
    .withMessage("Price must be a positive number"),
  body("inv_miles")
    .trim()
    .isInt({ min: 0 })
    .withMessage("Miles must be a positive integer"),
  body("inv_color")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Color is required"),
  invController.processAddInventory
);

// Route to deliver inventory management view
router.get("/", invController.buildManagement);

module.exports = router;
