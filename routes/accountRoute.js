// Required Resources
const express = require("express");
const router = new express.Router();
const utilities = require("../utilities/index");
const accountController = require("../controllers/accountController");

// GET route for /login - login view
router.get("/login", accountController.buildLogin);

// GET route for /registration - registration view
router.get("/registration", accountController.buildRegister);

// POST route for /register - process registration
router.post('/register', utilities.handleErrors(accountController.registerAccount));

module.exports = router;
