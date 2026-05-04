# Auth Endpoint — Manual Test Cases (curl)

> **Base URL**: `http://localhost:8000`
>
> Start the server first:
> ```bash
> cd backend
> uvicorn main:app --reload
> ```

---

## 1. Register a new user ✅

```bash
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "alice@example.com", "password": "StrongP@ss1", "full_name": "Alice Johnson"}'
```

**Expected response** (`201 Created`):

```json
{
  "id": 1,
  "email": "alice@example.com",
  "full_name": "Alice Johnson",
  "created_at": "2026-05-04T..."
}
```

---

## 2. Register with a duplicate email ❌

```bash
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "alice@example.com", "password": "AnotherP@ss", "full_name": "Alice Duplicate"}'
```

**Expected response** (`400 Bad Request`):

```json
{
  "detail": "A user with this email already exists"
}
```

---

## 3. Login with valid credentials ✅

```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "alice@example.com", "password": "StrongP@ss1"}'
```

**Expected response** (`200 OK`):

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer"
}
```

---

## 4. Login with wrong password ❌

```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "alice@example.com", "password": "WrongPassword"}'
```

**Expected response** (`401 Unauthorized`):

```json
{
  "detail": "Invalid email or password"
}
```

---

## 5. Login with non-existent email ❌

```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "nobody@example.com", "password": "Whatever123"}'
```

**Expected response** (`401 Unauthorized`):

```json
{
  "detail": "Invalid email or password"
}
```

---

## 6. Access a protected endpoint without token ❌

```bash
curl -X GET http://localhost:8000/me
```

**Expected response** (`403 Forbidden` — no `Authorization` header):

```json
{
  "detail": "Not authenticated"
}
```

---

## 7. Access a protected endpoint with valid token ✅

First, obtain a token from test 3, then:

```bash
curl -X GET http://localhost:8000/me \
  -H "Authorization: Bearer <paste_access_token_here>"
```

**Expected response** (`200 OK`):

```json
{
  "id": 1,
  "email": "alice@example.com",
  "full_name": "Alice Johnson",
  "created_at": "2026-05-04T..."
}
```

---

## 8. Access a protected endpoint with an invalid/expired token ❌

```bash
curl -X GET http://localhost:8000/me \
  -H "Authorization: Bearer invalid.token.here"
```

**Expected response** (`401 Unauthorized`):

```json
{
  "detail": "Could not validate credentials"
}
```
