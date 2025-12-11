# Postman Testing Guide - CORRECTED GATEWAY PATTERN

## Architecture Overview

**CRITICAL:** Tokens NEVER leave the backend. The gateway server:
1. Frontend sends JWT only
2. Backend stores Keyrock tokens in session
3. Backend proxies all PEP Proxy requests using stored OAuth2 token
4. Frontend NEVER sees Keyrock tokens

---

## Prerequisites

```bash
# Start services
docker-compose up -d

# Start gateway (restart if already running to load new env vars)
npm run start:dev
```

---

## Test 1: Login

**Endpoint:** `POST http://localhost:3000/auth/login`

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "email": "admin@test.com",
  "password": "1234"
}
```

**Expected Response (200):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 3600,
  "user": {
    "id": "admin",
    "username": "admin",
    "email": "admin@test.com",
    "roles": ["provider"]
  }
}
```

**Postman Test Script:**
```javascript
pm.environment.set("jwt_token", pm.response.json().accessToken);
```

**Note:** JWT contains ONLY user info - NO TOKENS

---

## Test 2: Get Current User

**Endpoint:** `GET http://localhost:3000/auth/me`

**Headers:**
```
Authorization: Bearer {{jwt_token}}
```

**Expected Response (200):**
```json
{
  "user": {
    "id": "admin",
    "username": "admin",
    "email": "admin@test.com",
    "roles": ["provider"]
  }
}
```

---

## Test 3: Get Entities (Through Gateway Proxy)

**Endpoint:** `GET http://localhost:3000/orion/entities`

**Headers:**
```
Authorization: Bearer {{jwt_token}}
```

**Expected Response (200):**
```json
[]
```

**How it works:**
1. Frontend sends JWT to gateway
2. Gateway extracts userId from JWT
3. Gateway gets OAuth2 token from session
4. Gateway proxies request to PEP Proxy with OAuth2 token
5. Gateway returns Orion response to frontend

---

## Test 4: Create Entity (Through Gateway Proxy)

**Endpoint:** `POST http://localhost:3000/orion/entities`

**Headers:**
```
Authorization: Bearer {{jwt_token}}
Content-Type: application/json
```

**Body:**
```json
{
  "id": "urn:ngsi-ld:Store:001",
  "type": "Store",
  "address": {
    "type": "PostalAddress",
    "value": {
      "streetAddress": "Bornholmer Straße 65",
      "addressRegion": "Berlin",
      "addressLocality": "Prenzlauer Berg",
      "postalCode": "10439"
    }
  },
  "location": {
    "type": "geo:json",
    "value": {
      "type": "Point",
      "coordinates": [13.3986, 52.5547]
    }
  },
  "name": {
    "type": "Text",
    "value": "Bösebrücke Einkauf"
  }
}
```

**Expected Response (201):**
Empty body with status 201 Created

---

## Test 5: Get Single Entity (Through Gateway Proxy)

**Endpoint:** `GET http://localhost:3000/orion/entities/urn:ngsi-ld:Store:001`

**Headers:**
```
Authorization: Bearer {{jwt_token}}
```

**Expected Response (200):**
```json
{
  "id": "urn:ngsi-ld:Store:001",
  "type": "Store",
  "address": { ... },
  "location": { ... },
  "name": { ... }
}
```

---

## Test 6: Update Entity (Through Gateway Proxy)

**Endpoint:** `PATCH http://localhost:3000/orion/entities/urn:ngsi-ld:Store:001/attrs`

**Headers:**
```
Authorization: Bearer {{jwt_token}}
Content-Type: application/json
```

**Body:**
```json
{
  "name": {
    "type": "Text",
    "value": "Updated Store Name"
  }
}
```

**Expected Response (204):**
Empty body with status 204 No Content

---

## Test 7: Delete Entity (Through Gateway Proxy)

**Endpoint:** `DELETE http://localhost:3000/orion/entities/urn:ngsi-ld:Store:001`

**Headers:**
```
Authorization: Bearer {{jwt_token}}
```

**Expected Response (204):**
Empty body with status 204 No Content

---

