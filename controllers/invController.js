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

/* ***************************
 *  Deliver add-classification view
 * ************************** */
invCont.buildAddClassification = async function (req, res, next) {
  let nav = await utilities.getNav()
  res.render("inventory/add-classification", {
    title: "Add New Classification",
    nav,
    errors: null,
    classification_name: "",
  })
}

/* ***************************
 *  Process add-classification form submission
 * ************************** */
invCont.processAddClassification = async function (req, res, next) {
  const { classification_name } = req.body
  const errors = []

  if (!classification_name || !classification_name.match(/^[A-Za-z0-9]+$/)) {
    errors.push({ msg: "Classification name is required and cannot contain spaces or special characters." })
  }

  if (errors.length > 0) {
    let nav = await utilities.getNav()
    res.status(400).render("inventory/add-classification", {
      title: "Add New Classification",
      nav,
      errors,
      classification_name,
    })
    return
  }

  try {
    const regResult = await invModel.addClassification(classification_name)
    if (regResult) {
      req.flash("success", `Classification '${classification_name}' added successfully.`)
      res.redirect("/inv/")
    } else {
      req.flash("error", "Failed to add classification.")
      let nav = await utilities.getNav()
      res.status(500).render("inventory/add-classification", {
        title: "Add New Classification",
        nav,
        errors: null,
        classification_name,
      })
    }
  } catch (error) {
    next(error)
  }
}

/* ***************************
 *  Deliver add-inventory view
 * ************************** */
invCont.buildAddInventory = async function (req, res, next) {
  try {
    let nav = await utilities.getNav()
    // Fix: buildClassificationList is not defined in utilities/index.js, implement here
    let data = await invModel.getClassifications()
    let classificationList = '<select name="classification_id" id="classificationList" required>'
    classificationList += '<option value="">Choose a Classification</option>'
    data.rows.forEach(row => {
      classificationList += '<option value="' + row.classification_id + '">' + row.classification_name + '</option>'
    })
    classificationList += '</select>'
    res.render("inventory/add-inventory", {
      title: "Add New Inventory",
      nav,
      classificationList,
      errors: null,
      inv_make: "",
      inv_model: "",
      inv_year: "",
      inv_description: "",
      inv_price: "",
      inv_miles: "",
      inv_color: "",
      inv_image: "/images/vehicles/no-image.png",
      inv_thumbnail: "/images/vehicles/no-image-tn.png",
      classification_id: "",
    })
  } catch (error) {
    next(error)
  }
}

/* ***************************
 *  Process add-inventory form submission
 * ************************** */
invCont.processAddInventory = async function (req, res, next) {
  const {
    classification_id,
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_price,
    inv_miles,
    inv_color,
  } = req.body

  const errors = []

  if (!classification_id || isNaN(classification_id) || classification_id < 1) {
    errors.push({ msg: "Classification is required." })
  }
  if (!inv_make || inv_make.trim().length === 0) {
    errors.push({ msg: "Make is required." })
  }
  if (!inv_model || inv_model.trim().length === 0) {
    errors.push({ msg: "Model is required." })
  }
  if (!inv_year || isNaN(inv_year) || inv_year < 1900 || inv_year > 2099) {
    errors.push({ msg: "Year must be a valid year." })
  }
  if (!inv_description || inv_description.trim().length === 0) {
    errors.push({ msg: "Description is required." })
  }
  if (!inv_price || isNaN(inv_price) || inv_price < 0) {
    errors.push({ msg: "Price must be a positive number." })
  }
  if (!inv_miles || isNaN(inv_miles) || inv_miles < 0) {
    errors.push({ msg: "Miles must be a positive integer." })
  }
  if (!inv_color || inv_color.trim().length === 0) {
    errors.push({ msg: "Color is required." })
  }

  if (errors.length > 0) {
    try {
      let nav = await utilities.getNav()
      // Fix: buildClassificationList is not defined in utilities/index.js, implement here
      let data = await invModel.getClassifications()
      let classificationList = '<select name="classification_id" id="classificationList" required>'
      classificationList += '<option value="">Choose a Classification</option>'
      data.rows.forEach(row => {
        classificationList += '<option value="' + row.classification_id + '"'
        if (classification_id == row.classification_id) {
          classificationList += ' selected '
        }
        classificationList += '>' + row.classification_name + '</option>'
      })
      classificationList += '</select>'
      res.status(400).render("inventory/add-inventory", {
        title: "Add New Inventory",
        nav,
        classificationList,
        errors,
        inv_make,
        inv_model,
        inv_year,
        inv_description,
        inv_price,
        inv_miles,
        inv_color,
        classification_id,
      })
    } catch (error) {
      next(error)
    }
    return
  }

  try {
    const regResult = await invModel.addInventoryItem(
      classification_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_price,
      inv_miles,
      inv_color,
      req.body.inv_image || "/images/vehicles/no-image.png",
      req.body.inv_thumbnail || "/images/vehicles/no-image-tn.png"
    )
    if (regResult) {
      req.flash("success", `Vehicle '${inv_make} ${inv_model}' added successfully.`)
      res.redirect("/inv/")
    } else {
      req.flash("error", "Failed to add vehicle.")
      let nav = await utilities.getNav()
      // Fix: buildClassificationList is not defined in utilities/index.js, implement here
      let data = await invModel.getClassifications()
      let classificationList = '<select name="classification_id" id="classificationList" required>'
      classificationList += '<option value="">Choose a Classification</option>'
      data.rows.forEach(row => {
        classificationList += '<option value="' + row.classification_id + '"'
        if (classification_id == row.classification_id) {
          classificationList += ' selected '
        }
        classificationList += '>' + row.classification_name + '</option>'
      })
      classificationList += '</select>'
      res.status(500).render("inventory/add-inventory", {
        title: "Add New Inventory",
        nav,
        classificationList,
        errors: null,
        inv_make,
        inv_model,
        inv_year,
        inv_description,
        inv_price,
        inv_miles,
        inv_color,
        classification_id,
      })
    }
  } catch (error) {
    next(error)
  }
}

/* ***************************
 *  Deliver inventory management view
 * ************************** */
invCont.buildManagement = async function (req, res, next) {
  try {
    let nav = await utilities.getNav()
    res.render("inventory/management", {
      title: "Inventory Management",
      nav,
    })
  } catch (error) {
    next(error)
  }
}

module.exports = invCont
