const invModel = require("../models/inventory-model");
const inquiryModel = require("../models/inquiry-model");
const nodemailer = require("nodemailer");
const utilities = require("../utilities/");

// Email helper
async function sendInquiryEmail(vehicle, customer_name, customer_email, customer_phone, message) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.DEALER_EMAIL,
    subject: `New Inquiry: ${vehicle.inv_make} ${vehicle.inv_model}`,
    html: `
      <h2>New Vehicle Inquiry</h2>
      <p><strong>Vehicle:</strong> ${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}</p>
      <p><strong>Customer:</strong> ${customer_name}</p>
      <p><strong>Email:</strong> ${customer_email}</p>
      <p><strong>Phone:</strong> ${customer_phone || 'Not provided'}</p>
      <p><strong>Message:</strong> ${message}</p>
    `
  };

  await transporter.sendMail(mailOptions);
}

const invCont = {

  /** ================================
   * CONTACT FORM + INQUIRY
   * ================================ */
  async buildContactForm(req, res, next) {
    try {
      const inv_id = req.params.invId;
      const vehicle = await invModel.getInventoryById(inv_id);

      if (!vehicle) {
        return res.status(404).render("errors/error", {
          title: "Vehicle Not Found",
          message: "Sorry, the requested vehicle was not found."
        });
      }

      let nav = await utilities.getNav();
      res.render("./inventory/contact-form", {
        title: `Contact About ${vehicle.inv_make} ${vehicle.inv_model}`,
        nav,
        vehicle,
        errors: null,
        formData: {}
      });
    } catch (error) {
      next(error);
    }
  },

  async processContactForm(req, res, next) {
    try {
      const { inv_id, customer_name, customer_email, customer_phone, message } = req.body;
      const errors = [];

      if (!customer_name?.trim()) errors.push({ msg: "Name is required" });
      if (!customer_email?.trim()) errors.push({ msg: "Email is required" });
      if (!message?.trim()) errors.push({ msg: "Message is required" });

      const vehicle = await invModel.getInventoryById(inv_id);

      if (errors.length > 0) {
        let nav = await utilities.getNav();
        return res.status(400).render("./inventory/contact-form", {
          title: `Contact Dealer`,
          nav,
          vehicle,
          errors,
          formData: req.body
        });
      }

      await inquiryModel.createInquiry({
        inv_id: parseInt(inv_id),
        customer_name,
        customer_email,
        customer_phone,
        message
      });

      await sendInquiryEmail(vehicle, customer_name, customer_email, customer_phone, message);

      req.flash('success', 'Your inquiry has been sent successfully! We will contact you soon.');
      res.redirect(`/inv/detail/${inv_id}`);
    } catch (error) {
      next(error);
    }
  },

  async buildInquiryList(req, res, next) {
    try {
      let nav = await utilities.getNav();
      const inquiries = await inquiryModel.getAllInquiries();
      res.render("./inventory/inquiry-list", {
        title: "Customer Inquiries",
        nav,
        inquiries: inquiries.rows
      });
    } catch (error) {
      next(error);
    }
  },

  /** ================================
   * INVENTORY CRUD
   * ================================ */
  async buildByClassificationId(req, res, next) {
    try {
      const classification_id = req.params.classificationId;
      const data = await invModel.getInventoryByClassificationId(classification_id);
      const grid = await utilities.buildClassificationGrid(data);
      let nav = await utilities.getNav();
      const className = data[0].classification_name;
      res.render("./inventory/classification", {
        title: className + " vehicles",
        nav,
        grid,
      });
    } catch (error) {
      next(error);
    }
  },

  async buildByInventoryId(req, res, next) {
    try {
      const inv_id = req.params.invId;
      const vehicle = await invModel.getInventoryById(inv_id);
      if (!vehicle) {
        return res.status(404).render("errors/error", {
          title: "Vehicle Not Found",
          message: "Sorry, the requested vehicle was not found.",
        });
      }
      const detail = await utilities.buildVehicleDetailHTML(vehicle);
      let nav = await utilities.getNav();
      res.render("./inventory/detail", {
        title: `${vehicle.inv_make} ${vehicle.inv_model}`,
        nav,
        detail,
        vehicle,
      });
    } catch (error) {
      next(error);
    }
  },

  async buildAddClassification(req, res) {
    let nav = await utilities.getNav();
    res.render("inventory/add-classification", {
      title: "Add New Classification",
      nav,
      errors: null,
      classification_name: "",
    });
  },

  async processAddClassification(req, res, next) {
    const { classification_name } = req.body;
    const errors = [];

    if (!classification_name || !classification_name.match(/^[A-Za-z0-9]+$/)) {
      errors.push({ msg: "Classification name is required and cannot contain spaces or special characters." });
    }

    if (errors.length > 0) {
      let nav = await utilities.getNav();
      return res.status(400).render("inventory/add-classification", {
        title: "Add New Classification",
        nav,
        errors,
        classification_name,
      });
    }

    try {
      const regResult = await invModel.addClassification(classification_name);
      if (regResult) {
        req.flash("success", `Classification '${classification_name}' added successfully.`);
        res.redirect("/inv/");
      } else {
        req.flash("error", "Failed to add classification.");
        let nav = await utilities.getNav();
        res.status(500).render("inventory/add-classification", {
          title: "Add New Classification",
          nav,
          errors: null,
          classification_name,
        });
      }
    } catch (error) {
      next(error);
    }
  },

  async buildAddInventory(req, res, next) {
    try {
      let nav = await utilities.getNav();
      let data = await invModel.getClassifications();
      let classificationList = '<select name="classification_id" id="classificationList" required>';
      classificationList += '<option value="">Choose a Classification</option>';
      data.rows.forEach(row => {
        classificationList += `<option value="${row.classification_id}">${row.classification_name}</option>`;
      });
      classificationList += '</select>';
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
      });
    } catch (error) {
      next(error);
    }
  },

  async processAddInventory(req, res, next) {
    const {
      classification_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_price,
      inv_miles,
      inv_color,
    } = req.body;

    const errors = [];

    if (!classification_id || isNaN(classification_id) || classification_id < 1) errors.push({ msg: "Classification is required." });
    if (!inv_make?.trim()) errors.push({ msg: "Make is required." });
    if (!inv_model?.trim()) errors.push({ msg: "Model is required." });
    if (!inv_year || isNaN(inv_year) || inv_year < 1900 || inv_year > 2099) errors.push({ msg: "Year must be a valid year." });
    if (!inv_description?.trim()) errors.push({ msg: "Description is required." });
    if (!inv_price || isNaN(inv_price) || inv_price < 0) errors.push({ msg: "Price must be a positive number." });
    if (!inv_miles || isNaN(inv_miles) || inv_miles < 0) errors.push({ msg: "Miles must be a positive integer." });
    if (!inv_color?.trim()) errors.push({ msg: "Color is required." });

    if (errors.length > 0) {
      try {
        let nav = await utilities.getNav();
        let data = await invModel.getClassifications();
        let classificationList = '<select name="classification_id" id="classificationList" required>';
        classificationList += '<option value="">Choose a Classification</option>';
        data.rows.forEach(row => {
          classificationList += `<option value="${row.classification_id}" ${classification_id == row.classification_id ? 'selected' : ''}>${row.classification_name}</option>`;
        });
        classificationList += '</select>';
        return res.status(400).render("inventory/add-inventory", {
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
        });
      } catch (error) {
        return next(error);
      }
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
      );
      if (regResult) {
        req.flash("success", `Vehicle '${inv_make} ${inv_model}' added successfully.`);
        res.redirect("/inv/");
      } else {
        req.flash("error", "Failed to add vehicle.");
        res.redirect("/inv/add-inventory");
      }
    } catch (error) {
      next(error);
    }
  },

  async buildManagement(req, res, next) {
    try {
      let nav = await utilities.getNav();
      let data = await invModel.getClassifications();
      let classificationSelect = '<select name="classification_id" id="classificationList" required>';
      classificationSelect += '<option value="">Choose a Classification</option>';
      data.rows.forEach(row => {
        classificationSelect += `<option value="${row.classification_id}">${row.classification_name}</option>`;
      });
      classificationSelect += '</select>';
      res.render("inventory/management", {
        title: "Inventory Management",
        nav,
        classificationSelect,
      });
    } catch (error) {
      next(error);
    }
  },

  async getInventoryJSON(req, res, next) {
    const classification_id = parseInt(req.params.classification_id);
    const invData = await invModel.getInventoryByClassificationId(classification_id);
    if (invData[0] && invData[0].inv_id) {
      return res.json(invData);
    } else {
      next(new Error("No data returned"));
    }
  },

  async editInventoryView(req, res, next) {
    try {
      const inv_id = parseInt(req.params.inv_id);
      let nav = await utilities.getNav();
      const itemData = await invModel.getInventoryById(inv_id);
      let data = await invModel.getClassifications();
      let classificationSelect = '<select name="classification_id" id="classificationList" required>';
      classificationSelect += '<option value="">Choose a Classification</option>';
      data.rows.forEach(row => {
        classificationSelect += `<option value="${row.classification_id}" ${row.classification_id === itemData.classification_id ? 'selected' : ''}>${row.classification_name}</option>`;
      });
      classificationSelect += '</select>';
      const itemName = `${itemData.inv_make} ${itemData.inv_model}`;
      res.render("./inventory/edit-inventory", {
        title: "Edit " + itemName,
        nav,
        classificationSelect,
        errors: null,
        ...itemData
      });
    } catch (error) {
      next(error);
    }
  },

  async updateInventory(req, res, next) {
    try {
      let nav = await utilities.getNav();
      const {
        inv_id,
        inv_make,
        inv_model,
        inv_description,
        inv_image,
        inv_thumbnail,
        inv_price,
        inv_year,
        inv_miles,
        inv_color,
        classification_id,
      } = req.body;
      const updateResult = await invModel.updateInventory(
        inv_id,
        inv_make,
        inv_model,
        inv_description,
        inv_image,
        inv_thumbnail,
        inv_price,
        inv_year,
        inv_miles,
        inv_color,
        classification_id
      );
      if (updateResult) {
        req.flash("notice", `The ${updateResult.inv_make} ${updateResult.inv_model} was successfully updated.`);
        res.redirect("/inv/");
      } else {
        const classificationSelect = await utilities.buildClassificationList(classification_id);
        req.flash("notice", "Sorry, the update failed.");
        res.status(501).render("inventory/edit-inventory", {
          title: "Edit " + inv_make + " " + inv_model,
          nav,
          classificationSelect,
          errors: null,
          ...req.body
        });
      }
    } catch (error) {
      next(error);
    }
  },

  async deleteInventoryView(req, res, next) {
    try {
      const inv_id = parseInt(req.params.inv_id);
      let nav = await utilities.getNav();
      const itemData = await invModel.getInventoryById(inv_id);
      const itemName = `${itemData.inv_make} ${itemData.inv_model}`;
      res.render("./inventory/delete-confirm", {
        title: "Delete " + itemName,
        nav,
        errors: null,
        ...itemData
      });
    } catch (error) {
      next(error);
    }
  },

  async deleteInventory(req, res, next) {
    try {
      const inv_id = parseInt(req.body.inv_id);
      const deleteResult = await invModel.deleteInventoryItem(inv_id);
      if (deleteResult && deleteResult.rowCount > 0) {
        req.flash("notice", "The inventory item was successfully deleted.");
        res.redirect("/inv/");
      } else {
        req.flash("error", "Sorry, the delete failed.");
        res.redirect(`/inv/delete/${inv_id}`);
      }
    } catch (error) {
      next(error);
    }
  }
};

module.exports = invCont;
