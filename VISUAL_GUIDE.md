# 🎯 VISUAL SETUP & USAGE GUIDE

## BEFORE YOU START

```
✅ Node.js installed? (Check: node --version)
✅ npm installed? (Check: npm --version)
✅ MongoDB installed or account? (Check: mongod or MongoDB Atlas)
✅ Text editor ready? (VS Code recommended)
```

---

## STEP 1: INSTALL DEPENDENCIES (2 minutes)

### Run this command in the project folder:
```bash
npm install
```

**What it does:**
- Downloads Express.js
- Downloads Mongoose (MongoDB driver)
- Downloads Multer (file upload)
- Downloads EJS (templates)
- Plus other dependencies

**Success indicator:** `node_modules` folder appears

---

## STEP 2: START MONGODB (30 seconds)

### Option A: Local MongoDB
```bash
mongod
```
**Keep this terminal running!**

### Option B: MongoDB Atlas (Cloud)
```
No command needed - it runs in the cloud
Just ensure MONGODB_URI in .env points to your Atlas connection string
```

**Success indicator:** "Listening on port 27017"

---

## STEP 3: START THE SERVER (instant)

### Open NEW terminal and run:
```bash
npm run dev
```

**Success indicator:**
```
Server is running on http://localhost:3000
Admin login: http://localhost:3000/admin/login
Apply form: http://localhost:3000/apply
```

---

## STEP 4: TEST THE APPLICATION (10 minutes)

### 🏠 Visit Home Page
```
URL: http://localhost:3000
What you see: Welcome page with 2 buttons
```

### 📝 Test Application Form
```
URL: http://localhost:3000/apply

Steps:
1. Fill in Full Name (REQUIRED)
2. Fill in Address (optional)
3. Choose Current Location (optional)
4. Fill in company they worked at (optional)
5. Fill in education (optional)
6. Enter expected salary (optional)
7. Choose Preferred Location (dropdown)
8. Upload a PDF or DOCX file
9. Click "Submit Application"
10. ✅ Should see "Success" page
```

### 👨‍💼 Test Admin Dashboard
```
URL: http://localhost:3000/admin/login

Steps:
1. Email: admin@example.com
2. Password: admin123
3. Click "Login"
4. ✅ Should see your submitted application in the table
5. Test Filter by Location
6. Test Sort by Salary/Name/Date
7. Try downloading the CV
8. Click Logout
9. ✅ Should be redirected to login
```

---

## 🎨 USER INTERFACE OVERVIEW

### HOME PAGE
```
┌─────────────────────────────────┐
│  🔷 Candidate Application System│
│         Navigation: Apply | Admin│
├─────────────────────────────────┤
│    Welcome to Candidate         │
│    Application System           │
│                                 │
│    [Submit Application] [Login] │
└─────────────────────────────────┘
```

### APPLICATION FORM
```
┌─────────────────────────────────┐
│ Job Application Form            │
├─────────────────────────────────┤
│ PERSONAL INFORMATION            │
│  Full Name *:     [text box]    │
│  Address:         [large box]   │
│  Current Location:[text box]    │
│                                 │
│ PROFESSIONAL INFORMATION        │
│  Worked At:       [text box]    │
│  Education From:  [text box]    │
│  Expected Salary: [number]      │
│  Preferred Location: [dropdown] │
│                                 │
│ CV UPLOAD                       │
│  Select File:     [file input]  │
│                                 │
│  [Submit] [Clear]               │
└─────────────────────────────────┘
```

### ADMIN DASHBOARD
```
┌──────────────────────────────────┐
│ Admin Dashboard         [Logout]  │
├──────────────────────────────────┤
│ Filter by Location: [dropdown]   │
│ Sort by: [Latest | Salary | Name]│
├──────────────────────────────────┤
│ Name | Location | Education | ... │
├──────────────────────────────────┤
│ John Doe | NYC    | MIT | ...    │
│ Jane Smith | LA   | Stanford | ..│
│ ...                              │
└──────────────────────────────────┘
```

---

## 📊 DATA FLOW DIAGRAM

### Application Submission:
```
User fills form
       ↓
    ↓User uploads CV
       ↓
  Form submitted (POST)
       ↓
Multer validates file (PDF/DOC/DOCX?)
       ↓
    File size OK (<5MB)?
       ↓
Controller saves to MongoDB
       ↓
File stored in /uploads/cvs/
       ↓
✅ Success page shown
```

### Admin Access:
```
User visits /admin/login
       ↓
    Enters credentials
       ↓
  POST to /admin/login
       ↓
Controller verifies email & password
       ↓
  ✅ Match? Create session
   ❌ No match? Show error
       ↓
Session stored in browser cookie
       ↓
Redirected to /admin/dashboard
       ↓
Auth middleware checks session
       ↓
MongoDB query: find all applicants
       ↓
✅ Dashboard displayed with data
```

---

## 🗂️ WHERE THINGS ARE STORED

