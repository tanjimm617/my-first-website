

const pool = require("../config/db");

// GET: Fetch all users
async function getAllUsers() {
  const result = await pool.query(
    "SELECT * FROM users ORDER BY id ASC"
  );

  return result.rows;
}

// POST: Create a user
async function createUser(name, email) {
  const result = await pool.query(
    `INSERT INTO users (name, email)
     VALUES ($1, $2)
     RETURNING *`,
    [name, email]
  );

  return result.rows[0];
}

// PUT: Update a user
async function updateUser(id, name, email) {
  const result = await pool.query(
    `UPDATE users
     SET name = $1, email = $2
     WHERE id = $3
     RETURNING *`,
    [name, email, id]
  );

  return result.rows[0] || null;
}

// DELETE: Delete a user
async function deleteUser(id) {
  const result = await pool.query(
    "DELETE FROM users WHERE id = $1 RETURNING id",
    [id]
  );

  return result.rows[0] || null;
}

module.exports = {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
};
