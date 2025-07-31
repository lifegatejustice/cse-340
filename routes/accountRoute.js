// Required Resources
const express = require("express");
const router = new express.Router();
const utilities = require("../utilities/index");
const accountController = require("../controllers/accountController");
const regValidate = require("../utilities/account-validation");



// GET route for /login - login view
router.get("/login", accountController.buildLogin);
// Process the login request
router.post(
  "/login",
  regValidate.loginRules,
  utilities.handleErrors(accountController.accountLogin)
)

// GET route for /registration - registration view
router.get("/registration", accountController.buildRegister);


router.get("/", utilities.checkLogin, accountController.buildAccount);


// POST route for /register - process registration
router.post('/register', utilities.handleErrors(accountController.registerAccount));

module.exports = router;