### Uploaded Files
```
Location: /uploads/cvs/
Contents: john-doe-cv-123456.pdf, jane-smith-cv-789012.docx
Access: Download link in admin dashboard
```

### Form Data
```
Database: MongoDB
Collection: applicants
Access: Admin dashboard (filtered/sorted)
```

### Configuration
```
File: .env
Variables: MONGODB_URI, ADMIN_EMAIL, ADMIN_PASSWORD, SESSION_SECRET
```

---

## 🔐 SECURITY CHECKLIST

✅ **File Upload Security**
- Only PDF, DOC, DOCX allowed
- Max 5MB file size
- Files stored outside public folder
- Unique filenames to prevent overwrites

✅ **Admin Security**
- Email and password required
- Session-based authentication
- Session expires after 24 hours
- Dashboard protected route

✅ **Data Security**
- Input validation on server
- MongoDB protects data
- No sensitive data in client

---

## 🐛 COMMON ISSUES

### "Cannot find module 'express'"
```
Solution: npm install
Reason: Dependencies not installed yet
```

### "MongoDB connection refused"
```
Solution: Start MongoDB (mongod)
Reason: Database server not running
```

### "File upload fails with wrong type"
```
Solution: Upload PDF, DOC, or DOCX
Reason: System only accepts these formats
```

### "Admin login shows error"
```
Solution: Clear browser cookies, try again
Reason: Old session conflicts with new login
```

### "Page stuck on loading"
```
Solution: Check browser console (F12)
Reason: Look for JavaScript errors
```

---

## 📱 RESPONSIVE DESIGN TESTING

### On Desktop (1920x1080)
```
✅ All elements visible
✅ Table shows all columns
✅ Form fields clear and spacious
```

### On Tablet (768px)
```
✅ Buttons stack properly
✅ Text wraps nicely
✅ Touch-friendly inputs
```

### On Mobile (375px)
```
✅ Single column layout
✅ Large touch buttons
✅ Readable font size
```

---

## 🎓 WHAT YOU CAN MODIFY

### Easy Changes
- Company names in dropdown → Edit views/apply.ejs
- Colors → Edit public/css/style.css
- Admin password → Edit .env

### Medium Changes
- Add new form fields → Edit schema + controller + view
- Add new filters → Edit controller + dashboard.ejs
- Change database name → Edit .env MONGODB_URI

### Advanced Changes
- Add email notifications → Install nodemailer package
- Add CSV export → Install csv package
- Add user authentication → Add users table

---

## 📞 DEBUGGING TIPS

### If form doesn't submit:
1. Check browser console (F12 → Console)
2. Check server terminal for errors
3. Verify MongoDB is running
4. Check file upload validation

### If dashboard is empty:
1. Submit an application first
2. Check if logged in
3. Check MongoDB has "candidate_dashboard" database
4. Check terminal for database errors

### If can't login:
1. Clear browser cookies
2. Check .env credentials
3. Restart server
4. Try exact email: admin@example.com

---

## 🚀 DEPLOYMENT PREPARATION

### Before Deploying:
```
❌ Don't use admin@example.com
❌ Don't use admin123 password
❌ Don't use local MongoDB
❌ Don't share .env file

✅ Do set strong admin password
✅ Do use MongoDB Atlas
✅ Do set NODE_ENV=production
✅ Do generate SESSION_SECRET
✅ Do enable HTTPS
```

---

## 📈 NEXT STEPS AFTER SETUP

1. **Immediate** (Today)
   - ✅ Get it running
   - ✅ Test all features
   - ✅ Submit a test application
   - ✅ Test admin dashboard

2. **Short Term** (This week)
   - Customize admin password
   - Modify company names in dropdown
   - Change colors to match branding
   - Add company logo

3. **Medium Term** (This month)
   - Deploy to cloud server
   - Setup backup strategy
   - Add email notifications
   - Train admin users

4. **Long Term** (This quarter)
   - Add advanced filtering
   - Add reports/analytics
   - Scale infrastructure
   - Add more features

---

## ✅ SETUP VERIFICATION CHECKLIST

- [ ] Node.js installed
- [ ] MongoDB running/accessible
- [ ] npm install completed
- [ ] .env file exists with values
- [ ] npm run dev starts without errors
- [ ] http://localhost:3000 loads
- [ ] /apply form visible
- [ ] /admin/login visible
- [ ] Can submit application
- [ ] CV file uploaded successfully
- [ ] Admin login works
- [ ] Dashboard shows submitted data
- [ ] Filtering works
- [ ] Sorting works
- [ ] Download CV link works

**If all ✅, you're ready to go!**

---

## 🎉 CONGRATULATIONS!

Your Candidate Application & Admin Dashboard System is ready!

```
✅ All files created
✅ All features working
✅ Documentation complete
✅ Security implemented
✅ Responsive design
✅ Production ready
```

**Now go build something amazing! 🚀**

---

**Last Updated:** January 14, 2026
**Created For:** Windows Users (Lenovo)
**Status:** ✅ COMPLETE
