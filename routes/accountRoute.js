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

const accountValidation = require("../utilities/account-validation");

// GET route for account update view
router.get(
  "/update/:account_id",
  utilities.checkLogin,
  utilities.handleErrors(accountController.buildUpdateAccount)
);

// POST route to process account update
router.post(
  "/update",
  utilities.checkLogin,
  accountValidation.updateAccountRules,
  utilities.handleErrors(accountController.updateAccount)
);

// POST route to process password change
router.post(
  "/change-password",
  utilities.checkLogin,
  accountValidation.changePasswordRules,
  utilities.handleErrors(accountController.changePassword)
);

/* GET route for logout - clear JWT cookie and redirect to home */
router.get("/logout", (req, res) => {
  res.clearCookie("jwt");
  res.redirect("/");
});

module.exports = router;
