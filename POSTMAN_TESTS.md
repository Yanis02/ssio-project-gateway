# Postman Testing Guide for Authentication

## Prerequisites

1. **Start your services:**
```bash
# Make sure Keyrock and other services are running
docker-compose up -d

# Start NestJS backend
npm run start:dev
```

2. **Create a test user in Keyrock** (if not already exists):
   - Go to http://localhost:3005/idm
   - Login as admin or create a new user
   - Note the email and password

---

## Test 1: Login (Get Both Tokens + JWT)

**Endpoint:** `POST http://localhost:3000/auth/login`

**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "email": "admin@test.com",
  "password": "1234"
}
```

**Expected Response (200 OK):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 3600,
  "user": {
    "id": "admin-user-id",
    "username": "admin",
    "email": "admin@test.com",
    "roles": ["admin", "provider"]
  }
}
```

**What to save:**
- Copy the `accessToken` value
- In Postman, go to the "Tests" tab and add:
```javascript
pm.environment.set("jwt_token", pm.response.json().accessToken);
```

---

## Test 2: Get Current User (Protected Route)

**Endpoint:** `GET http://localhost:3000/auth/me`

**Headers:**
```
Authorization: Bearer {{jwt_token}}
```

**Body:** None

**Expected Response (200 OK):**
```json
{
  "user": {
    "id": "admin-user-id",
    "username": "admin",
    "email": "admin@test.com",
    "roles": ["admin", "provider"]
  }
}
```

**Test without token:**
Remove the Authorization header → Should get `401 Unauthorized`

---

## Test 3: Get Tokens for PEP Proxy Access

**Endpoint:** `GET http://localhost:3000/auth/tokens`

**Headers:**
```
Authorization: Bearer {{jwt_token}}
```

**Body:** None

**Expected Response (200 OK):**
```json
{
  "managementToken": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
  "oauth2Token": "a7e22dfe2bd7d883c8621b9eb50797a7f126eeab"
}
```

**What to save:**
```javascript
// In Postman Tests tab:
pm.environment.set("oauth2_token", pm.response.json().oauth2Token);
pm.environment.set("management_token", pm.response.json().managementToken);
```

---

## Test 4: Access Orion Through PEP Proxy (Using OAuth2 Token)

**Endpoint:** `GET http://localhost:1027/v2/entities`

**Headers:**
```
X-Auth-Token: {{oauth2_token}}
```
OR
```
Authorization: Bearer {{oauth2_token}}
```

**Body:** None

**Expected Response (200 OK):**
```json
[]
```
or list of entities if you have any

**Test without token:**
Remove the header → Should get `401 Unauthorized` with message "Auth-token not found in request header"

---

## Test 5: Logout

**Endpoint:** `POST http://localhost:3000/auth/logout`

**Headers:**
```
Authorization: Bearer {{jwt_token}}
```

**Body:** None

**Expected Response (200 OK):**
```json
{
  "message": "Logged out successfully"
}
```

**After logout:**
Try to access `/auth/me` again → Should get `401 Unauthorized` (session deleted)

---

## Test 6: Invalid JWT Token

**Endpoint:** `GET http://localhost:3000/auth/me`

**Headers:**
```
Authorization: Bearer invalid-token-here
```

**Expected Response (401 Unauthorized):**
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

---

## Complete Postman Collection (Import this JSON)

Create a new collection and import this:

