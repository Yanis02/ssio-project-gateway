# Dual-Token OAuth2 Authentication Flow

## Overview

This NestJS application implements a dual-token authentication system with FIWARE Keyrock:
- **Management Token**: For Keyrock admin operations (user/role/permission management)
- **OAuth2 Token**: For accessing PEP Proxy protected resources
- **Single JWT**: Returned to frontend containing both tokens and user information

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐     ┌─────────────┐
│  Frontend   │────▶│ AuthController│────▶│  AuthService    │────▶│  Keyrock    │
└─────────────┘     └──────────────┘     │  (Business)     │     │   IDM       │
                                          └─────────────────┘     └─────────────┘
                                                   │
                                                   ▼
                                          ┌─────────────────┐
                                          │ SessionService  │
                                          │ (In-Memory)     │
                                          └─────────────────┘
                                                   │
                                                   ▼
                                          ┌─────────────────┐
                                          │KeyrockAuthService│
                                          │ (Infrastructure)│
                                          └─────────────────┘
```

## Authentication Flow

### Step 1: Initial Login
**Endpoint:** `POST /auth/login`

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "authorizationUrl": "http://keyrock:3000/oauth2/authorize?response_type=code&client_id=xxx&redirect_uri=xxx&state=xxx",
  "message": "Please authorize the application by visiting the provided URL",
  "managementToken": "xxx-management-token-xxx"
}
```

**Process:**
1. Frontend sends email/password to backend
2. Backend authenticates with Keyrock management API → gets management token
3. Backend generates OAuth2 authorization URL with state (management token)
4. Frontend redirects user to authorization URL

### Step 2: User Authorization
**External Flow (Keyrock UI):**
1. User logs in to Keyrock (if not already logged in)
2. User authorizes the application
3. Keyrock redirects to callback URL with authorization code

### Step 3: OAuth2 Callback
**Endpoint:** `GET /auth/callback?code=xxx&state=xxx`

**Query Parameters:**
- `code`: Authorization code from Keyrock
- `state`: Management token (passed back from Step 1)

**Response:**
```json
{
  "accessToken": "jwt-token-for-frontend",
  "expiresIn": 3600,
  "user": {
    "id": "user-id",
    "username": "john_doe",
    "email": "user@example.com",
    "roles": ["role1", "role2"]
  }
}
```

**Process:**
1. Backend receives authorization code and management token
2. Backend exchanges code for OAuth2 access token (and optional refresh token)
3. Backend fetches user information using OAuth2 token
4. Backend retrieves user roles using management token
5. Backend creates session storing both tokens
6. Backend generates single JWT containing user info and session reference
7. Frontend receives JWT and stores it

## Protected Endpoints

### Get Current User
**Endpoint:** `GET /auth/me` (Protected by JWT)

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "user": {
    "id": "user-id",
    "username": "john_doe",
    "email": "user@example.com",
    "roles": ["role1", "role2"]
  }
}
```

### Get Session Tokens
**Endpoint:** `GET /auth/tokens` (Protected by JWT)

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "keyrockToken": "management-token-xxx",
  "oauth2Token": "oauth2-token-xxx"
}
```

**Use Case:** When frontend needs to make direct requests to PEP Proxy or Keyrock

### Logout
**Endpoint:** `POST /auth/logout` (Protected by JWT)

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "message": "Logged out successfully"
}
```

**Process:**
1. Backend destroys session
2. Frontend should discard JWT

## Session Management

### Session Data Structure
```typescript
{
  userId: string;
  username: string;
  email: string;
  roles: string[];
  keyrockManagementToken: string;
  oauth2AccessToken: string;
  oauth2RefreshToken?: string;
  keyrockTokenExpiry: Date;
  oauth2TokenExpiry: Date;
}
```

### Token Refresh
- Sessions automatically refresh expired OAuth2 tokens using refresh token
- Management tokens must be manually refreshed by re-authenticating
- JWT validation checks session validity and triggers token refresh if needed

## JWT Structure

**Payload:**
```typescript
{
  userId: string;
  username: string;
  email: string;
  roles: string[];
  keyrockToken: string;      // Management token
  oauth2Token: string;        // OAuth2 access token
  iat: number;               // Issued at
  exp: number;               // Expiration
}
```

## Environment Variables

Required configuration in `.env`:

```env
# Keyrock Configuration
KEYROCK_URL=http://localhost:3005
KEYROCK_CLIENT_ID=your-client-id
KEYROCK_CLIENT_SECRET=your-client-secret
KEYROCK_CALLBACK_URL=http://localhost:3000/auth/callback
KEYROCK_APP_ID=your-app-id

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=1h
```

## Security Considerations

1. **JWT Secret**: Must be strong and kept secret
2. **Session Storage**: Currently in-memory (will be lost on restart)
   - For production, consider Redis or database-backed sessions
3. **Token Expiry**: JWT expiry should match or be shorter than OAuth2 token expiry
4. **HTTPS**: Always use HTTPS in production
5. **CORS**: Configure CORS properly for your frontend domain

## Testing the Flow

### 1. Start Keyrock and Application
```bash
# Start Docker services
docker-compose up -d

