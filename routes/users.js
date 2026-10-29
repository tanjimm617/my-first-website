const express = require("express");
const router = express.Router();

const {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
} = require("../controllers/usersController");

router.get("/db-users", getUsers);
router.post("/db-users", createUser);
router.put("/db-users/:id", updateUser);
router.delete("/db-users/:id", deleteUser);

module.exports = router;
