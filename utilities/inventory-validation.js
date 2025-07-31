const { body, validationResult } = require("express-validator");

/* ***************************
 *  Validate new inventory data
 * ************************** */
function newInventoryRules() {
  return [
    body("classification_id")
      .trim()
      .isInt({ min: 1 })
      .withMessage("Classification is required."),
    body("inv_make")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Make is required."),
    body("inv_model")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Model is required."),
    body("inv_year")
      .trim()
      .isInt({ min: 1900, max: 2099 })
      .withMessage("Year must be a valid year."),
    body("inv_description")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Description is required."),
    body("inv_price")
      .trim()
      .isFloat({ min: 0 })
      .withMessage("Price must be a positive number."),
    body("inv_miles")
      .trim()
      .isInt({ min: 0 })
      .withMessage("Miles must be a positive integer."),
    body("inv_color")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Color is required."),
  ];
}

/* ***************************
 *  Validate update inventory data and handle errors
 * ************************** */
function checkUpdateData(req, res, next) {
  const { inv_id, inv_make, inv_model, inv_year, inv_description, inv_price, inv_miles, inv_color, classification_id } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    let classificationSelect = '';
    // Build classification select list with current classification selected
    // This should be done asynchronously in controller ideally, but for middleware, we can pass error to next
    // So here, just pass error to next with data to re-render edit view
    return res.status(400).render("inventory/edit-inventory", {
      title: "Edit " + inv_make + " " + inv_model,
      classificationSelect,
      errors: errors.array(),
      inv_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_price,
      inv_miles,
      inv_color,
      classification_id,
      nav: res.locals.nav || null,
    });
  }
  next();
}

module.exports = {
  newInventoryRules,
  checkUpdateData,
};