## Test 8: List Users (Keyrock Management via Gateway)

**Endpoint:** `GET http://localhost:3000/users`

**Headers:**
```
Authorization: Bearer {{jwt_token}}
```

**Expected Response (200):**
```json
{
  "users": [
    {
      "id": "admin",
      "username": "admin",
      "email": "admin@test.com"
    }
  ]
}
```

**How it works:**
- Frontend sends JWT
- Backend gets Keyrock management token from session
- Backend calls Keyrock API with management token
- Returns user list to frontend

---

## Test 9: Create User (Keyrock Management via Gateway)

**Endpoint:** `POST http://localhost:3000/users`

**Headers:**
```
Authorization: Bearer {{jwt_token}}
Content-Type: application/json
```

**Body:**
```json
{
  "username": "newuser",
  "email": "newuser@test.com",
  "password": "password123"
}
```

**Expected Response (201):**
```json
{
  "user": {
    "id": "uuid-generated-id",
    "username": "newuser",
    "email": "newuser@test.com"
  }
}
```

---

## Test 10: List Roles (Keyrock Management via Gateway)

**Endpoint:** `GET http://localhost:3000/roles`

**Headers:**
```
Authorization: Bearer {{jwt_token}}
```

**Expected Response (200):**
```json
{
  "roles": [
    {
      "id": "provider",
      "name": "Provider"
    }
  ]
}
```

---

## Test 11: Create Role (Keyrock Management via Gateway)

**Endpoint:** `POST http://localhost:3000/roles`

**Headers:**
```
Authorization: Bearer {{jwt_token}}
Content-Type: application/json
```

**Body:**
```json
{
  "name": "CustomRole"
}
```

**Expected Response (201):**
```json
{
  "role": {
    "id": "role-uuid",
    "name": "CustomRole"
  }
}
```

---

## Test 12: Assign Role to User (Keyrock Management via Gateway)

**Endpoint:** `POST http://localhost:3000/users/{userId}/roles`

**Headers:**
```
Authorization: Bearer {{jwt_token}}
Content-Type: application/json
```

**Body:**
```json
{
  "roleId": "provider"
}
```

**Expected Response (200):**
```json
{
  "message": "Role assigned successfully"
}
```

---

## Test 13: List Permissions (Keyrock Management via Gateway)

**Endpoint:** `GET http://localhost:3000/permissions`

**Headers:**
```
Authorization: Bearer {{jwt_token}}
```

**Expected Response (200):**
```json
{
  "permissions": [
    {
      "id": "perm-uuid",
      "name": "Read Stores",
      "action": "GET",
      "resource": "stores"
    }
  ]
}
```

---

## Test 14: Create Permission (Keyrock Management via Gateway)

**Endpoint:** `POST http://localhost:3000/permissions`

**Headers:**
```
Authorization: Bearer {{jwt_token}}
Content-Type: application/json
```

**Body:**
```json
{
  "name": "Read Stores",
  "action": "GET",
  "resource": "stores",
  "description": "Permission to read stores"
}
```

**Expected Response (201):**
```json
{
  "permission": {
    "id": "perm-uuid",
    "name": "Read Stores",
    "action": "GET",
    "resource": "stores"
  }
}
```

---

## Test 15: Logout

**Endpoint:** `POST http://localhost:3000/auth/logout`

**Headers:**
```
Authorization: Bearer {{jwt_token}}
```

**Expected Response (200):**
```json
{
  "message": "Logged out successfully"
}
```

**After logout:** All gateway requests fail with 401 (session destroyed)

---

## Test 16: Expired Token Auto-Refresh

**How to test:**
1. Login
2. Wait for OAuth2 token to expire (or modify session manually)
3. Make Orion request through gateway
4. Gateway automatically refreshes OAuth2 token
5. Request succeeds without frontend knowing

---

## Complete Postman Collection

