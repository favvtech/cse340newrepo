const jwt = require("jsonwebtoken")
require("dotenv").config()

const utilities = require("../utilities/")
const accountModel = require("../models/account-model")
const bcrypt = require("bcryptjs")

async function buildLogin(req, res, next) {
  const nav = await utilities.getNav()
  res.render("account/login", {
    title: "Login",
    nav,
    errors: null,
  })
}

async function buildRegister(req, res, next) {
  const nav = await utilities.getNav()
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null,
  })
}

/* *****************************
 * Process Registration
 * ***************************** */
async function registerAccount(req, res) {
  const nav = await utilities.getNav()
  const {
    account_firstname,
    account_lastname,
    account_email,
    account_password,
  } = req.body

  // Hash the password before storing
  let hashedPassword
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", "Sorry, there was an error processing the registration.")
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    })
    return
  }

  const regResult = await accountModel.accountRegister(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  )

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you've registered ${account_firstname}. Please log in.`
    )
    res.status(201).render("account/login", {
      title: "Login",
      nav,
      errors: null,
    })
  } else {
    req.flash("notice", "Sorry, the registration failed.")
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    })
  }
}

/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)
  if (!accountData || accountData instanceof Error) {
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
      const accessToken = jwt.sign(
        accountData,
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: 3600 * 1000 }
      )
      if (process.env.NODE_ENV === "development") {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
      } else {
        res.cookie("jwt", accessToken, {
          httpOnly: true,
          secure: true,
          maxAge: 3600 * 1000,
        })
      }
      return res.redirect("/account/")
    } else {
      req.flash("notice", "Please check your credentials and try again.")
      return res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      })
    }
  } catch (error) {
    throw new Error("Access Forbidden")
  }
}

async function buildManagement(req, res, next) {
  const nav = await utilities.getNav()
  const accountData = await accountModel.getAccountById(res.locals.accountData.account_id)
  res.render("./account/index", {
    title: "Account Management",
    nav,
    errors: null,
    accountData,
  })
}

/* *****************************
 * Build account update view
 * ***************************** */
async function buildUpdateAccount(req, res, next) {
  const nav = await utilities.getNav()
  const account_id = parseInt(req.params.account_id, 10)
  const accountData = await accountModel.getAccountById(account_id)
  if (!accountData) {
    req.flash("notice", "Account data not found.")
    return res.redirect("/account/")
  }
  res.render("account/update", {
    title: "Update Account",
    nav,
    errors: null,
    account_id: accountData.account_id,
    account_firstname: accountData.account_firstname,
    account_lastname: accountData.account_lastname,
    account_email: accountData.account_email,
  })
}

/* *****************************
 * Process account update
 * ***************************** */
async function updateAccount(req, res, next) {
  const nav = await utilities.getNav()
  const { account_id, account_firstname, account_lastname, account_email } = req.body

  const currentByEmail = await accountModel.getAccountByEmail(account_email)
  if (
    currentByEmail &&
    !(currentByEmail instanceof Error) &&
    String(currentByEmail.account_id) !== String(account_id)
  ) {
    req.flash("notice", "That email already exists. Please use a different email.")
    return res.status(400).render("account/update", {
      title: "Update Account",
      nav,
      errors: null,
      account_id,
      account_firstname,
      account_lastname,
      account_email,
    })
  }

  const updateResult = await accountModel.updateAccount(
    account_firstname,
    account_lastname,
    account_email,
    account_id
  )

  if (updateResult && !(updateResult instanceof Error) && typeof updateResult !== "string") {
    req.flash("notice", "Account information updated successfully.")
    const refreshed = await accountModel.getAccountById(account_id)
    if (refreshed && !(refreshed instanceof Error)) {
      const tokenData = {
        account_id: refreshed.account_id,
        account_firstname: refreshed.account_firstname,
        account_lastname: refreshed.account_lastname,
        account_email: refreshed.account_email,
        account_type: refreshed.account_type,
      }
      const accessToken = jwt.sign(tokenData, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: 3600 * 1000,
      })
      if (process.env.NODE_ENV === "development") {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
      } else {
        res.cookie("jwt", accessToken, {
          httpOnly: true,
          secure: true,
          maxAge: 3600 * 1000,
        })
      }
    }
    return res.redirect("/account/")
  }

  req.flash("notice", "Sorry, the account update failed.")
  return res.status(500).render("account/update", {
    title: "Update Account",
    nav,
    errors: null,
    account_id,
    account_firstname,
    account_lastname,
    account_email,
  })
}

/* *****************************
 * Process password update
 * ***************************** */
async function updatePassword(req, res, next) {
  const nav = await utilities.getNav()
  const { account_id, account_password } = req.body

  let hashedPassword
  try {
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", "Sorry, there was an error processing the password.")
    const accountData = await accountModel.getAccountById(account_id)
    return res.status(500).render("account/update", {
      title: "Update Account",
      nav,
      errors: null,
      account_id,
      account_firstname: accountData ? accountData.account_firstname : "",
      account_lastname: accountData ? accountData.account_lastname : "",
      account_email: accountData ? accountData.account_email : "",
    })
  }

  const updateResult = await accountModel.updatePassword(hashedPassword, account_id)
  if (updateResult && !(updateResult instanceof Error) && typeof updateResult !== "string") {
    req.flash("notice", "Password updated successfully.")
    return res.redirect("/account/")
  }

  req.flash("notice", "Sorry, the password update failed.")
  const accountData = await accountModel.getAccountById(account_id)
  return res.status(500).render("account/update", {
    title: "Update Account",
    nav,
    errors: null,
    account_id,
    account_firstname: accountData ? accountData.account_firstname : "",
    account_lastname: accountData ? accountData.account_lastname : "",
    account_email: accountData ? accountData.account_email : "",
  })
}

/* *****************************
 * Process logout
 * ***************************** */
async function accountLogout(req, res, next) {
  res.clearCookie("jwt")
  req.session.destroy(() => {
    res.redirect("/")
  })
}

module.exports = {
  buildLogin,
  buildRegister,
  registerAccount,
  accountLogin,
  buildManagement,
  buildUpdateAccount,
  updateAccount,
  updatePassword,
  accountLogout,
}

