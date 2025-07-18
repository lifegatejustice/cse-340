const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  try {
    const classification_id = req.params.classificationId
    const data = await invModel.getInventoryByClassificationId(classification_id)
    const grid = await utilities.buildClassificationGrid(data)
    let nav = await utilities.getNav()
    const className = data[0].classification_name
    res.render("./inventory/classification", {
      title: className + " vehicles",
      nav,
      grid,
    })
  } catch (error) {
    next(error)
  }
}

/* ***************************
 *  Build inventory detail view by inventory id
 * ************************** */
invCont.buildByInventoryId = async function (req, res, next) {
  try {
    const inv_id = req.params.invId
    const vehicle = await invModel.getInventoryById(inv_id)
    if (!vehicle) {
      res.status(404).render("errors/error", {
        title: "Vehicle Not Found",
        message: "Sorry, the requested vehicle was not found.",
      })
      return
    }
    const detail = await utilities.buildVehicleDetailHTML(vehicle)
    let nav = await utilities.getNav()
    const title = `${vehicle.inv_make} ${vehicle.inv_model}`
    res.render("./inventory/detail", {
      title,
      nav,
      detail,
    })
  } catch (error) {
    next(error)
  }
}

module.exports = invCont
