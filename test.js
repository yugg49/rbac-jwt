// Runs the full test matrix from the lecture: node test.js
const app = require("./app");

const server = app.listen(0, async () => {
  const base = `http://localhost:${server.address().port}`;

  async function login(username, password) {
    const res = await fetch(`${base}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    return (await res.json()).token;
  }

  const tokens = {
    "no token": null,
    carol: await login("carol", "carol123"),
    bob: await login("bob", "bob123"),
    alice: await login("alice", "alice123"),
  };

  const cases = [
    // [method, path, who, expectedStatus]
    ["GET", "/profile", "no token", 401],
    ["GET", "/profile", "carol", 200],
    ["GET", "/profile", "bob", 200],
    ["GET", "/profile", "alice", 200],
    ["GET", "/reports", "no token", 401],
    ["GET", "/reports", "carol", 403],
    ["GET", "/reports", "bob", 200],
    ["GET", "/reports", "alice", 200],
    ["DELETE", "/users/5", "no token", 401],
    ["DELETE", "/users/5", "carol", 403],
    ["DELETE", "/users/5", "bob", 403],
    ["DELETE", "/users/5", "alice", 200],
    ["DELETE", "/posts/1", "carol", 200], // carol owns post 1
    ["DELETE", "/posts/2", "carol", 403], // post 2 belongs to bob
    ["DELETE", "/posts/2", "alice", 200], // admin can delete any post
  ];

  let failed = 0;
  for (const [method, path, who, expected] of cases) {
    const headers = tokens[who] ? { Authorization: `Bearer ${tokens[who]}` } : {};
    const res = await fetch(base + path, { method, headers });
    const ok = res.status === expected;
    if (!ok) failed++;
    console.log(`${ok ? "PASS" : "FAIL"}  ${method.padEnd(6)} ${path.padEnd(10)} as ${who.padEnd(8)} -> ${res.status} (expected ${expected})`);
  }

  console.log(failed ? `\n${failed} test(s) failed` : "\nAll tests passed");
  server.close();
  process.exitCode = failed ? 1 : 0;
});
