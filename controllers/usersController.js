
const pool = require("../config/db");

// GET: Fetch all users
async function getUsers(req, res) {
  try {
    const result = await pool.query(
      "SELECT * FROM users ORDER BY id ASC"
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching users:", error.message);
    res.status(500).json({ error: "Failed to fetch users" });
  }
}

// Shared validation for POST and PUT
function validateUser(req, res) {
  const { name, email } = req.body;

  if (
    typeof name !== "string" ||
    typeof email !== "string" ||
    !name.trim() ||
    !email.trim()
  ) {
    res.status(400).json({
      error: "Name and email are required",
    });
    return null;
  }

  const cleanName = name.trim();
  const cleanEmail = email.trim();

  if (cleanName.length > 100 || cleanEmail.length > 150) {
    res.status(400).json({
      error: "Name or email is too long",
    });
    return null;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    res.status(400).json({
      error: "Please provide a valid email address",
    });
    return null;
  }

  return { name: cleanName, email: cleanEmail };
}

// POST: Create a user
async function createUser(req, res) {
  const user = validateUser(req, res);
  if (!user) return;

  try {
    const result = await pool.query(
      "INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *",
      [user.name, user.email]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({ error: "Email already exists" });
    }

    console.error("Error creating user:", error.message);
    res.status(500).json({ error: "Failed to create user" });
  }
}

// PUT: Update a user
async function updateUser(req, res) {
  const id = req.params.id;

  if (!/^[1-9]\d*$/.test(id)) {
    return res.status(400).json({ error: "Invalid user ID" });
  }

  const user = validateUser(req, res);
  if (!user) return;

  try {
    const result = await pool.query(
      `UPDATE users
       SET name = $1, email = $2
       WHERE id = $3
       RETURNING *`,
      [user.name, user.email, Number(id)]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({ error: "Email already exists" });
    }

    console.error("Error updating user:", error.message);
    res.status(500).json({ error: "Failed to update user" });
  }
}

// DELETE: Remove a user
async function deleteUser(req, res) {
  const id = req.params.id;

  if (!/^[1-9]\d*$/.test(id)) {
    return res.status(400).json({ error: "Invalid user ID" });
  }

  try {
    const result = await pool.query(
      "DELETE FROM users WHERE id = $1 RETURNING id",
      [Number(id)]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error.message);
    res.status(500).json({ error: "Failed to delete user" });
  }
}

module.exports = {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
};
