/* ******************************************
 * Modèle d'Inventaire
 * Gère les opérations de base de données pour l'inventaire
 *******************************************/

const pool = require('../database/');

/* *****************************
 * Obtenir toutes les classifications
 * *************************** */
async function getClassifications() {
  try {
    const sql = "SELECT * FROM public.classification ORDER BY classification_name";
    const result = await pool.query(sql);
    return result.rows;
  } catch (error) {
    console.error("getClassifications error:", error.message);
    return [];
  }
}

/* *****************************
 * Obtenir l'inventaire par ID de classification
 * *************************** */
async function getInventoryByClassificationId(classification_id) {
  try {
    const sql = `
      SELECT * FROM public.inventory AS inv
      JOIN public.classification AS cla ON inv.classification_id = cla.classification_id
      WHERE inv.classification_id = $1
      ORDER BY inv.inv_make, inv.inv_model
    `;
    const result = await pool.query(sql, [classification_id]);
    return result.rows;
  } catch (error) {
    console.error("getInventoryByClassificationId error:", error.message);
    return [];
  }
}

/* *****************************
 * Obtenir les détails d'un véhicule par ID
 * *************************** */
async function getInventoryById(inv_id) {
  try {
    const sql = "SELECT * FROM public.inventory WHERE inv_id = $1";
    const result = await pool.query(sql, [inv_id]);
    return result.rows[0] || null;
  } catch (error) {
    console.error("getInventoryById error:", error.message);
    return null;
  }
}

/* *****************************
 * Ajouter une nouvelle classification
 * *************************** */
async function addClassification(classification_name) {
  try {
    const sql = "INSERT INTO public.classification (classification_name) VALUES ($1) RETURNING *";
    const result = await pool.query(sql, [classification_name]);
    return result.rows[0];
  } catch (error) {
    console.error("addClassification error:", error.message);
    return null;
  }
}

/* *****************************
 * Ajouter un nouveau véhicule à l'inventaire
 * *************************** */
async function addInventory(invData) {
  try {
    const sql = `
      INSERT INTO public.inventory (
        inv_make, inv_model, inv_year, inv_description, 
        inv_image, inv_thumbnail, inv_price, inv_miles, 
        inv_color, classification_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
      RETURNING *
    `;
    
    const result = await pool.query(sql, [
      invData.inv_make,
      invData.inv_model,
      invData.inv_year,
      invData.inv_description,
      invData.inv_image,
      invData.inv_thumbnail,
      invData.inv_price,
      invData.inv_miles,
      invData.inv_color,
      invData.classification_id
    ]);
    
    return result.rows[0];
  } catch (error) {
    console.error("addInventory error:", error.message);
    return null;
  }
}

/* *****************************
 * Mettre à jour un véhicule dans l'inventaire
 * *************************** */
async function updateInventory(inv_id, invData) {
  try {
    const sql = `
      UPDATE public.inventory 
      SET 
        inv_make = $1, 
        inv_model = $2, 
        inv_year = $3, 
        inv_description = $4, 
        inv_image = $5, 
        inv_thumbnail = $6, 
        inv_price = $7, 
        inv_miles = $8, 
        inv_color = $9, 
        classification_id = $10,
        inv_updated = NOW()
      WHERE inv_id = $11 
      RETURNING *
    `;
    
    const result = await pool.query(sql, [
      invData.inv_make,
      invData.inv_model,
      invData.inv_year,
      invData.inv_description,
      invData.inv_image,
      invData.inv_thumbnail,
      invData.inv_price,
      invData.inv_miles,
      invData.inv_color,
      invData.classification_id,
      inv_id
    ]);
    
    return result.rows[0];
  } catch (error) {
    console.error("updateInventory error:", error.message);
    return null;
  }
}

/* *****************************
 * Supprimer un véhicule de l'inventaire
 * *************************** */
async function deleteInventory(inv_id) {
  try {
    const sql = "DELETE FROM public.inventory WHERE inv_id = $1 RETURNING *";
    const result = await pool.query(sql, [inv_id]);
    return result.rows[0];
  } catch (error) {
    console.error("deleteInventory error:", error.message);
    return null;
  }
}

// Exporter les fonctions
module.exports = { 
  getClassifications,
  getInventoryByClassificationId,
  getInventoryById,
  addClassification,
  addInventory,
  updateInventory,
  deleteInventory
};