# Security Patch File: SECURITY_FIXES.md

## Documenting Security Vulnerabilities

This document outlines 8 critical and high-priority security vulnerabilities found in `family_tree_fixed4.html`. Each section contains a description of the vulnerability, affected code locations, and step-by-step fixes to mitigate the risks.

### 1. Offline Mode Privilege Escalation
**Vulnerability Description:** In offline mode, users can perform actions that should only be accessible in online mode due to lack of proper checks.
#### Affected Code Location:
```javascript
// Affected code example
if (isOffline) {
    // Allowing actions that should depend on online status
}
```
#### Fix:
```javascript
// Fixed code example
if (isOffline) {
    throw new Error('Offline mode does not permit this action.');
}
```

### 2. Client-Side Role Spoofing
**Vulnerability Description:** Users can manipulate their roles using client-side scripts, affecting access control.
#### Affected Code Location:
```javascript
// Affected code example
let userRole = localStorage.getItem('userRole');
```
#### Fix:
```javascript
// Fixed code example
let userRole = fetchUserRoleFromServer(); // Validate role server-side
```

### 3. Config Exposure in localStorage
**Vulnerability Description:** Sensitive configurations are stored in localStorage, exposing them to XSS vulnerabilities.
#### Affected Code Location:
```javascript
// Affected code
localStorage.setItem('config', JSON.stringify(config));
```
#### Fix:
```javascript
// Fixed code
sessionStorage.setItem('config', JSON.stringify(config)); // Use sessionStorage or secure backend API
```

### 4. Missing Rate Limiting on Auth
**Vulnerability Description:** Lack of rate limiting allows attackers to brute-force login attempts.
#### Affected Code Location:
```javascript
// Affected code
app.post('/login', (req, res) => { /* authentication logic */ });
```
#### Fix:
```javascript
// Fixed code
const rateLimit = require('express-rate-limit');
const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.post('/login', loginLimiter, (req, res) => { /* authentication logic */ });
```

### 5. Insufficient JWT Validation
**Vulnerability Description:** JWT tokens are not properly validated, leading to potential forgery.
#### Affected Code Location:
```javascript
// Affected code
jwt.verify(token, secretKey, (err, decoded) => { /* logic */ });
```
#### Fix:
```javascript
// Fixed code
const options = { algorithms: ['HS256'], expiresIn: '1h' };
jwt.verify(token, secretKey, options, (err, decoded) => { /* logic */ });
```

### 6. Path Traversal in Photo Upload
**Vulnerability Description:** Users can upload files outside the intended directories.
#### Affected Code Location:
```javascript
// Affected code
fs.writeFile(`uploads/${filename}`, fileData, (err) => { /* logic */ });
```
#### Fix:
```javascript
// Fixed code
if (!filename.startsWith('uploads/')) throw new Error('Invalid file path.');
fs.writeFile(`uploads/${filename}`, fileData, (err) => { /* logic */ });
```

### 7. Missing CSP Headers
**Vulnerability Description:** Lack of Content Security Policy (CSP) headers increases the risk of XSS attacks.
#### Affected Code Location:
```javascript
// Affected code
// No CSP headers set
```
#### Fix:
```javascript
// Fixed code
app.use((req, res, next) => {
    res.setHeader('Content-Security-Policy', "default-src 'self';");
    next();
});
```

### 8. XSS via User Input Sanitization
**Vulnerability Description:** User inputs are not properly sanitized, allowing for XSS attacks.
#### Affected Code Location:
```html
<!-- Affected code -->
<div id="output">{{ userInput }}</div>
```
#### Fix:
```html
<!-- Fixed code -->
<div id="output">{{ sanitized(userInput) }}</div>
```

## Conclusion
By addressing these vulnerabilities, we enhance the security posture of our application and safeguard user data. Each fix should be thoroughly tested to ensure functionality is maintained without introducing new risks.