```json
{
  "info": {
    "name": "SSIO Auth Testing",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "1. Login",
      "event": [
        {
          "listen": "test",
          "script": {
            "exec": [
              "pm.environment.set(\"jwt_token\", pm.response.json().accessToken);"
            ],
            "type": "text/javascript"
          }
        }
      ],
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"email\": \"admin@test.com\",\n  \"password\": \"1234\"\n}"
        },
        "url": {
          "raw": "http://localhost:3000/auth/login",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3000",
          "path": ["auth", "login"]
        }
      }
    },
    {
      "name": "2. Get Current User",
      "request": {
        "method": "GET",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{jwt_token}}"
          }
        ],
        "url": {
          "raw": "http://localhost:3000/auth/me",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3000",
          "path": ["auth", "me"]
        }
      }
    },
    {
      "name": "3. Get Tokens",
      "event": [
        {
          "listen": "test",
          "script": {
            "exec": [
              "pm.environment.set(\"oauth2_token\", pm.response.json().oauth2Token);",
              "pm.environment.set(\"management_token\", pm.response.json().managementToken);"
            ],
            "type": "text/javascript"
          }
        }
      ],
      "request": {
        "method": "GET",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{jwt_token}}"
          }
        ],
        "url": {
          "raw": "http://localhost:3000/auth/tokens",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3000",
          "path": ["auth", "tokens"]
        }
      }
    },
    {
      "name": "4. Access Orion (PEP Proxy)",
      "request": {
        "method": "GET",
        "header": [
          {
            "key": "X-Auth-Token",
            "value": "{{oauth2_token}}"
          }
        ],
        "url": {
          "raw": "http://localhost:1027/v2/entities",
          "protocol": "http",
          "host": ["localhost"],
          "port": "1027",
          "path": ["v2", "entities"]
        }
      }
    },
    {
      "name": "5. Logout",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{jwt_token}}"
          }
        ],
        "url": {
          "raw": "http://localhost:3000/auth/logout",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3000",
          "path": ["auth", "logout"]
        }
      }
    }
  ]
}
```

---

## Environment Variables Setup

Create a Postman environment with these variables:

| Variable | Initial Value | Current Value |
|----------|---------------|---------------|
| jwt_token | (empty) | (auto-set by tests) |
| oauth2_token | (empty) | (auto-set by tests) |
| management_token | (empty) | (auto-set by tests) |

---

## Testing Checklist

- [ ] Test 1: Login with valid credentials → Get JWT token
- [ ] Test 2: Access `/auth/me` with JWT → Get user info
- [ ] Test 3: Access `/auth/tokens` → Get both Keyrock tokens
- [ ] Test 4: Use OAuth2 token to access PEP Proxy → Access Orion
- [ ] Test 5: Logout → Session destroyed
- [ ] Test 6: Try accessing `/auth/me` after logout → Should fail
- [ ] Test 7: Try accessing PEP Proxy without token → Should fail
- [ ] Test 8: Try accessing `/auth/me` with invalid JWT → Should fail

---

## Common Issues & Solutions

### Issue 1: 401 Unauthorized on login
**Cause:** Keyrock is not running or user doesn't exist
**Solution:** 
```bash
docker-compose up -d
# Check Keyrock: http://localhost:3005/idm
```

### Issue 2: "KEYROCK_CLIENT_ID not found"
**Cause:** Environment variables not set
**Solution:** Create `.env` file:
```env
KEYROCK_URL=http://localhost:3005
KEYROCK_CLIENT_ID=your-client-id
KEYROCK_CLIENT_SECRET=your-client-secret
KEYROCK_CALLBACK_URL=http://localhost:3000/auth/callback
KEYROCK_APP_ID=your-app-id
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=1h
```

### Issue 3: Session not found after login
**Cause:** Backend restarted (sessions are in-memory)
**Solution:** Login again to create new session

### Issue 4: PEP Proxy returns 401
**Cause:** OAuth2 token is invalid or expired
**Solution:** 
1. Login again to get fresh tokens
2. Check if Keyrock application is configured correctly
3. Verify PEP Proxy is running: `docker ps | grep pep-proxy`

---

## Advanced: Testing Token Refresh

The system automatically refreshes expired OAuth2 tokens. To test:

1. Login and get JWT
2. Wait for OAuth2 token to expire (default: 1 hour)
3. Access `/auth/me` → Backend should auto-refresh OAuth2 token
4. Session should be updated with new token

**Manual refresh test:**
- Modify `oauth2TokenExpiry` in session to a past date
- Access `/auth/me`
- Check logs for "Token refreshed" message
