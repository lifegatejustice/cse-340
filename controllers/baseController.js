const utilities = require("../utilities/")
const baseController = {}

baseController.buildHome = async function(req, res){
  const nav = await utilities.getNav()
  res.render("index", {title: "Home", nav})
}

baseController.triggerError = (req, res, next) => {
  const err = new Error("Intentional 500 error triggered for testing purposes.")
  err.status = 500
  next(err)
}

module.exports = baseController