# Start NestJS application
npm run start:dev
```

### 2. Test Login (Step 1: Get Authorization URL)
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"1234"}'

# Response:
{
  "authorizationUrl": "http://keyrock:3000/oauth2/authorize?response_type=code&client_id=xxx&redirect_uri=xxx&state=management-token",
  "message": "Please authorize the application by visiting the provided URL",
  "managementToken": "management-token-xxx"
}
```

### 3. Authorize in Browser
- Open the `authorizationUrl` in browser
- Log in to Keyrock if needed
- Click "Authorize"
- Browser will redirect to callback URL: `http://localhost:3000/auth/callback?code=xxx&state=management-token`

### 4. Complete Login (Automatically handled by backend)
The callback endpoint exchanges the authorization code for OAuth2 tokens:

**OAuth2 Token Request (internal):**
```bash
POST http://keyrock:3000/oauth2/token
Authorization: Basic base64(client_id:client_secret)
Content-Type: application/x-www-form-urlencoded

grant_type=authorization_code&code=xxx&redirect_uri=http://localhost:3000/auth/callback
```

**OAuth2 Token Response:**
```json
{
  "access_token": "oauth2-access-token",
  "token_type": "Bearer",
  "expires_in": 3600,
  "refresh_token": "oauth2-refresh-token"
}
```

### 5. Test Protected Endpoints
```bash
# Get current user
curl -X GET http://localhost:3000/auth/me \
  -H "Authorization: Bearer <jwt-token>"

# Get tokens (for direct PEP Proxy access)
curl -X GET http://localhost:3000/auth/tokens \
  -H "Authorization: Bearer <jwt-token>"

# Response:
{
  "keyrockToken": "management-token-xxx",
  "oauth2Token": "oauth2-access-token-xxx"
}

# Logout
curl -X POST http://localhost:3000/auth/logout \
  -H "Authorization: Bearer <jwt-token>"
```

### 6. Using OAuth2 Token with PEP Proxy
Once you have the OAuth2 token, you can access PEP Proxy protected resources:

```bash
# Access Orion through PEP Proxy
curl -X GET http://localhost:1027/v2/entities \
  -H "X-Auth-Token: <oauth2-token>"

# Or using Bearer token
curl -X GET http://localhost:1027/v2/entities \
  -H "Authorization: Bearer <oauth2-token>"
```

## Frontend Integration Example

```typescript
// Login flow
async function login(email: string, password: string) {
  // Step 1: Get authorization URL
  const response = await fetch('http://localhost:3000/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  
  const data = await response.json();
  
  // Step 2: Redirect to Keyrock authorization page
  window.location.href = data.authorizationUrl;
}

// In your callback route handler (e.g., /auth/callback)
async function handleCallback() {
  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');
  const state = params.get('state');
  
  // Step 3: Exchange code for JWT
  const response = await fetch(
    `http://localhost:3000/auth/callback?code=${code}&state=${state}`
  );
  
  const data = await response.json();
  
  // Step 4: Store JWT
  localStorage.setItem('jwt', data.accessToken);
  
  // Redirect to dashboard or home
  window.location.href = '/dashboard';
}

// Making authenticated requests
async function fetchProtectedResource() {
  const jwt = localStorage.getItem('jwt');
  
  const response = await fetch('http://localhost:3000/auth/me', {
    headers: {
      'Authorization': `Bearer ${jwt}`
    }
  });
  
  return response.json();
}

// Logout
async function logout() {
  const jwt = localStorage.getItem('jwt');
  
  await fetch('http://localhost:3000/auth/logout', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${jwt}`
    }
  });
  
  localStorage.removeItem('jwt');
  window.location.href = '/login';
}
```

## Next Steps

1. **Implement Session Persistence**: Use Redis or database for production
2. **Add Token Refresh Endpoint**: Allow frontend to refresh JWT before expiry
3. **Add Remember Me**: Optional long-lived sessions
4. **Rate Limiting**: Add rate limiting to prevent brute force attacks
5. **Audit Logging**: Log authentication events
6. **Multi-factor Authentication**: Add MFA support
7. **Social Login**: Add OAuth providers (Google, GitHub, etc.)

## Troubleshooting

### Common Issues

**Issue**: "Missing access token in Keyrock response"
- **Solution**: Check Keyrock credentials and URL

**Issue**: "OAuth2 authorization failed"
- **Solution**: Verify client ID, client secret, and callback URL in Keyrock application settings

**Issue**: "Session not found"
- **Solution**: Session expired or was cleared. User needs to login again

**Issue**: "JWT expired"
- **Solution**: Frontend should handle token expiry and redirect to login or implement refresh token flow
