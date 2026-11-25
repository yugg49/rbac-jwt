# RBAC Demo: Authorization Middleware in Express

## Run

```bash
npm install
npm start        # server on http://localhost:3000
npm test         # runs the full test matrix automatically
```

## Project structure

```
rbac-demo/
├── app.js                    # routes (login, RBAC routes, ownership bonus)
├── config.js                 # JWT secret
├── data/db.js                # fake users and posts
├── middleware/
│   ├── authenticate.js       # "Who are you?"  → 401 if no/invalid token
│   └── authorize.js          # "What can you do?" → 403 if role not allowed
└── test.js                   # automated test matrix
```

## Demo users

| Username | Password | Role |
|---|---|---|
| alice | alice123 | admin |
| bob | bob123 | moderator |
| carol | carol123 | user |

## Manual testing with curl

```bash
# Log in and copy the token
curl -X POST http://localhost:3000/login -H "Content-Type: application/json" \
  -d '{"username":"carol","password":"carol123"}'

# Use the token
curl -X DELETE http://localhost:3000/users/5 -H "Authorization: Bearer <TOKEN>"
```

## Expected results

| Route | No token | carol (user) | bob (moderator) | alice (admin) |
|---|---|---|---|---|
| GET /profile | 401 | 200 | 200 | 200 |
| GET /reports | 401 | 403 | 200 | 200 |
| DELETE /users/:id | 401 | 403 | 403 | 200 |
| DELETE /posts/1 (carol's) | 401 | 200 | 403 | 200 |
