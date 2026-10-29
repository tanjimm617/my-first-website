
const {
  getAllUsers,
  createUser: createUserModel,
  updateUser: updateUserModel,
  deleteUser: deleteUserModel,
} = require("../models/userModel");

// Validate name and email
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

// GET: Fetch all users
async function getUsers(req, res) {
  try {
    const users = await getAllUsers();
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error.message);
    res.status(500).json({ error: "Failed to fetch users" });
  }
}

// POST: Create a user
async function createUser(req, res) {
  const user = validateUser(req, res);
  if (!user) return;

  try {
    const newUser = await createUserModel(user.name, user.email);
    res.status(201).json(newUser);
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({
        error: "Email already exists",
      });
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
    const updatedUser = await updateUserModel(
      Number(id),
      user.name,
      user.email
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(updatedUser);
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({
        error: "Email already exists",
      });
    }

    console.error("Error updating user:", error.message);
    res.status(500).json({ error: "Failed to update user" });
  }
}

// DELETE: Delete a user
async function deleteUser(req, res) {
  const id = req.params.id;

  if (!/^[1-9]\d*$/.test(id)) {
    return res.status(400).json({ error: "Invalid user ID" });
  }

  try {
    const deletedUser = await deleteUserModel(Number(id));

    if (!deletedUser) {
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
