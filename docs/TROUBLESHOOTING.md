# 🐛 TROUBLESHOOTING GUIDE

## Error: Cannot find module 'firebase-admin'

### Solution 1: Install the package
npm install firebase-admin

text

### Solution 2: Skip for now (Using mock)
The notifications.routes.js is already created as a mock.
Firebase-admin can be added later when you configure Firebase.

### Solution 3: Comment out in server.js
If you don't need notifications yet:
// Temporarily comment out:
// app.use('/api/notifications', require('./routes/notifications.routes'));

text

---

## Error: Cannot find module 'express'

### Solution:
npm install

text

This installs ALL dependencies from package.json

---

## Error: MongoDB Connection Error

### Solution:
1. Check .env file exists
2. Verify MONGO_URI is correct
3. Check MongoDB Atlas IP whitelist
4. Test connection string manually

---

## Error: Port already in use

### Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F

text

### Mac/Linux:
lsof -i :5000
kill -9 <PID>

text

Or change port in .env:
PORT=5001

text

---

## Error: CORS error from frontend

### Solution:
1. Check FRONTEND_URL in .env
2. Verify corsOptions in server.js
3. Make sure frontend URL matches exactly

---

## Server starts but doesn't respond

### Check:
1. Is MongoDB connected? (Should see ✅ message)
2. Is server listening? (Should see 🚀 message)
3. Test with: curl http://localhost:5000/health

### If not responding:
1. Check firewall
2. Restart server
3. Check for errors in console

---

## Nodemon not reloading

### Solution:
Restart nodemon manually:
- Type: rs
- Press: Enter

Or reinstall nodemon:
npm install --save-dev nodemon

text

---

## Package.json missing

### Solution:
Copy package.json.example:
cp package.json.example package.json
npm install

text

---

## All else fails

### Nuclear Option:
Delete node_modules and lock file
rm -r node_modules package-lock.json

Clean npm cache
npm cache clean --force

Reinstall everything
npm install

Try again
npm run dev

text

---

## Still having issues?

1. Check Node version: `node -v` (Should be v14+)
2. Check npm version: `npm -v` (Should be v6+)
3. Check internet connection
4. Try with different terminal/PowerShell
5. Restart computer
