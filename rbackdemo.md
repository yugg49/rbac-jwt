# RBAC Assignment: Build the Authorization Middleware

In this assignment you will finish a small Express app that uses **JWT authentication** and **Role-Based Access Control (RBAC)**.

Some parts of the code have been removed. Your job is to write them so that **all tests pass**.

---

## Setup

```bash
cd rbac-demo-template
npm install
npm test        # most tests will FAIL at first; that's expected
npm start       # runs the server on http://localhost:3000
```

> **Note:** until Tasks 1 and 2 are done, `npm test` will **hang and print nothing**. This is because the empty `/login` route and `authenticate` middleware never send a response. Press **Ctrl + C** to stop it.

---

## What is given

| File | Status | What it contains |
|---|---|---|
| `package.json` | ✅ Complete | Dependencies (`express`, `jsonwebtoken`) and the `start` / `test` scripts |
| `config.js` | ✅ Complete | Exports `JWT_SECRET`, used to sign and verify tokens |
| `data/db.js` | ✅ Complete | A fake database: 3 users (each with a `role`) and 2 posts (each with an `authorId`) |
| `test.js` | ✅ Complete | Automated tests that check every route for every user. **Don't edit this file.** |
| `README.md` | ✅ Complete | How to run the project, plus curl examples |
| `app.js` | ⚠️ Partly done | The `/profile`, `/reports` and `DELETE /users/:id` routes are complete. **`/login` and `DELETE /posts/:id` are empty.** |
| `middleware/authenticate.js` | ❌ Empty | Only the function name is there |
| `middleware/authorize.js` | ❌ Empty | Only the outer function and the `return` are there |

### Users in the database

| id | Username | Password | Role |
|---|---|---|---|
| 1 | alice | alice123 | admin |
| 2 | bob | bob123 | moderator |
| 3 | carol | carol123 | user |

### Posts in the database

| id | Title | authorId (owner) |
|---|---|---|
| 1 | Hello World | 3 (carol) |
| 2 | Moderator News | 2 (bob) |

---

## What you need to do

Complete the tasks **in order**. Each one builds on the one before.

### Task 1: Login route (`app.js`, `POST /login`)

The route should:
1. Read `username` and `password` from `req.body`.
2. Find the matching user in `users`.
3. If there's no match, respond with **401** and `{ message: "Invalid credentials" }`.
4. If there's a match, create a JWT with `jwt.sign()`. **Put the user's `id` and `role` in the token payload.** Use `JWT_SECRET` and set an expiry (for example `"1h"`).
5. Respond with `{ token }`.

> **Hint:** `app.js` doesn't import `jsonwebtoken` or `JWT_SECRET` yet. Add both imports at the top of the file.

### Task 2: Authentication middleware (`middleware/authenticate.js`)

The question this middleware answers is **"Who are you?"**

1. Fix the function so it receives Express middleware arguments: `(req, res, next)`.
2. Read the `Authorization` header. It looks like `Bearer <token>`.
3. If the header is missing or doesn't start with `"Bearer "`, respond with **401**.
4. Verify the token with `jwt.verify(token, JWT_SECRET)`.
   - If it's valid, save the decoded payload in `req.user` and call `next()`.
   - If it's invalid or expired (`jwt.verify` throws), respond with **401**.

> **Hint:** this file doesn't import `jsonwebtoken` yet. Use `try / catch` around `jwt.verify`.

### Task 3: Authorization middleware (`middleware/authorize.js`). ⭐ Main task

The question this middleware answers is **"What are you allowed to do?"**

`authorize` is a **middleware factory**: it receives the allowed roles and **returns** a middleware. It's used like this in `app.js`:

```js
authorize("admin")               // admins only
authorize("moderator", "admin")  // moderators and admins
```

Inside the returned middleware:
1. If `req.user` doesn't exist, respond with **401** (not logged in).
2. If `req.user.role` is **not** in `allowedRoles`, respond with **403** (logged in, but not allowed).
3. Otherwise call `next()` so the request reaches the route handler.

> **Hint:** `allowedRoles` is an array. Which array method tells you if it contains a value?

### Task 4 (Bonus): RBAC + ownership (`app.js`, `DELETE /posts/:id`)

Rule: **users can delete their own posts, and admins can delete any post.**

1. Find the post using `req.params.id`.
   > Watch out: `req.params.id` is a **string**, but `post.id` is a **number**.
2. If the post doesn't exist, respond with **404**.
3. Check two things:
   - Is the logged-in user the owner? 
   - Is the logged-in user an admin?
4. If **neither** is true, respond with **403**.
5. Otherwise respond with **200** and `{ message: "Post <id> deleted" }`.

---

## How to check your work

Run:

```bash
npm test
```

When everything is done, you should see `PASS` on every line and `All tests passed` at the end.

### Expected results

| Route | No token | carol (user) | bob (moderator) | alice (admin) |
|---|---|---|---|---|
| GET /profile | 401 | 200 | 200 | 200 |
| GET /reports | 401 | 403 | 200 | 200 |
| DELETE /users/:id | 401 | 403 | 403 | 200 |
| DELETE /posts/1 (carol's post) | 401 | 200 | 403 | 200 |
| DELETE /posts/2 (bob's post) | 401 | 403 | 200 | 200 |

You can also test manually with Postman, Thunder Client or curl (see `README.md`).

---

## Remember

- **401 Unauthorized** means "I don't know who you are" (no token or a bad token).
- **403 Forbidden** means "I know who you are, but you're not allowed."
- On each route, `authenticate` must run **before** `authorize`.
- Always take the role from the **verified token** (`req.user.role`), never from `req.body`.

---

## Submission checklist

- [ ] `POST /login` returns a token containing `id` and `role`
- [ ] `authenticate` returns 401 for a missing or invalid token and sets `req.user`
- [ ] `authorize(...roles)` returns 403 for wrong roles and calls `next()` for allowed ones
- [ ] (Bonus) `DELETE /posts/:id` lets owners and admins delete, returns 403 for everyone else
- [ ] `npm test` shows **All tests passed**
