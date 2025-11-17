const pool = require("../database/")

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications(){
  try {
    // Petit délai pour laisser la DB Render se réveiller
    await new Promise(resolve => setTimeout(resolve, 1000))
    const data = await pool.query("SELECT * FROM public.classification ORDER BY classification_name")
    return data.rows // CORRECTION: retourner data.rows au lieu de data
  } catch (error) {
    console.error("getClassifications error: " + error)
    throw error // CORRECTION: throw au lieu de return error
  }
}

/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
      JOIN public.classification AS c 
      ON i.classification_id = c.classification_id 
      WHERE i.classification_id = $1`,
      [classification_id]
    )
    return data.rows
  } catch (error) {
    console.error("getInventoryByClassificationId error: " + error)
    throw error // CORRECTION: throw au lieu de return error
  }
}

/* ***************************
 *  Get inventory and classification data by inv_id
 *  Assignment 3, Task 1
 * ************************** */
async function getInventoryById(inv_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
      JOIN public.classification AS c 
      ON i.classification_id = c.classification_id 
      WHERE i.inv_id = $1`,
      [inv_id]
    )
    return data.rows[0] || null
  } catch (error) {
    console.error("getInventoryById error: " + error)
    throw error // CORRECTION: throw au lieu de return error
  }
}

module.exports = {getClassifications, getInventoryByClassificationId, getInventoryById}