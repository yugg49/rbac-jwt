const express = require("express");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("./config");
const { users, posts } = require("./data/db");
const authenticate = require("./middleware/authenticate");
const authorize = require("./middleware/authorize");

const app = express();
app.use(express.json());


app.post("/login", (req, res) => {
  const { username, password } = req.body;

  const user = users.find(
    (u) => u.username === username && u.password === password
  );

  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign(
    { id: user.id, role: user.role },
    JWT_SECRET,
    { expiresIn: "1h" }
  );

  return res.json({ token });
});


// Any logged-in user
app.get("/profile", authenticate, (req, res) => {
  res.json({ message: "Your profile", user: req.user });
});

// Moderators and admins only
app.get("/reports", authenticate, authorize("moderator", "admin"), (req, res) => {
  res.json({ message: "Here are the flagged reports" });
});

// Admins only
app.delete("/users/:id", authenticate, authorize("admin"), (req, res) => {
  res.json({ message: `User ${req.params.id} deleted` });
});

// ---------------------------------------------------------------
// BONUS: RBAC + OWNERSHIP
// Users can delete their OWN posts; admins can delete ANY post.
// ---------------------------------------------------------------
app.delete("/posts/:id", authenticate, (req, res) => {
  const postId = Number(req.params.id);
  const post = posts.find((p) => p.id === postId);

  if (!post) {
    return res.status(404).json({ message: "Post not found" });
  }

  const isOwner = post.authorId === req.user.id;
  const isAdmin = req.user.role === "admin";

  if (!isOwner && !isAdmin) {
    return res.status(403).json({ message: "You can only delete your own posts" });
  }

  return res.status(200).json({ message: `Post ${postId} deleted` });
});

// Start the server only when run directly (lets test.js import the app)
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
}

module.exports = app;
