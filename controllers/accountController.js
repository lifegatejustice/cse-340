const utilities = require("../utilities/index");
const accountModel = require("../models/account-model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken")
require("dotenv").config()

/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav();
  res.render("account/login", {
    title: "Login",
    nav,
  });
}

/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav();
  res.render("account/registration", {
    title: "Register",
    nav,
    errors: null,
  });
}

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav();
  const { account_firstname, account_lastname, account_email, account_password } = req.body;

  // Hash the password before storing
  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(account_password, 10);
  } catch (error) {
    req.flash("error", 'Sorry, there was an error processing the registration.');
    res.status(500).render("account/registration", {
      title: "Registration",
      nav,
      errors: null,
    });
    return;
  }

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  );

  if (regResult) {
    req.flash(
      "success",
      `Congratulations, you're registered ${account_firstname}. Please log in.`
    );
    res.redirect('/account/login');
  } else {
    req.flash("error", "Sorry, the registration failed.");
    res.status(501).render("account/registration", {
      title: "Registration",
      nav,
    });
  }
}

/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.")
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    })
    return
  }
  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
      if(process.env.NODE_ENV === 'development') {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
      } else {
        res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
      }
      return res.redirect("/account")
    }
    else {
      req.flash("message notice", "Please check your credentials and try again.")
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      })
    }
  } catch (error) {
    throw new Error('Access Forbidden')
  }
}

/* ****************************************
*  Deliver account management view
* *************************************** */
async function buildAccount(req, res, next) {
  let nav = await utilities.getNav();
  res.render("account/accountview", {
    title: "Account Management",
    nav,
  });
}



/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav();
  res.render("account/login", {
    title: "Login",
    nav,
  });
}

/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav();
  res.render("account/registration", {
    title: "Register",
    nav,
    errors: null,
  });
}

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav();
  const { account_firstname, account_lastname, account_email, account_password } = req.body;

  // Hash the password before storing
  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(account_password, 10);
  } catch (error) {
    req.flash("error", 'Sorry, there was an error processing the registration.');
    res.status(500).render("account/registration", {
      title: "Registration",
      nav,
      errors: null,
    });
    return;
  }

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  );

  if (regResult) {
    req.flash(
      "success",
      `Congratulations, you're registered ${account_firstname}. Please log in.`
    );
    res.redirect('/account/login');
  } else {
    req.flash("error", "Sorry, the registration failed.");
    res.status(501).render("account/registration", {
      title: "Registration",
      nav,
    });
  }
}

/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav();
  const { account_email, account_password } = req.body;
  const accountData = await accountModel.getAccountByEmail(account_email);
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.");
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    });
    return;
  }
  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password;
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 });
      if(process.env.NODE_ENV === 'development') {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 });
      } else {
        res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 });
      }
      return res.redirect("/account");
    }
    else {
      req.flash("message notice", "Please check your credentials and try again.");
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      });
    }
  } catch (error) {
    throw new Error('Access Forbidden');
  }
}

/* ****************************************
*  Deliver account management view
* *************************************** */
async function buildAccount(req, res, next) {
  let nav = await utilities.getNav();
  const accountData = res.locals.accountData;
  res.render("account/accountview", {
    title: "Account Management",
    nav,
    accountData,
    loggedin: res.locals.loggedin,
  });
}

/* ****************************************
*  Deliver account update view
* *************************************** */
async function buildUpdateAccount(req, res, next) {
  try {
    let nav = await utilities.getNav();
    const account_id = parseInt(req.params.account_id);
    const accountData = await accountModel.getAccountById(account_id);
    if (!accountData) {
      req.flash("error", "Account not found.");
      return res.redirect("/account/");
    }
    res.render("account/update-account", {
      title: "Update Account",
      nav,
      accountData,
      errors: null,
      loggedin: res.locals.loggedin,
    });
  } catch (error) {
    next(error);
  }
}

/* ****************************************
*  Process account update
* *************************************** */
async function updateAccount(req, res, next) {
  try {
    const { account_id, account_firstname, account_lastname, account_email } = req.body;
    const errors = [];

    if (!account_firstname || account_firstname.trim().length === 0) {
      errors.push({ msg: "First name is required." });
    }
    if (!account_lastname || account_lastname.trim().length === 0) {
      errors.push({ msg: "Last name is required." });
    }
    if (!account_email || account_email.trim().length === 0) {
      errors.push({ msg: "Email is required." });
    }

    if (errors.length > 0) {
      let nav = await utilities.getNav();
      return res.status(400).render("account/update-account", {
        title: "Update Account",
        nav,
        accountData: req.body,
        errors,
        loggedin: res.locals.loggedin,
      });
    }

    // Check if email already exists for another account
    const existingAccount = await accountModel.getAccountByEmail(account_email);
    if (existingAccount && existingAccount.account_id !== parseInt(account_id)) {
      errors.push({ msg: "Email is already in use." });
      let nav = await utilities.getNav();
      return res.status(400).render("account/update-account", {
        title: "Update Account",
        nav,
        accountData: req.body,
        errors,
        loggedin: res.locals.loggedin,
      });
    }

    const updateResult = await accountModel.updateAccountInfo(account_id, account_firstname, account_lastname, account_email);
    if (updateResult) {
      req.flash("success", "Account information updated successfully.");
      // Refresh account data after update
      const accountData = await accountModel.getAccountById(account_id);
      let nav = await utilities.getNav();
      return res.render("account/accountview", {
        title: "Account Management",
        nav,
        accountData,
        loggedin: res.locals.loggedin,
      });
    } else {
      req.flash("error", "Failed to update account information.");
      let nav = await utilities.getNav();
      return res.status(500).render("account/update-account", {
        title: "Update Account",
        nav,
        accountData: req.body,
        errors: null,
        loggedin: res.locals.loggedin,
      });
    }
  } catch (error) {
    next(error);
  }
}

/* ****************************************
*  Process password change
* *************************************** */
async function changePassword(req, res, next) {
  try {
    const { account_id, new_password } = req.body;
    const errors = [];

    if (!new_password || new_password.length < 8) {
      errors.push({ msg: "Password must be at least 8 characters long." });
    }
    // Add more password validation as needed

    if (errors.length > 0) {
      let nav = await utilities.getNav();
      const accountData = await accountModel.getAccountById(account_id);
      return res.status(400).render("account/update-account", {
        title: "Update Account",
        nav,
        accountData,
        errors,
        loggedin: res.locals.loggedin,
      });
    }

    const hashedPassword = await bcrypt.hash(new_password, 10);
    const updateResult = await accountModel.updatePassword(account_id, hashedPassword);
    if (updateResult) {
      req.flash("success", "Password updated successfully.");
      const accountData = await accountModel.getAccountById(account_id);
      let nav = await utilities.getNav();
      return res.render("account/accountview", {
        title: "Account Management",
        nav,
        accountData,
        loggedin: res.locals.loggedin,
      });
    } else {
      req.flash("error", "Failed to update password.");
      const accountData = await accountModel.getAccountById(account_id);
      let nav = await utilities.getNav();
      return res.status(500).render("account/update-account", {
        title: "Update Account",
        nav,
        accountData,
        errors: null,
        loggedin: res.locals.loggedin,
      });
    }
  } catch (error) {
    next(error);
  }
}

module.exports = {
  buildLogin,
  buildRegister,
  registerAccount,
  accountLogin,
  buildAccount,
  buildUpdateAccount,
  updateAccount,
  changePassword,
};