```json
{
  "info": {
    "name": "SSIO Gateway - Secure Pattern",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Auth",
      "item": [
        {
          "name": "1. Login",
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": ["pm.environment.set(\"jwt_token\", pm.response.json().accessToken);"],
                "type": "text/javascript"
              }
            }
          ],
          "request": {
            "method": "POST",
            "header": [{"key": "Content-Type", "value": "application/json"}],
            "body": {
              "mode": "raw",
              "raw": "{\"email\": \"admin@test.com\", \"password\": \"1234\"}"
            },
            "url": "http://localhost:3000/auth/login"
          }
        },
        {
          "name": "2. Get Current User",
          "request": {
            "method": "GET",
            "header": [{"key": "Authorization", "value": "Bearer {{jwt_token}}"}],
            "url": "http://localhost:3000/auth/me"
          }
        },
        {
          "name": "3. Logout",
          "request": {
            "method": "POST",
            "header": [{"key": "Authorization", "value": "Bearer {{jwt_token}}"}],
            "url": "http://localhost:3000/auth/logout"
          }
        }
      ]
    },
    {
      "name": "Orion (via Gateway)",
      "item": [
        {
          "name": "Get All Entities",
          "request": {
            "method": "GET",
            "header": [{"key": "Authorization", "value": "Bearer {{jwt_token}}"}],
            "url": "http://localhost:3000/orion/entities"
          }
        },
        {
          "name": "Create Entity",
          "request": {
            "method": "POST",
            "header": [
              {"key": "Authorization", "value": "Bearer {{jwt_token}}"},
              {"key": "Content-Type", "value": "application/json"}
            ],
            "body": {
              "mode": "raw",
              "raw": "{\"id\":\"urn:ngsi-ld:Store:001\",\"type\":\"Store\",\"name\":{\"type\":\"Text\",\"value\":\"Test Store\"}}"
            },
            "url": "http://localhost:3000/orion/entities"
          }
        },
        {
          "name": "Get Entity by ID",
          "request": {
            "method": "GET",
            "header": [{"key": "Authorization", "value": "Bearer {{jwt_token}}"}],
            "url": "http://localhost:3000/orion/entities/urn:ngsi-ld:Store:001"
          }
        },
        {
          "name": "Update Entity",
          "request": {
            "method": "PATCH",
            "header": [
              {"key": "Authorization", "value": "Bearer {{jwt_token}}"},
              {"key": "Content-Type", "value": "application/json"}
            ],
            "body": {
              "mode": "raw",
              "raw": "{\"name\":{\"type\":\"Text\",\"value\":\"Updated Store\"}}"
            },
            "url": "http://localhost:3000/orion/entities/urn:ngsi-ld:Store:001/attrs"
          }
        },
        {
          "name": "Delete Entity",
          "request": {
            "method": "DELETE",
            "header": [{"key": "Authorization", "value": "Bearer {{jwt_token}}"}],
            "url": "http://localhost:3000/orion/entities/urn:ngsi-ld:Store:001"
          }
        }
      ]
    },
    {
      "name": "Users (via Gateway)",
      "item": [
        {
          "name": "List Users",
          "request": {
            "method": "GET",
            "header": [{"key": "Authorization", "value": "Bearer {{jwt_token}}"}],
            "url": "http://localhost:3000/users"
          }
        },
        {
          "name": "Create User",
          "request": {
            "method": "POST",
            "header": [
              {"key": "Authorization", "value": "Bearer {{jwt_token}}"},
              {"key": "Content-Type", "value": "application/json"}
            ],
            "body": {
              "mode": "raw",
              "raw": "{\"username\":\"testuser\",\"email\":\"testuser@test.com\",\"password\":\"password123\"}"
            },
            "url": "http://localhost:3000/users"
          }
        },
        {
          "name": "Get User by ID",
          "request": {
            "method": "GET",
            "header": [{"key": "Authorization", "value": "Bearer {{jwt_token}}"}],
            "url": "http://localhost:3000/users/USER_ID"
          }
        },
        {
          "name": "Update User",
          "request": {
            "method": "PUT",
            "header": [
              {"key": "Authorization", "value": "Bearer {{jwt_token}}"},
              {"key": "Content-Type", "value": "application/json"}
            ],
            "body": {
              "mode": "raw",
              "raw": "{\"username\":\"updateduser\",\"email\":\"updated@test.com\"}"
            },
## Security Validation Checklist

- [ ] JWT contains NO tokens (only user ID, email, roles)
- [ ] No `/auth/tokens` endpoint exists
- [ ] Frontend NEVER receives Keyrock tokens
- [ ] All Orion requests go through gateway (OAuth2 token from session)
- [ ] All Users/Roles/Permissions requests go through gateway (Management token from session)
- [ ] Gateway automatically handles token refresh
- [ ] Session destroyed on logout
- [ ] PEP Proxy not directly accessible to frontend
- [ ] Keyrock APIs not directly accessible to frontendR_ID/roles"
          }
        },
        {
          "name": "Assign Role to User",
          "request": {
            "method": "POST",
            "header": [
              {"key": "Authorization", "value": "Bearer {{jwt_token}}"},
              {"key": "Content-Type", "value": "application/json"}
            ],
            "body": {
              "mode": "raw",
              "raw": "{\"roleId\":\"ROLE_ID\"}"
            },
            "url": "http://localhost:3000/users/USER_ID/roles"
          }
        },
        {
          "name": "Remove Role from User",
          "request": {
            "method": "DELETE",
            "header": [{"key": "Authorization", "value": "Bearer {{jwt_token}}"}],
            "url": "http://localhost:3000/users/USER_ID/roles/ROLE_ID"
          }
        },
        {
          "name": "Delete User",
          "request": {
            "method": "DELETE",
            "header": [{"key": "Authorization", "value": "Bearer {{jwt_token}}"}],
            "url": "http://localhost:3000/users/USER_ID"
          }
        }
      ]
    },
    {
      "name": "Roles (via Gateway)",
      "item": [
        {
          "name": "List Roles",
          "request": {
            "method": "GET",
            "header": [{"key": "Authorization", "value": "Bearer {{jwt_token}}"}],
            "url": "http://localhost:3000/roles"
          }
        },
        {
          "name": "Create Role",
          "request": {
            "method": "POST",
            "header": [
              {"key": "Authorization", "value": "Bearer {{jwt_token}}"},
              {"key": "Content-Type", "value": "application/json"}
            ],
            "body": {
              "mode": "raw",
              "raw": "{\"name\":\"CustomRole\"}"
            },
            "url": "http://localhost:3000/roles"
          }
        },
        {
          "name": "Get Role by ID",
          "request": {
            "method": "GET",
            "header": [{"key": "Authorization", "value": "Bearer {{jwt_token}}"}],
            "url": "http://localhost:3000/roles/ROLE_ID"
          }
        },
        {
          "name": "Update Role",
          "request": {
            "method": "PUT",
            "header": [
              {"key": "Authorization", "value": "Bearer {{jwt_token}}"},
              {"key": "Content-Type", "value": "application/json"}
            ],
            "body": {
              "mode": "raw",
              "raw": "{\"name\":\"UpdatedRole\"}"
            },
            "url": "http://localhost:3000/roles/ROLE_ID"
          }
        },
        {
          "name": "Get Role Permissions",
          "request": {
            "method": "GET",
            "header": [{"key": "Authorization", "value": "Bearer {{jwt_token}}"}],
            "url": "http://localhost:3000/roles/ROLE_ID/permissions"
          }
        },
        {
          "name": "Assign Permission to Role",
          "request": {
            "method": "POST",
            "header": [
              {"key": "Authorization", "value": "Bearer {{jwt_token}}"},
              {"key": "Content-Type", "value": "application/json"}
            ],
            "body": {
              "mode": "raw",
              "raw": "{\"permissionId\":\"PERMISSION_ID\"}"
            },
            "url": "http://localhost:3000/roles/ROLE_ID/permissions"
          }
        },
        {
          "name": "Remove Permission from Role",
          "request": {
            "method": "DELETE",
            "header": [{"key": "Authorization", "value": "Bearer {{jwt_token}}"}],
            "url": "http://localhost:3000/roles/ROLE_ID/permissions/PERMISSION_ID"
          }
        },
        {
          "name": "Delete Role",
          "request": {
            "method": "DELETE",
            "header": [{"key": "Authorization", "value": "Bearer {{jwt_token}}"}],
            "url": "http://localhost:3000/roles/ROLE_ID"
          }
        }
      ]
    },
    {
      "name": "Permissions (via Gateway)",
      "item": [
        {
          "name": "List Permissions",
          "request": {
            "method": "GET",
            "header": [{"key": "Authorization", "value": "Bearer {{jwt_token}}"}],
            "url": "http://localhost:3000/permissions"
          }
        },
        {
          "name": "Create Permission",
          "request": {
            "method": "POST",
            "header": [
              {"key": "Authorization", "value": "Bearer {{jwt_token}}"},
              {"key": "Content-Type", "value": "application/json"}
            ],
            "body": {
              "mode": "raw",
              "raw": "{\"name\":\"Read Stores\",\"action\":\"GET\",\"resource\":\"stores\",\"description\":\"Permission to read stores\"}"
            },
            "url": "http://localhost:3000/permissions"
          }
        },
        {
          "name": "Get Permission by ID",
          "request": {
            "method": "GET",
            "header": [{"key": "Authorization", "value": "Bearer {{jwt_token}}"}],
            "url": "http://localhost:3000/permissions/PERMISSION_ID"
          }
        },
        {
          "name": "Update Permission",
          "request": {
            "method": "PUT",
            "header": [
              {"key": "Authorization", "value": "Bearer {{jwt_token}}"},
              {"key": "Content-Type", "value": "application/json"}
            ],
            "body": {
              "mode": "raw",
              "raw": "{\"name\":\"Write Stores\",\"action\":\"POST\",\"resource\":\"stores\",\"description\":\"Permission to create stores\"}"
            },
            "url": "http://localhost:3000/permissions/PERMISSION_ID"
          }
        },
        {
          "name": "Delete Permission",
          "request": {
            "method": "DELETE",
            "header": [{"key": "Authorization", "value": "Bearer {{jwt_token}}"}],
            "url": "http://localhost:3000/permissions/PERMISSION_ID"
          }
        }
      ]
    }
  ]
}
```

