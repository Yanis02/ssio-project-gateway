# Complete Postman Testing Guide - SSIO Gateway

## All Endpoints Reference

### Gateway Base URL
```
http://localhost:3000
```

---

## Prerequisites

1. **Start all services:**
```bash
docker-compose up -d
npm run start:dev
```

2. **Create Environment Variables in Postman:**
- `gateway_url` = `http://localhost:3000`
- `jwt_token` = (auto-set after login)
- `fiware_service` = `openiot`
- `fiware_servicepath` = `/`

---

## Collection 1: Authentication (3 tests)

### Test 1: Login
**POST** `{{gateway_url}}/auth/login`

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

**Postman Test Script:**
```javascript
pm.environment.set("jwt_token", pm.response.json().accessToken);
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

---

### Test 2: Get Current User
**GET** `{{gateway_url}}/auth/me`

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

### Test 3: Logout
**POST** `{{gateway_url}}/auth/logout`

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

---

## Collection 2: Users Management (8 tests)

**Note:** All require JWT authentication

### Test 4: List All Users
**GET** `{{gateway_url}}/users`

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

---

### Test 5: Create User
**POST** `{{gateway_url}}/users`

**Headers:**
```
Authorization: Bearer {{jwt_token}}
Content-Type: application/json
```

**Body:**
```json
    {
    "username": "testuser",
    "email": "testuser@test.com",
    "password": "password123"
    }
```

**Postman Test Script:**
```javascript
pm.environment.set("created_user_id", pm.response.json().user.id);
```

**Expected Response (201):**
```json
{
  "user": {
    "id": "uuid-generated-id",
    "username": "testuser",
    "email": "testuser@test.com"
  }
}
```

---

### Test 6: Get User by ID
**GET** `{{gateway_url}}/users/{{created_user_id}}`

**Headers:**
```
Authorization: Bearer {{jwt_token}}
```

**Expected Response (200):**
```json
{
  "id": "uuid-generated-id",
  "username": "testuser",
  "email": "testuser@test.com"
}
```

---

### Test 7: Update User
**PUT** `{{gateway_url}}/users/{{created_user_id}}`

**Headers:**
```
Authorization: Bearer {{jwt_token}}
Content-Type: application/json
```

**Body:**
```json
{
  "username": "updateduser",
  "email": "updated@test.com"
}
```

**Expected Response (200):**
```json
{
  "id": "uuid-generated-id",
  "username": "updateduser",
  "email": "updated@test.com"
}
```

---

### Test 8: Get User Roles
**GET** `{{gateway_url}}/users/{{created_user_id}}/roles`

**Headers:**
```
Authorization: Bearer {{jwt_token}}
```

**Expected Response (200):**
```json
{
  "roles": []
}
```

---

### Test 9: Assign Role to User
**POST** `{{gateway_url}}/users/{{created_user_id}}/roles`

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

### Test 10: Remove Role from User
**DELETE** `{{gateway_url}}/users/{{created_user_id}}/roles/provider`

**Headers:**
```
Authorization: Bearer {{jwt_token}}
```

**Expected Response (200):**
```json
{
  "message": "Role removed successfully"
}
```

---

### Test 11: Delete User
**DELETE** `{{gateway_url}}/users/{{created_user_id}}`

**Headers:**
```
Authorization: Bearer {{jwt_token}}
```

**Expected Response (200):**
```json
{
  "message": "User deleted successfully"
}
```

---

## Collection 3: Roles Management (8 tests)

### Test 12: List All Roles
**GET** `{{gateway_url}}/roles`

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

### Test 13: Create Role
**POST** `{{gateway_url}}/roles`

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

**Postman Test Script:**
```javascript
pm.environment.set("created_role_id", pm.response.json().role.id);
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

### Test 14: Get Role by ID
**GET** `{{gateway_url}}/roles/{{created_role_id}}`

**Headers:**
```
Authorization: Bearer {{jwt_token}}
```

**Expected Response (200):**
```json
{
  "id": "role-uuid",
  "name": "CustomRole"
}
```

---

### Test 15: Update Role
**PUT** `{{gateway_url}}/roles/{{created_role_id}}`

**Headers:**
```
Authorization: Bearer {{jwt_token}}
Content-Type: application/json
```

