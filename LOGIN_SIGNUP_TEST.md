# 🔐 Login & Signup Test Guide

**Status:** ✅ SERVERS RUNNING - READY TO TEST

---

## 🚀 Current Status:

- ✅ **Backend:** Running on http://localhost:5000
- ✅ **Frontend:** Running on http://localhost:3000 
- ✅ **Database:** Connected to MongoDB
- ✅ **Browser Preview:** Available

---

## 🧪 Test Login & Signup:

### 1. **Test Customer Signup:**

**URL:** http://localhost:3000/signup

**Test Data:**
```
First Name: Test
Last Name: Customer
Email: testcustomer@test.com
Phone: +91 9876543210
Password: Test123!
Confirm Password: Test123!
User Type: Customer
```

**Expected:**
- ✅ Form validation works
- ✅ Creates account successfully
- ✅ Redirects to verification or dashboard

### 2. **Test Customer Login:**

**URL:** http://localhost:3000/login

**Existing Accounts:**
```
Email: john.smith@example.com
Password: Customer123!
```

**Expected:**
- ✅ Login successful
- ✅ Redirects to customer dashboard
- ✅ Token stored in localStorage

### 3. **Test Technician Login:**

**URL:** http://localhost:3000/login

**Test Accounts:**
```
1. Email: tech@test.com
   Password: tech123

2. Email: electrician@test.com
   Password: electrician123

3. Email: plumber@test.com
   Password: plumber123
```

**Expected:**
- ✅ Login successful
- ✅ Redirects to technician dashboard
- ✅ Shows technician features

### 4. **Test Admin Login:**

**URL:** http://localhost:3000/admin/login

**Admin Account:**
```
Email: admin@fixitnow.com
Password: Admin123!
```

**Expected:**
- ✅ Login successful
- ✅ Redirects to admin dashboard
- ✅ Shows admin panel

---

## 🔍 Common Issues & Solutions:

### Issue 1: "Invalid Credentials"
**Cause:** Wrong email/password or account doesn't exist
**Solution:** 
- Check email spelling
- Try test accounts listed above
- Check if account needs verification

### Issue 2: "Network Error"
**Cause:** Backend not running or wrong API URL
**Solution:**
- Verify backend running on port 5000
- Check frontend .env file has correct API_URL
- Check browser console for errors

### Issue 3: "Page Not Found"
**Cause:** Frontend routing issues
**Solution:**
- Clear browser cache
- Hard refresh (Ctrl+Shift+R)
- Check if frontend is running

### Issue 4: "Verification Required"
**Cause:** Account needs email verification
**Solution:**
- Check if `isVerified: true` in database
- Use pre-verified test accounts

---

## 🛠️ Debug Steps:

### 1. Check Browser Console:
- Open DevTools (F12)
- Go to Console tab
- Look for red errors during login/signup

### 2. Check Network Tab:
- Open DevTools → Network
- Try login/signup
- Check if API calls return 200/201 status
- Look for 400/401/500 errors

### 3. Check localStorage:
- After successful login, check:
  - `token` should be present
  - `user` should have user data

### 4. Test API Directly:
```bash
# Test login endpoint
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"tech@test.com","password":"tech123"}'
```

---

## 📋 Quick Test Checklist:

### Customer Flow:
- [ ] Go to /signup
- [ ] Fill form with test data
- [ ] Submit form
- [ ] Check for success message
- [ ] Try login with new account
- [ ] Should reach customer dashboard

### Existing Account Login:
- [ ] Go to /login
- [ ] Use: john.smith@example.com / Customer123!
- [ ] Should redirect to dashboard
- [ ] Check localStorage has token

### Technician Login:
- [ ] Go to /login
- [ ] Use: tech@test.com / tech123
- [ ] Should redirect to technician dashboard
- [ ] Check sidebar navigation works

### Admin Login:
- [ ] Go to /admin/login
- [ ] Use: admin@fixitnow.com / Admin123!
- [ ] Should redirect to admin dashboard
- [ ] Check admin features work

---

## 🎯 URLs to Test:

1. **Home:** http://localhost:3000
2. **Signup:** http://localhost:3000/signup
3. **Login:** http://localhost:3000/login
4. **Admin Login:** http://localhost:3000/admin/login
5. **Customer Dashboard:** http://localhost:3000/dashboard
6. **Technician Dashboard:** http://localhost:3000/technician/dashboard
7. **Admin Dashboard:** http://localhost:3000/admin/dashboard

---

## 🔧 If Still Not Working:

### Reset Everything:
```bash
# Kill all processes
taskkill /F /IM node.exe

# Restart backend
cd backend
npm start

# Restart frontend (new terminal)
cd frontend  
npm start
```

### Check Environment:
```bash
# Backend should have:
# - MongoDB connection
# - Port 5000 available
# - JWT_SECRET set

# Frontend should have:
# - REACT_APP_API_URL=http://localhost:5000/api
```

---

**Test all the scenarios above and let me know which specific part is failing!** 🚀
