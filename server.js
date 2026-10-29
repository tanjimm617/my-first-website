require("dotenv").config();

const express = require("express");
const { Pool } = require("pg");

const app = express();
app.use(express.json());
const path = require("path");

app.use(express.static(path.join(__dirname, "public")));

const PORT = 3000;

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT),
});
app.use(express.json());



app.get("/", (req, res) => {
  res.send("Welcome to my Express server!");
});

app.get("/about", (req, res) => {
  res.send("This is my About page.");
});

app.get("/api", (req, res) => {
  res.json({
    message: "My first Express API",
    status: "working"
  });
});

// URL parameter
app.get("/api/users/:id", (req, res) => {
  res.json({
    message: "User found",
    id: req.params.id
  });
});

// Query string
app.get("/search", (req, res) => {
  res.json({
    searchTerm: req.query.keyword || "No keyword provided"
  });
});


let users = [
  { id: 1, name: "Rahim", email: "rahim@example.com" }
];

app.get("/api/users", (req, res) => {
  res.json(users);
});

app.post("/api/users", (req, res) => {
  const { name, email } = req.body;

  if (
  typeof name !== "string" ||
  typeof email !== "string" ||
  !name.trim() ||
  !email.trim()
) {
  return res.status(400).json({
    error: "Valid name and email are required",
  });
}

if (name.trim().length > 100 || email.trim().length > 150) {
  return res.status(400).json({
    error: "Name or email is too long",
  });
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

if (!emailPattern.test(email.trim())) {
  return res.status(400).json({
    error: "Please enter a valid email address",
  });
}

  const newUser = {
    id: users.length + 1,
    name: name,
    email: email
  };

  users.push(newUser);

  res.status(201).json(newUser);
});
pool.query("SELECT NOW()")
  .then((result) => {
    console.log("PostgreSQL connected!");
    console.log("Database time:", result.rows[0].now);
  })
  .catch((error) => {
    console.error("PostgreSQL connection failed:", error.message);
  });
pool.query("SELECT NOW()")
  .then((result) => {
    console.log("PostgreSQL connected!");
    console.log("Database time:", result.rows[0].now);
  })
  .catch((error) => {
  console.error("PostgreSQL connection failed:", error);
});
app.get("/api/db-users", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM users ORDER BY id ASC"
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching users:", error.message);
    res.status(500).json({
      error: "Failed to fetch users"
    });
  }
});

app.post("/api/db-users", async (req, res) => {
  try {
    const { name, email } = req.body;

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      !name.trim() ||
      !email.trim()
    ) {
      return res.status(400).json({
        error: "Valid name and email are required",
      });
    }

    if (name.trim().length > 100 || email.trim().length > 150) {
      return res.status(400).json({
        error: "Name or email is too long",
      });
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email.trim())) {
      return res.status(400).json({
        error: "Please enter a valid email address",
      });
    }

    const result = await pool.query(
      "INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *",
      [name.trim(), email.trim()]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error creating user:", error.message);

    if (error.code === "23505") {
      return res.status(409).json({
        error: "This email already exists",
      });
    }

    if (error.code === "23502" || error.code === "22001") {
      return res.status(400).json({
        error: "Invalid user data",
      });
    }

    res.status(500).json({
      error: "Internal server error",
    });
  }
});


app.put("/api/db-users/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { name, email } = req.body;

    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({
        error: "Invalid user ID",
      });
    }

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      !name.trim() ||
      !email.trim()
    ) {
      return res.status(400).json({
        error: "Valid name and email are required",
      });
    }

    if (name.trim().length > 100 || email.trim().length > 150) {
      return res.status(400).json({
        error: "Name or email is too long",
      });
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email.trim())) {
      return res.status(400).json({
        error: "Please enter a valid email address",
      });
    }

    const result = await pool.query(
      `UPDATE users
       SET name = $1, email = $2
       WHERE id = $3
       RETURNING *`,
      [name.trim(), email.trim(), id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating user:", error.message);

    if (error.code === "23505") {
      return res.status(409).json({
        error: "This email already exists",
      });
    }

    if (error.code === "23502" || error.code === "22001") {
      return res.status(400).json({
        error: "Invalid user data",
      });
    }

    res.status(500).json({
      error: "Internal server error",
    });
  }
});

app.delete("/api/db-users/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({
        error: "Invalid user ID",
      });
    }

    const result = await pool.query(
      "DELETE FROM users WHERE id = $1 RETURNING id, name, email",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    res.json({
      message: "User deleted successfully",
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Error deleting user:", error.message);

    res.status(500).json({
      error: "Failed to delete user",
    });
  }
});

// Keep app.listen at the bottom
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
