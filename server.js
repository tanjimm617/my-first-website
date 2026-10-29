
const express = require("express");
const path = require("path");
const pool = require("./config/db");
const userRoutes = require("./routes/users");

const app = express();

app.use(express.json());
app.use("/api", userRoutes);
app.use(express.static(path.join(__dirname, "public")));

const PORT = 3000; 

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

// Keep app.listen at the bottom
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
