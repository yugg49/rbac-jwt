// In real apps, read this from an environment variable: process.env.JWT_SECRET
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";

module.exports = { JWT_SECRET };