---

## Security Validation Checklist

- [ ] JWT contains NO tokens (only user ID, email, roles)
- [ ] No `/auth/tokens` endpoint exists
- [ ] Frontend NEVER receives Keyrock tokens
- [ ] All Orion requests go through gateway
- [ ] Gateway automatically handles token refresh
- [ ] Session destroyed on logout
- [ ] PEP Proxy not directly accessible to frontend

## Testing Flow

### Authentication Flow:
1. **Login** → Get JWT (contains NO tokens)
2. **Session Created** → Backend stores both tokens (Management + OAuth2)

### Orion Context Broker Flow:
1. **Frontend** → Sends JWT to gateway `/orion/*` endpoints
2. **Gateway** → Extracts userId from JWT
3. **Gateway** → Gets OAuth2 token from session
4. **Gateway** → Proxies request to PEP Proxy with OAuth2 token
5. **Response** → Gateway returns Orion data to frontend

### Keyrock Management Flow (Users/Roles/Permissions):
1. **Frontend** → Sends JWT to gateway `/users/*`, `/roles/*`, `/permissions/*` endpoints
2. **Gateway** → Extracts userId from JWT
3. **Gateway** → Gets Management token from session
4. **Gateway** → Calls Keyrock API with Management token
5. **Response** → Gateway returns Keyrock data to frontend

### Logout Flow:
1. **Logout** → Session destroyed, both tokens gone from memoryn, proxies to PEP Proxy
4. **Response** → Gateway returns Orion data to frontend
5. **Logout** → Session destroyed, tokens gone

---

## Error Scenarios

### 401 on Auth Endpoints
- Check Keyrock is running: `docker ps | grep keyrock`
- Verify credentials in Keyrock UI: http://localhost:3005/idm
- Check logs: `docker logs <keyrock-container>`

### 401 on Orion Endpoints
- Ensure you're logged in (JWT is valid)
- Session might be expired - login again
- Check PEP Proxy: `docker ps | grep pep-proxy`

### Session Not Found
- Backend restarted (sessions are in-memory)
- Login again to create new session
