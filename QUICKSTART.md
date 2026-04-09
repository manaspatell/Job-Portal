# Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Start MongoDB
Make sure MongoDB is running on your system:
```bash
# Windows (if installed)
mongod

# Or use MongoDB Atlas cloud service
```

### Step 3: Configure Environment
The `.env` file is already configured with default values:
- Admin Email: `admin@example.com`
- Admin Password: `admin123`

For production, change these values!

### Step 4: Start the Server
```bash
# Development mode (with auto-reload)
npm run dev

# Or production mode
npm start
```

### Step 5: Access the Application
- **Home**: http://localhost:3000/
- **Apply Form**: http://localhost:3000/apply
- **Admin Login**: http://localhost:3000/admin/login
- **Admin Dashboard**: http://localhost:3000/admin/dashboard

## 📋 Testing the Application

### Test Application Submission
1. Go to http://localhost:3000/apply
2. Fill in the form with test data
3. Upload a PDF/DOC/DOCX file (max 5MB)
4. Click "Submit Application"
5. You should see a success message

### Test Admin Dashboard
1. Go to http://localhost:3000/admin/login
2. Login with:
   - Email: `admin@example.com`
   - Password: `admin123`
3. You'll see all submitted applications
4. Test filtering and sorting options

## 📁 File Structure at a Glance

```
20k/
├── server.js              ← Main server file (start here)
├── .env                   ← Environment variables
├── package.json           ← Dependencies
│
├── config/db.js           ← MongoDB connection
├── models/Applicant.js    ← Data schema
├── controllers/           ← Business logic
├── routes/                ← API routes
├── middleware/            ← Upload & Auth
├── views/                 ← EJS templates (NO .html files!)
├── public/                ← CSS and JS
└── uploads/cvs/           ← Uploaded CV files
```

## 🔑 Key Features

✅ **Candidate Application Form**
- Name, address, location fields
- Education & work experience
- Salary expectation
- CV upload (PDF/DOC/DOCX)

✅ **Admin Dashboard**
- View all applications
- Filter by preferred location
- Sort by submission date, salary, name
- Download CV files

✅ **Security**
- Admin login with sessions
- File upload validation
- Input validation

## 🐛 Common Issues & Solutions

### MongoDB Connection Error
**Problem**: Can't connect to MongoDB
**Solution**: 
- Check MongoDB is running (`mongod`)
- Verify MongoDB URI in `.env`
- Use `mongodb://localhost:27017/candidate_dashboard` for local

### File Upload Fails
**Problem**: Can't upload CV file
**Solution**:
- File must be PDF, DOC, or DOCX
- File size must be less than 5MB
- Check browser console for errors

### Admin Login Not Working
**Problem**: Can't login to admin
**Solution**:
- Clear browser cookies
- Use exact credentials: `admin@example.com` / `admin123`
- Check `.env` file for correct credentials

## 💡 Next Steps

1. ✅ Install dependencies: `npm install`
2. ✅ Start MongoDB
3. ✅ Run server: `npm run dev`
4. ✅ Test application form at `/apply`
5. ✅ Test admin at `/admin/login`
6. ✅ Submit test applications
7. ✅ View dashboard at `/admin/dashboard`

## 📚 File Descriptions

| File | Purpose |
|------|---------|
| `server.js` | Express server configuration & routes setup |
| `config/db.js` | MongoDB connection configuration |
| `models/Applicant.js` | MongoDB schema for applicants |
| `controllers/applicantController.js` | Form handling logic |
| `controllers/adminController.js` | Dashboard & login logic |
| `middleware/upload.js` | Multer file upload configuration |
| `middleware/auth.js` | Admin authentication middleware |
| `views/apply.ejs` | Application form page |
| `views/dashboard.ejs` | Admin dashboard page |
| `views/login.ejs` | Admin login page |
| `public/css/style.css` | All styling |
| `public/js/main.js` | Client-side validation |

## 🔒 Production Tips

Before deploying to production:

1. Change admin password in `.env`
2. Use MongoDB Atlas instead of local MongoDB
3. Set `NODE_ENV=production`
4. Generate strong `SESSION_SECRET`
5. Setup HTTPS
6. Use environment-specific `.env` files
7. Setup logging
8. Configure CORS if needed

## 📞 Support

For errors, check:
1. Browser console (F12)
2. Terminal/server console
3. Check MongoDB is running
4. Verify all dependencies installed: `npm list`

## 🎉 You're All Set!

Your application is ready to use. Start building!
