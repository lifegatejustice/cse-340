const invModel = require("../models/inventory-model");
const Util = {};

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
  let data = await invModel.getClassifications();
  console.log(data);
  let list = "<ul>";
  list += '<li><a href="/" title="Home page">Home</a></li>';
  data.rows.forEach((row) => {
    list += "<li>";
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>";
    list += "</li>";
  });
  list += "</ul>";
  return list;
};

/* **************************************
* Build the classification view HTML
* ************************************ */
Util.buildClassificationGrid = async function(data){
  let grid;
  if(data.length > 0){
    grid = '<ul id="inv-display">';
    data.forEach(vehicle => { 
      grid += '<li>';
      grid +=  '<a href="../../inv/detail/'+ vehicle.inv_id 
      + '" title="View ' + vehicle.inv_make + ' '+ vehicle.inv_model 
      + 'details"><img src="' + vehicle.inv_thumbnail 
      +'" alt="Image of '+ vehicle.inv_make + ' ' + vehicle.inv_model 
      +' on CSE Motors" /></a>';
      grid += '<div class="namePrice">';
      grid += '<hr />';
      grid += '<h2>';
      grid += '<a href="../../inv/detail/' + vehicle.inv_id +'" title="View ' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>';
      grid += '</h2>';
      grid += '<span>$' 
      + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>';
      grid += '</div>';
      grid += '</li>';
    });
    grid += '</ul>';
  } else { 
    grid = '<p class="notice">Sorry, no matching vehicles could be found.</p>';
  }
  return grid;
};

/* **************************************
* Build the vehicle detail view HTML
* ************************************ */
Util.buildVehicleDetailHTML = async function(vehicle) {
  let detail = '';
  if(vehicle) {
    detail += '<section class="vehicle-detail-container">';
    
    // Main Image and Thumbnails
    detail += '<figure class="vehicle-images">';
    detail += '<img class="main-image" src="' + vehicle.inv_image + '" alt="Image of ' + vehicle.inv_make + ' ' + vehicle.inv_model + '" />';
    detail += '<ul class="thumbnail-gallery">';
    detail += '<li><img src="' + (vehicle.inv_thumbnail || "/images/vehicles/no-image.png") + '" alt="Interior view of ' + vehicle.inv_make + ' ' + vehicle.inv_model + '" /></li>';
    detail += '<li><img src="' + (vehicle.inv_thumbnail || "/images/vehicles/no-image.png") + '" alt="Exterior view of ' + vehicle.inv_make + ' ' + vehicle.inv_model + '" /></li>';
    detail += '<li><img src="' + (vehicle.inv_thumbnail || "/images/vehicles/no-image.png") + '" alt="Engine view of ' + vehicle.inv_make + ' ' + vehicle.inv_model + '" /></li>';
    detail += '</ul>';
    detail += '</figure>';
    
    // Vehicle Info
    detail += '<article class="vehicle-info">';
    detail += '<div class="vehicle-info1">';
    detail += '<h1>' + vehicle.inv_year + ' ' + vehicle.inv_make + ' ' + vehicle.inv_model + ' ' + (vehicle.inv_trim || '') + '</h1>';
    detail += '<div class="nohag1">';
    detail += '<div class="nohag11">';
    detail += '<p class="price-label">No-Haggle Price<sup>1</sup></p>';
    detail += '<p class="price-value">$' + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</p>';
    detail += '</div>';
    detail += '<div class="nohag2">';
    detail += '<p class="mileage"><strong>Mileage:</strong> ' + new Intl.NumberFormat('en-US').format(vehicle.inv_miles) + '</p>';
    detail += '</div>';
    detail += '</div>';
    detail += '<p class="doc-fee-note">Does not include $299 Dealer Documentary Service Fee.</p>';
    detail += '</div>';
    detail += '<div class="info-div">';
    detail += '<div class="info">';
 
    detail += '<p class="mpg"><strong>Year:</strong> ' +  (vehicle.inv_year || 'N/A') + ' (City / Hwy)</p>';
    
    detail += '<ul class="specs-list">';
    detail += '<li><strong>Exterior Color:</strong> ' + vehicle.inv_color + '</li>';
    detail += '<li><strong>Description:</strong> ' + vehicle.inv_description + '</li>';
    // detail += '<li><strong>Fuel Type:</strong> ' + vehicle.inv_fuel_type + '</li>';
    // detail += '<li><strong>Drivetrain:</strong> ' + vehicle.inv_drivetrain + '</li>';
    // detail += '<li><strong>Transmission:</strong> ' + vehicle.inv_transmission + '</li>';
    // detail += '<li><strong>Stock #:</strong> ' + vehicle.inv_stock + '</li>';
    // detail += '<li><strong>VIN:</strong> ' + vehicle.inv_vin + '</li>';
    detail += '</ul>';
    detail += '</div>';
    
 
    // Call to Action Buttons
    detail += '<div class="cta-buttons">';
    detail += '<button class="btn btn-primary">Start My Purchase</button>';
    detail += '<button class="btn btn-secondary">Contact Us</button>';
    detail += '<button class="btn btn-secondary">Schedule Test Drive</button>';
    detail += '<button class="btn btn-secondary">Apply for Financing</button>';
    detail += '</div>';
    detail += '</div>';
 
       detail += '<p class="certification-note">This vehicle has passed inspection by an ASE-certified technician.</p>';
    detail += '<p class="rental-note">The principal prior use of this vehicle was as a Rental Vehicle.</p>';
 
 
    // Dealer Contact Info
    detail += '<div class="dealer-contact">';
    detail += '<p><strong>Call Us: </strong> <a href="tel:+234-814-090-8524">  +234-814-090-8524</a></p>';
    detail += '<p><strong>Visit Us: </strong> <span>1234 Car Dealer St, City, State</span></p>';
    detail += '</div>';
    
    detail += '</article>';
    detail += '</section>';
  } else {
    detail += '<p class="notice">Sorry, no vehicle details available.</p>';
  }
  return detail;
}

/* **************************************
* Handle errors for async route handlers
* ************************************ */
Util.handleErrors = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/* ****************************************
* Middleware to check token validity
**************************************** */
const jwt = require("jsonwebtoken")
require("dotenv").config()

Util.checkJWTToken = (req, res, next) => {
 if (req.cookies.jwt) {
  jwt.verify(
   req.cookies.jwt,
   process.env.ACCESS_TOKEN_SECRET,
   function (err, accountData) {
    if (err) {
     req.flash("Please log in")
     res.clearCookie("jwt")
     return res.redirect("/account/login")
    }
    res.locals.accountData = accountData
    res.locals.loggedin = 1
    next()
   })
 } else {
  next()
 }
}

/* ****************************************
* Middleware to check if user is logged in
**************************************** */
Util.checkLogin = (req, res, next) => {
  if (res.locals.loggedin) {
    next();
  } else {
    req.flash("Please log in");
    return res.redirect("/account/login");
  }
};

/* ****************************************
* Middleware to check if user is Employee or Admin
**************************************** */
Util.checkEmployeeAdmin = (req, res, next) => {
  if (res.locals.accountData && (res.locals.accountData.account_type === "Employee" || res.locals.accountData.account_type === "Admin")) {
    next();
  } else {
    req.flash("notice", "You do not have permission to access that page. Please log in with appropriate credentials.");
    res.status(403).render("account/login", {
      title: "Login",
      nav: res.locals.nav,
      errors: null,
    });
  }
};

module.exports = Util;