**Body:**
```json
{
  "name": "UpdatedRole"
}
```

**Expected Response (200):**
```json
{
  "id": "role-uuid",
  "name": "UpdatedRole"
}
```

---

### Test 16: Get Role Permissions
**GET** `{{gateway_url}}/roles/{{created_role_id}}/permissions`

**Headers:**
```
Authorization: Bearer {{jwt_token}}
```

**Expected Response (200):**
```json
{
  "permissions": []
}
```

---

### Test 17: Assign Permission to Role
**POST** `{{gateway_url}}/roles/{{created_role_id}}/permissions`

**Headers:**
```
Authorization: Bearer {{jwt_token}}
Content-Type: application/json
```

**Body:**
```json
{
  "permissionId": "permission-uuid"
}
```

**Expected Response (200):**
```json
{
  "message": "Permission assigned successfully"
}
```

---

### Test 18: Remove Permission from Role
**DELETE** `{{gateway_url}}/roles/{{created_role_id}}/permissions/permission-uuid`

**Headers:**
```
Authorization: Bearer {{jwt_token}}
```

**Expected Response (200):**
```json
{
  "message": "Permission removed successfully"
}
```

---

### Test 19: Delete Role
**DELETE** `{{gateway_url}}/roles/{{created_role_id}}`

**Headers:**
```
Authorization: Bearer {{jwt_token}}
```

**Expected Response (200):**
```json
{
  "message": "Role deleted successfully"
}
```

---

## Collection 4: Permissions Management (5 tests)

### Test 20: List All Permissions
**GET** `{{gateway_url}}/permissions`

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

### Test 21: Create Permission
**POST** `{{gateway_url}}/permissions`

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

**Postman Test Script:**
```javascript
pm.environment.set("created_permission_id", pm.response.json().permission.id);
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

### Test 22: Get Permission by ID
**GET** `{{gateway_url}}/permissions/{{created_permission_id}}`

**Headers:**
```
Authorization: Bearer {{jwt_token}}
```

**Expected Response (200):**
```json
{
  "id": "perm-uuid",
  "name": "Read Stores",
  "action": "GET",
  "resource": "stores"
}
```

---

### Test 23: Update Permission
**PUT** `{{gateway_url}}/permissions/{{created_permission_id}}`

**Headers:**
```
Authorization: Bearer {{jwt_token}}
Content-Type: application/json
```

**Body:**
```json
{
  "name": "Write Stores",
  "action": "POST",
  "resource": "stores",
  "description": "Permission to create stores"
}
```

**Expected Response (200):**
```json
{
  "id": "perm-uuid",
  "name": "Write Stores",
  "action": "POST",
  "resource": "stores"
}
```

---

### Test 24: Delete Permission
**DELETE** `{{gateway_url}}/permissions/{{created_permission_id}}`

**Headers:**
```
Authorization: Bearer {{jwt_token}}
```

**Expected Response (200):**
```json
{
  "message": "Permission deleted successfully"
}
```

---

## Collection 5: Orion Context Broker (13 tests)

**Note:** All requests go through PEP Proxy gateway with JWT authentication

### Test 25: Get All Entities
**GET** `{{gateway_url}}/orion/entities`

**Headers:**
```
Authorization: Bearer {{jwt_token}}
```

**Expected Response (200):**
```json
[]
```

---

### Test 26: Create Entity
**POST** `{{gateway_url}}/orion/entities`

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

### Test 27: Get Entity by ID
**GET** `{{gateway_url}}/orion/entities/urn:ngsi-ld:Store:001`

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
  "name": {
    "type": "Text",
    "value": "Bösebrücke Einkauf",
    "metadata": {}
  }
}
```

---

### Test 28: Update Entity Attributes (PATCH)
**PATCH** `{{gateway_url}}/orion/entities/urn:ngsi-ld:Store:001/attrs`

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

