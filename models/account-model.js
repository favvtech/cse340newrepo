const pool = require("../database/")

/* *****************************
 * Register new account
 * ***************************** */
async function registerAccount(
  account_firstname,
  account_lastname,
  account_email,
  account_password
) {
  try {
    const sql =
      "INSERT INTO account (account_firstname, account_lastname, account_email, account_password) VALUES ($1, $2, $3, $4) RETURNING *"
    return await pool.query(sql, [
      account_firstname,
      account_lastname,
      account_email,
      account_password,
    ])
  } catch (error) {
    return error.message
  }
}

module.exports = { registerAccount }

