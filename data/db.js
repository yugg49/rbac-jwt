// Fake in-memory database.
// In a real app this would be MongoDB/Postgres, and passwords would be hashed (bcrypt).

const users = [
  { id: 1, username: "alice", password: "alice123", role: "admin" },
  { id: 2, username: "bob", password: "bob123", role: "moderator" },
  { id: 3, username: "carol", password: "carol123", role: "user" },
];

const posts = [
  { id: 1, title: "Hello World", authorId: 3 }, // carol's post
  { id: 2, title: "Moderator News", authorId: 2 }, // bob's post
];

module.exports = { users, posts };