### Test 29: Replace Entity Attributes (PUT)
**PUT** `{{gateway_url}}/orion/entities/urn:ngsi-ld:Store:001/attrs`

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
    "value": "Completely Replaced Name"
  },
  "category": {
    "type": "Text",
    "value": "Grocery"
  }
}
```

**Expected Response (204):**
Empty body with status 204 No Content

---

### Test 30: Get Entity Types
**GET** `{{gateway_url}}/orion/types`

**Headers:**
```
Authorization: Bearer {{jwt_token}}
```

**Expected Response (200):**
```json
[
  {
    "type": "Store",
    "attrs": {
      "name": { "types": ["Text"] },
      "address": { "types": ["PostalAddress"] },
      "location": { "types": ["geo:json"] }
    },
    "count": 1
  }
]
```

---

### Test 31: Batch Update Operation
**POST** `{{gateway_url}}/orion/op/update`

**Headers:**
```
Authorization: Bearer {{jwt_token}}
Content-Type: application/json
```

**Body:**
```json
{
  "actionType": "append",
  "entities": [
    {
      "id": "urn:ngsi-ld:Store:002",
      "type": "Store",
      "name": {
        "type": "Text",
        "value": "Second Store"
      }
    }
  ]
}
```

**Expected Response (204):**
Empty body with status 204 No Content

---

### Test 32: List Subscriptions
**GET** `{{gateway_url}}/orion/subscriptions`

**Headers:**
```
Authorization: Bearer {{jwt_token}}
```

**Expected Response (200):**
```json
[]
```

---

### Test 33: Create Subscription
**POST** `{{gateway_url}}/orion/subscriptions`

**Headers:**
```
Authorization: Bearer {{jwt_token}}
Content-Type: application/json
```

**Body:**
```json
{
  "description": "Notify me of all store changes",
  "subject": {
    "entities": [
      {
        "idPattern": ".*",
        "type": "Store"
      }
    ],
    "condition": {
      "attrs": ["name"]
    }
  },
  "notification": {
    "http": {
      "url": "http://localhost:3000/notify"
    },
    "attrs": ["name", "location"]
  }
}
```

**Postman Test Script:**
```javascript
pm.environment.set("subscription_id", pm.response.headers.get("Location").split("/").pop());
```

**Expected Response (201):**
Returns subscription ID in Location header

---

### Test 34: Get Subscription by ID
**GET** `{{gateway_url}}/orion/subscriptions/{{subscription_id}}`

**Headers:**
```
Authorization: Bearer {{jwt_token}}
```

**Expected Response (200):**
```json
{
  "id": "subscription-uuid",
  "description": "Notify me of all store changes",
  "status": "active",
  "subject": { ... },
  "notification": { ... }
}
```

---

### Test 35: Update Subscription
**PATCH** `{{gateway_url}}/orion/subscriptions/{{subscription_id}}`

**Headers:**
```
Authorization: Bearer {{jwt_token}}
Content-Type: application/json
```

**Body:**
```json
{
  "status": "inactive"
}
```

**Expected Response (204):**
Empty body with status 204 No Content

---

### Test 36: Delete Subscription
**DELETE** `{{gateway_url}}/orion/subscriptions/{{subscription_id}}`

**Headers:**
```
Authorization: Bearer {{jwt_token}}
```

**Expected Response (204):**
Empty body with status 204 No Content

---

### Test 37: Delete Entity
**DELETE** `{{gateway_url}}/orion/entities/urn:ngsi-ld:Store:001`

**Headers:**
```
Authorization: Bearer {{jwt_token}}
```

**Expected Response (204):**
Empty body with status 204 No Content

---

## Collection 6: IoT Agent - Service Groups (3 tests)

**Note:** No JWT required, uses FIWARE-Service headers

### Test 38: Create Service Group
**POST** `{{gateway_url}}/iot/groups`

**Headers:**
```
Fiware-Service: {{fiware_service}}
Fiware-ServicePath: {{fiware_servicepath}}
Content-Type: application/json
```

**Body:**
```json
{
  "services": [
    {
      "apikey": "4jggokgpepnvsb2uv4s40d59ov",
      "entity_type": "Thing",
      "resource": "/iot/d",
      "attributes": [
        {
          "object_id": "t",
          "name": "temperature",
          "type": "Number"
        },
        {
          "object_id": "h",
          "name": "humidity",
          "type": "Number"
        }
      ]
    }
  ]
}
```

**Expected Response (201):**
Empty body with status 201 Created

---

### Test 39: List Service Groups
**GET** `{{gateway_url}}/iot/groups`

**Headers:**
```
Fiware-Service: {{fiware_service}}
Fiware-ServicePath: {{fiware_servicepath}}
```

**Expected Response (200):**
```json
{
  "count": 1,
  "services": [
    {
      "apikey": "4jggokgpepnvsb2uv4s40d59ov",
      "entity_type": "Thing",
      "resource": "/iot/d",
      "attributes": [
        {
          "object_id": "t",
          "name": "temperature",
          "type": "Number"
        }
      ]
    }
  ]
}
```

---

### Test 40: Delete Service Group
**DELETE** `{{gateway_url}}/iot/groups?resource=/iot/d&apikey=4jggokgpepnvsb2uv4s40d59ov`

**Headers:**
```
Fiware-Service: {{fiware_service}}
Fiware-ServicePath: {{fiware_servicepath}}
```

**Expected Response (204):**
Empty body with status 204 No Content

---

## Collection 7: IoT Agent - Devices (5 tests)

### Test 41: Create Device
**POST** `{{gateway_url}}/iot/devices`

**Headers:**
```
Fiware-Service: {{fiware_service}}
Fiware-ServicePath: {{fiware_servicepath}}
Content-Type: application/json
```

**Body:**
```json
{
  "devices": [
    {
      "device_id": "motion001",
      "entity_name": "urn:ngsi-ld:Motion:001",
      "entity_type": "Motion",
      "apikey": "4jggokgpepnvsb2uv4s40d59ov",
      "protocol": "PDI-IoTA-UltraLight",
      "transport": "HTTP",
      "attributes": [
        {
          "object_id": "c",
          "name": "count",
          "type": "Integer"
        }
      ]
    }
  ]
}
```

**Expected Response (201):**
Empty body with status 201 Created

---

### Test 42: List All Devices
**GET** `{{gateway_url}}/iot/devices`

**Headers:**
```
Fiware-Service: {{fiware_service}}
Fiware-ServicePath: {{fiware_servicepath}}
```

**Expected Response (200):**
```json
{
  "count": 1,
  "devices": [
    {
      "device_id": "motion001",
      "entity_name": "urn:ngsi-ld:Motion:001",
      "entity_type": "Motion",
      "apikey": "4jggokgpepnvsb2uv4s40d59ov",
      "protocol": "PDI-IoTA-UltraLight",
      "transport": "HTTP",
      "attributes": [ ... ]
    }
  ]
}
```

---

### Test 43: Get Device by ID
**GET** `{{gateway_url}}/iot/devices/motion001`

**Headers:**
```
Fiware-Service: {{fiware_service}}
Fiware-ServicePath: {{fiware_servicepath}}
```

**Expected Response (200):**
```json
{
  "device_id": "motion001",
  "entity_name": "urn:ngsi-ld:Motion:001",
  "entity_type": "Motion",
  "apikey": "4jggokgpepnvsb2uv4s40d59ov",
  "protocol": "PDI-IoTA-UltraLight",
  "transport": "HTTP",
  "attributes": [ ... ]
}
```

---

### Test 44: Update Device
**PUT** `{{gateway_url}}/iot/devices/motion001`

**Headers:**
```
Fiware-Service: {{fiware_service}}
Fiware-ServicePath: {{fiware_servicepath}}
Content-Type: application/json
```

**Body:**
```json
{
  "entity_name": "urn:ngsi-ld:Motion:001-Updated"
}
```

**Expected Response (204):**
Empty body with status 204 No Content

---

### Test 45: Delete Device
**DELETE** `{{gateway_url}}/iot/devices/motion001`

**Headers:**
```
Fiware-Service: {{fiware_service}}
Fiware-ServicePath: {{fiware_servicepath}}
```

**Expected Response (204):**
Empty body with status 204 No Content

---

## Complete Postman Collection JSON

```json
{
  "info": {
    "name": "SSIO Gateway - Complete Test Suite",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    {
      "key": "gateway_url",
      "value": "http://localhost:3000"
    },
    {
      "key": "fiware_service",
      "value": "openiot"
    },
    {
      "key": "fiware_servicepath",
      "value": "/"
    }
  ],
  "item": [
    {
      "name": "1. Authentication",
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
            "url": "{{gateway_url}}/auth/login"
          }
        },
        {
          "name": "2. Get Current User",
          "request": {
            "method": "GET",
            "header": [{"key": "Authorization", "value": "Bearer {{jwt_token}}"}],
            "url": "{{gateway_url}}/auth/me"
          }
        },
        {
          "name": "3. Logout",
          "request": {
            "method": "POST",
            "header": [{"key": "Authorization", "value": "Bearer {{jwt_token}}"}],
            "url": "{{gateway_url}}/auth/logout"
          }
        }
      ]
    },
    {
      "name": "2. Users Management",
      "item": [
        {
          "name": "4. List All Users",
          "request": {
            "method": "GET",
            "header": [{"key": "Authorization", "value": "Bearer {{jwt_token}}"}],
            "url": "{{gateway_url}}/users"
          }
        },
        {
          "name": "5. Create User",
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": ["pm.environment.set(\"created_user_id\", pm.response.json().user.id);"],
                "type": "text/javascript"
              }
            }
          ],
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
            "url": "{{gateway_url}}/users"
          }
        },
        {
          "name": "6. Get User by ID",
          "request": {
            "method": "GET",
            "header": [{"key": "Authorization", "value": "Bearer {{jwt_token}}"}],
            "url": "{{gateway_url}}/users/{{created_user_id}}"
          }
        },
        {
          "name": "7. Update User",
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
            "url": "{{gateway_url}}/users/{{created_user_id}}"
          }
        },
        {
          "name": "8. Get User Roles",
          "request": {
            "method": "GET",
            "header": [{"key": "Authorization", "value": "Bearer {{jwt_token}}"}],
            "url": "{{gateway_url}}/users/{{created_user_id}}/roles"
          }
        },
        {
          "name": "9. Assign Role to User",
          "request": {
            "method": "POST",
            "header": [
              {"key": "Authorization", "value": "Bearer {{jwt_token}}"},
              {"key": "Content-Type", "value": "application/json"}
            ],
            "body": {
              "mode": "raw",
              "raw": "{\"roleId\":\"provider\"}"
            },
            "url": "{{gateway_url}}/users/{{created_user_id}}/roles"
          }
        },
        {
          "name": "10. Remove Role from User",
          "request": {
            "method": "DELETE",
            "header": [{"key": "Authorization", "value": "Bearer {{jwt_token}}"}],
            "url": "{{gateway_url}}/users/{{created_user_id}}/roles/provider"
          }
        },
        {
          "name": "11. Delete User",
          "request": {
            "method": "DELETE",
            "header": [{"key": "Authorization", "value": "Bearer {{jwt_token}}"}],
            "url": "{{gateway_url}}/users/{{created_user_id}}"
          }
        }
      ]
    },
    {
      "name": "3. Roles Management",
      "item": [
        {
          "name": "12. List All Roles",
          "request": {
            "method": "GET",
            "header": [{"key": "Authorization", "value": "Bearer {{jwt_token}}"}],
            "url": "{{gateway_url}}/roles"
          }
        },
        {
          "name": "13. Create Role",
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": ["pm.environment.set(\"created_role_id\", pm.response.json().role.id);"],
                "type": "text/javascript"
              }
            }
          ],
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
            "url": "{{gateway_url}}/roles"
          }
        },
        {
          "name": "14. Get Role by ID",
          "request": {
            "method": "GET",
            "header": [{"key": "Authorization", "value": "Bearer {{jwt_token}}"}],
            "url": "{{gateway_url}}/roles/{{created_role_id}}"
          }
        },
        {
          "name": "15. Update Role",
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
            "url": "{{gateway_url}}/roles/{{created_role_id}}"
          }
        },
        {
          "name": "16. Get Role Permissions",
          "request": {
            "method": "GET",
            "header": [{"key": "Authorization", "value": "Bearer {{jwt_token}}"}],
            "url": "{{gateway_url}}/roles/{{created_role_id}}/permissions"
          }
        },
        {
          "name": "17. Assign Permission to Role",
          "request": {
            "method": "POST",
            "header": [
              {"key": "Authorization", "value": "Bearer {{jwt_token}}"},
              {"key": "Content-Type", "value": "application/json"}
            ],
            "body": {
              "mode": "raw",
              "raw": "{\"permissionId\":\"permission-uuid\"}"
            },
            "url": "{{gateway_url}}/roles/{{created_role_id}}/permissions"
          }
        },
        {
          "name": "18. Remove Permission from Role",
          "request": {
            "method": "DELETE",
            "header": [{"key": "Authorization", "value": "Bearer {{jwt_token}}"}],
            "url": "{{gateway_url}}/roles/{{created_role_id}}/permissions/permission-uuid"
          }
        },
        {
          "name": "19. Delete Role",
          "request": {
            "method": "DELETE",
            "header": [{"key": "Authorization", "value": "Bearer {{jwt_token}}"}],
            "url": "{{gateway_url}}/roles/{{created_role_id}}"
          }
        }
      ]
    },
    {
      "name": "4. Permissions Management",
      "item": [
        {
          "name": "20. List All Permissions",
          "request": {
            "method": "GET",
            "header": [{"key": "Authorization", "value": "Bearer {{jwt_token}}"}],
            "url": "{{gateway_url}}/permissions"
          }
        },
        {
          "name": "21. Create Permission",
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": ["pm.environment.set(\"created_permission_id\", pm.response.json().permission.id);"],
                "type": "text/javascript"
              }
            }
          ],
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
            "url": "{{gateway_url}}/permissions"
          }
        },
        {
          "name": "22. Get Permission by ID",
          "request": {
            "method": "GET",
            "header": [{"key": "Authorization", "value": "Bearer {{jwt_token}}"}],
            "url": "{{gateway_url}}/permissions/{{created_permission_id}}"
          }
        },
        {
          "name": "23. Update Permission",
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
            "url": "{{gateway_url}}/permissions/{{created_permission_id}}"
          }
        },
        {
          "name": "24. Delete Permission",
          "request": {
            "method": "DELETE",
            "header": [{"key": "Authorization", "value": "Bearer {{jwt_token}}"}],
            "url": "{{gateway_url}}/permissions/{{created_permission_id}}"
          }
        }
      ]
    },
    {
      "name": "5. Orion Context Broker",
      "item": [
        {
          "name": "25. Get All Entities",
          "request": {
            "method": "GET",
            "header": [{"key": "Authorization", "value": "Bearer {{jwt_token}}"}],
            "url": "{{gateway_url}}/orion/entities"
          }
        },
        {
          "name": "26. Create Entity",
          "request": {
            "method": "POST",
            "header": [
              {"key": "Authorization", "value": "Bearer {{jwt_token}}"},
              {"key": "Content-Type", "value": "application/json"}
            ],
            "body": {
              "mode": "raw",
              "raw": "{\"id\":\"urn:ngsi-ld:Store:001\",\"type\":\"Store\",\"name\":{\"type\":\"Text\",\"value\":\"Test Store\"},\"location\":{\"type\":\"geo:json\",\"value\":{\"type\":\"Point\",\"coordinates\":[13.3986,52.5547]}}}"
            },
            "url": "{{gateway_url}}/orion/entities"
          }
        },
        {
          "name": "27. Get Entity by ID",
          "request": {
            "method": "GET",
            "header": [{"key": "Authorization", "value": "Bearer {{jwt_token}}"}],
            "url": "{{gateway_url}}/orion/entities/urn:ngsi-ld:Store:001"
          }
        },
        {
          "name": "28. Update Entity Attributes (PATCH)",
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
            "url": "{{gateway_url}}/orion/entities/urn:ngsi-ld:Store:001/attrs"
          }
        },
        {
          "name": "29. Replace Entity Attributes (PUT)",
          "request": {
            "method": "PUT",
            "header": [
              {"key": "Authorization", "value": "Bearer {{jwt_token}}"},
              {"key": "Content-Type", "value": "application/json"}
            ],
            "body": {
              "mode": "raw",
              "raw": "{\"name\":{\"type\":\"Text\",\"value\":\"Replaced Name\"}}"
            },
            "url": "{{gateway_url}}/orion/entities/urn:ngsi-ld:Store:001/attrs"
          }
        },
        {
          "name": "30. Get Entity Types",
          "request": {
            "method": "GET",
            "header": [{"key": "Authorization", "value": "Bearer {{jwt_token}}"}],
            "url": "{{gateway_url}}/orion/types"
          }
        },
        {
          "name": "31. Batch Update",
          "request": {
            "method": "POST",
            "header": [
              {"key": "Authorization", "value": "Bearer {{jwt_token}}"},
              {"key": "Content-Type", "value": "application/json"}
            ],
            "body": {
              "mode": "raw",
              "raw": "{\"actionType\":\"append\",\"entities\":[{\"id\":\"urn:ngsi-ld:Store:002\",\"type\":\"Store\",\"name\":{\"type\":\"Text\",\"value\":\"Second Store\"}}]}"
            },
            "url": "{{gateway_url}}/orion/op/update"
          }
        },
        {
          "name": "32. List Subscriptions",
          "request": {
            "method": "GET",
            "header": [{"key": "Authorization", "value": "Bearer {{jwt_token}}"}],
            "url": "{{gateway_url}}/orion/subscriptions"
          }
        },
        {
          "name": "33. Create Subscription",
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": ["pm.environment.set(\"subscription_id\", pm.response.headers.get(\"Location\").split(\"/\").pop());"],
                "type": "text/javascript"
              }
            }
          ],
          "request": {
            "method": "POST",
            "header": [
              {"key": "Authorization", "value": "Bearer {{jwt_token}}"},
              {"key": "Content-Type", "value": "application/json"}
            ],
            "body": {
              "mode": "raw",
              "raw": "{\"description\":\"Store subscription\",\"subject\":{\"entities\":[{\"idPattern\":\".*\",\"type\":\"Store\"}],\"condition\":{\"attrs\":[\"name\"]}},\"notification\":{\"http\":{\"url\":\"http://localhost:3000/notify\"},\"attrs\":[\"name\"]}}"
            },
            "url": "{{gateway_url}}/orion/subscriptions"
          }
        },
        {
          "name": "34. Get Subscription by ID",
          "request": {
            "method": "GET",
            "header": [{"key": "Authorization", "value": "Bearer {{jwt_token}}"}],
            "url": "{{gateway_url}}/orion/subscriptions/{{subscription_id}}"
          }
        },
        {
          "name": "35. Update Subscription",
          "request": {
            "method": "PATCH",
            "header": [
              {"key": "Authorization", "value": "Bearer {{jwt_token}}"},
              {"key": "Content-Type", "value": "application/json"}
            ],
            "body": {
              "mode": "raw",
              "raw": "{\"status\":\"inactive\"}"
            },
            "url": "{{gateway_url}}/orion/subscriptions/{{subscription_id}}"
          }
        },
        {
          "name": "36. Delete Subscription",
          "request": {
            "method": "DELETE",
            "header": [{"key": "Authorization", "value": "Bearer {{jwt_token}}"}],
            "url": "{{gateway_url}}/orion/subscriptions/{{subscription_id}}"
          }
        },
        {
          "name": "37. Delete Entity",
          "request": {
            "method": "DELETE",
            "header": [{"key": "Authorization", "value": "Bearer {{jwt_token}}"}],
            "url": "{{gateway_url}}/orion/entities/urn:ngsi-ld:Store:001"
          }
        }
      ]
    },
    {
      "name": "6. IoT Agent - Service Groups",
      "item": [
        {
          "name": "38. Create Service Group",
          "request": {
            "method": "POST",
            "header": [
              {"key": "Fiware-Service", "value": "{{fiware_service}}"},
              {"key": "Fiware-ServicePath", "value": "{{fiware_servicepath}}"},
              {"key": "Content-Type", "value": "application/json"}
            ],
            "body": {
              "mode": "raw",
              "raw": "{\"services\":[{\"apikey\":\"4jggokgpepnvsb2uv4s40d59ov\",\"entity_type\":\"Thing\",\"resource\":\"/iot/d\",\"attributes\":[{\"object_id\":\"t\",\"name\":\"temperature\",\"type\":\"Number\"}]}]}"
            },
            "url": "{{gateway_url}}/iot/groups"
          }
        },
        {
          "name": "39. List Service Groups",
          "request": {
            "method": "GET",
            "header": [
              {"key": "Fiware-Service", "value": "{{fiware_service}}"},
              {"key": "Fiware-ServicePath", "value": "{{fiware_servicepath}}"}
            ],
            "url": "{{gateway_url}}/iot/groups"
          }
        },
        {
          "name": "40. Delete Service Group",
          "request": {
            "method": "DELETE",
            "header": [
              {"key": "Fiware-Service", "value": "{{fiware_service}}"},
              {"key": "Fiware-ServicePath", "value": "{{fiware_servicepath}}"}
            ],
            "url": "{{gateway_url}}/iot/groups?resource=/iot/d&apikey=4jggokgpepnvsb2uv4s40d59ov"
          }
        }
      ]
    },
    {
      "name": "7. IoT Agent - Devices",
      "item": [
        {
          "name": "41. Create Device",
          "request": {
            "method": "POST",
            "header": [
              {"key": "Fiware-Service", "value": "{{fiware_service}}"},
              {"key": "Fiware-ServicePath", "value": "{{fiware_servicepath}}"},
              {"key": "Content-Type", "value": "application/json"}
            ],
            "body": {
              "mode": "raw",
              "raw": "{\"devices\":[{\"device_id\":\"motion001\",\"entity_name\":\"urn:ngsi-ld:Motion:001\",\"entity_type\":\"Motion\",\"apikey\":\"4jggokgpepnvsb2uv4s40d59ov\",\"protocol\":\"PDI-IoTA-UltraLight\",\"transport\":\"HTTP\",\"attributes\":[{\"object_id\":\"c\",\"name\":\"count\",\"type\":\"Integer\"}]}]}"
            },
            "url": "{{gateway_url}}/iot/devices"
          }
        },
        {
          "name": "42. List All Devices",
          "request": {
            "method": "GET",
            "header": [
              {"key": "Fiware-Service", "value": "{{fiware_service}}"},
              {"key": "Fiware-ServicePath", "value": "{{fiware_servicepath}}"}
            ],
            "url": "{{gateway_url}}/iot/devices"
          }
        },
        {
          "name": "43. Get Device by ID",
          "request": {
            "method": "GET",
            "header": [
              {"key": "Fiware-Service", "value": "{{fiware_service}}"},
              {"key": "Fiware-ServicePath", "value": "{{fiware_servicepath}}"}
            ],
            "url": "{{gateway_url}}/iot/devices/motion001"
          }
        },
        {
          "name": "44. Update Device",
          "request": {
            "method": "PUT",
            "header": [
              {"key": "Fiware-Service", "value": "{{fiware_service}}"},
              {"key": "Fiware-ServicePath", "value": "{{fiware_servicepath}}"},
              {"key": "Content-Type", "value": "application/json"}
            ],
            "body": {
              "mode": "raw",
              "raw": "{\"entity_name\":\"urn:ngsi-ld:Motion:001-Updated\"}"
            },
            "url": "{{gateway_url}}/iot/devices/motion001"
          }
        },
        {
          "name": "45. Delete Device",
          "request": {
            "method": "DELETE",
            "header": [
              {"key": "Fiware-Service", "value": "{{fiware_service}}"},
              {"key": "Fiware-ServicePath", "value": "{{fiware_servicepath}}"}
            ],
            "url": "{{gateway_url}}/iot/devices/motion001"
          }
        }
      ]
    }
  ]
}
```

---

## Testing Flow Recommendations

### 1. Basic Flow (Quick Test)
1. Login (Test 1)
2. Get Current User (Test 2)
3. List Entities (Test 25)
4. Logout (Test 3)

### 2. User Management Flow
1. Login (Test 1)
2. Create User (Test 5)
3. Assign Role to User (Test 9)
4. Get User Roles (Test 8)
5. Delete User (Test 11)

### 3. Orion Flow
1. Login (Test 1)
2. Create Entity (Test 26)
3. Get Entity by ID (Test 27)
4. Update Entity (Test 28)
5. Delete Entity (Test 37)

### 4. IoT Agent Flow
1. Create Service Group (Test 38)
2. Create Device (Test 41)
3. List Devices (Test 42)
4. Delete Device (Test 45)
5. Delete Service Group (Test 40)

---

## Summary

**Total Tests:** 45

- **Authentication:** 3 tests
- **Users Management:** 8 tests
- **Roles Management:** 8 tests
- **Permissions Management:** 5 tests
- **Orion Context Broker:** 13 tests
- **IoT Service Groups:** 3 tests
- **IoT Devices:** 5 tests

**Authentication Required:**
- All Auth, Users, Roles, Permissions, Orion endpoints use JWT

**No Authentication:**
- IoT Agent endpoints use Fiware-Service/ServicePath headers only
