/* ******************************************
 * Account Model
 * Handles database operations for accounts
 *******************************************/

// Require database connection
const pool = require('../database/');

/* *****************************
 *   Register new account
 * *************************** */
async function registerAccount(account_firstname, account_lastname, account_email, account_password){
  try {
    const sql = "INSERT INTO account (account_firstname, account_lastname, account_email, account_password, account_type) VALUES ($1, $2, $3, $4, 'Client') RETURNING *"
    const result = await pool.query(sql, [account_firstname, account_lastname, account_email, account_password])
    return result.rows[0]
  } catch (error) {
    console.error("registerAccount error:", error.message)
    return null
  }
}

/* *****************************
 * Return account data using email address
 * ***************************** */
async function getAccountByEmail(account_email) {
  try {
    const result = await pool.query(
      'SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password FROM account WHERE account_email = $1',
      [account_email])
    return result.rows[0] || null
  } catch (error) {
    console.error("getAccountByEmail error:", error.message)
    return null
  }
}

/* *****************************
 * Get Account by ID
 * *************************** */
async function getAccountById(account_id) {
  try {
    const sql = "SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password FROM account WHERE account_id = $1"
    const result = await pool.query(sql, [account_id])
    return result.rows[0] || null
  } catch (error) {
    console.error("getAccountById error:", error.message)
    return null
  }
}

/* *****************************
 * Update Account Information (Basic)
 * Updates firstname, lastname, email only
 * *************************** */
async function updateAccountBasic(account_id, account_firstname, account_lastname, account_email) {
  try {
    const sql = `
      UPDATE account 
      SET account_firstname = $1, 
          account_lastname = $2, 
          account_email = $3
      WHERE account_id = $4 
      RETURNING account_id, account_firstname, account_lastname, account_email, account_type
    `;
    
    const result = await pool.query(sql, [
      account_firstname,
      account_lastname,
      account_email,
      account_id
    ]);
    
    return result.rows[0] || null;
  } catch (error) {
    console.error("updateAccountBasic error:", error.message);
    return null;
  }
}

/* *****************************
 * Update Account Information (Complete)
 * *************************** */
async function updateAccount(updateData) {
  try {
    let sql, params;
    
    if (updateData.account_password) {
      // Update with password
      sql = `
        UPDATE account 
        SET account_firstname = $1, 
            account_lastname = $2, 
            account_email = $3,
            account_password = $4
        WHERE account_id = $5 
        RETURNING account_id, account_firstname, account_lastname, account_email, account_type
      `;
      params = [
        updateData.account_firstname,
        updateData.account_lastname,
        updateData.account_email,
        updateData.account_password,
        updateData.account_id
      ];
    } else {
      // Update without password
      sql = `
        UPDATE account 
        SET account_firstname = $1, 
            account_lastname = $2, 
            account_email = $3
        WHERE account_id = $4 
        RETURNING account_id, account_firstname, account_lastname, account_email, account_type
      `;
      params = [
        updateData.account_firstname,
        updateData.account_lastname,
        updateData.account_email,
        updateData.account_id
      ];
    }
    
    const result = await pool.query(sql, params);
    return result.rows[0] || null;
  } catch (error) {
    console.error("updateAccount model error:", error.message);
    return null;
  }
}

/* *****************************
 * Update Account Password Only
 * *************************** */
async function updateAccountPassword(account_id, hashedPassword) {
  try {
    const sql = "UPDATE account SET account_password = $1 WHERE account_id = $2 RETURNING account_id"
    const result = await pool.query(sql, [hashedPassword, account_id])
    return result.rows[0] || null
  } catch (error) {
    console.error("updateAccountPassword error:", error.message)
    return null
  }
}

// Export the functions
module.exports = { 
  registerAccount, 
  getAccountByEmail,
  getAccountById,
  updateAccountBasic,    
  updateAccount,        
  updateAccountPassword  
}