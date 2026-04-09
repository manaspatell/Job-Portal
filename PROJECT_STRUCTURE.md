# PROJECT STRUCTURE

```
candidate-admin-dashboard/
│
├── 📄 server.js                    # Main Express server file
├── 📄 package.json                 # Project dependencies and scripts
├── 📄 .env                         # Environment variables (CONFIGURE THIS)
├── 📄 .gitignore                   # Git ignore rules
├── 📄 README.md                    # Full project documentation
├── 📄 QUICKSTART.md                # Quick start guide
│
├── 📁 config/
│   └── 📄 db.js                    # MongoDB connection configuration
│
├── 📁 models/
│   └── 📄 Applicant.js             # Mongoose schema for applicants
│
├── 📁 controllers/
│   ├── 📄 applicantController.js    # Logic for form submission & success page
│   └── 📄 adminController.js        # Logic for login & dashboard
│
├── 📁 routes/
│   ├── 📄 applicantRoutes.js        # GET /apply, POST /apply
│   └── 📄 adminRoutes.js            # Admin login & dashboard routes
│
├── 📁 middleware/
│   ├── 📄 upload.js                 # Multer configuration for CV upload
│   └── 📄 auth.js                   # Authentication middleware for admin
│
├── 📁 views/
│   ├── 📄 home.ejs                  # Home page
│   ├── 📄 apply.ejs                 # Application form
│   ├── 📄 login.ejs                 # Admin login page
│   ├── 📄 dashboard.ejs             # Admin dashboard with all applications
│   ├── 📄 success.ejs               # Success message after submission
│   ├── 📄 404.ejs                   # Page not found
│   ├── 📄 error.ejs                 # Error page
│   └── 📁 partials/
│       ├── 📄 header.ejs            # Header (included in all pages)
│       └── 📄 footer.ejs            # Footer (included in all pages)
│
├── 📁 public/
│   ├── 📁 css/
│   │   └── 📄 style.css             # All CSS styling (responsive)
│   └── 📁 js/
│       └── 📄 main.js               # Client-side validation & utilities
│
└── 📁 uploads/
    └── 📁 cvs/
        └── 📄 .gitkeep              # Placeholder for git (CV files go here)

```

## FILE PURPOSES

### Core Server Files
- **server.js** - Initializes Express, sets up routes, configures middleware, handles errors
- **package.json** - Lists all npm dependencies and scripts

### Configuration
- **.env** - Environment variables (MONGODB_URI, admin credentials, session secret)
- **config/db.js** - Connects to MongoDB using Mongoose

### Data Layer
- **models/Applicant.js** - MongoDB schema defining applicant data structure

### Business Logic
- **controllers/applicantController.js** - Renders form, validates & saves submissions
- **controllers/adminController.js** - Handles login, renders dashboard, logout

### Routing
- **routes/applicantRoutes.js** - Maps /apply routes to controller functions
- **routes/adminRoutes.js** - Maps /admin routes (login, dashboard, logout)

### Middleware
- **middleware/upload.js** - Multer configuration for file upload validation & storage
- **middleware/auth.js** - Checks if user is authenticated before accessing admin routes

### Views (EJS Templates)
- **views/home.ejs** - Landing page with links to apply and admin login
- **views/apply.ejs** - Candidate application form with all input fields
- **views/login.ejs** - Admin login form (email & password)
- **views/dashboard.ejs** - Table of all applications with filter & sort options
- **views/success.ejs** - Confirmation message after successful submission
- **views/404.ejs** - Error page for non-existent routes
- **views/error.ejs** - Generic error page
- **views/partials/header.ejs** - Navigation header (reused in all pages)
- **views/partials/footer.ejs** - Footer with scripts (reused in all pages)

### Static Files
- **public/css/style.css** - All styling (forms, buttons, dashboard, responsive design)
- **public/js/main.js** - Client-side form validation, file size checks

### Uploads
- **uploads/cvs/** - Directory where uploaded CV files are stored (not in public/)

## ARCHITECTURE OVERVIEW

```
USER BROWSER
     ↓
  Routes (Express)
     ↓
Controllers (Business Logic)
     ↓
Models (MongoDB)
     ↓
Database (MongoDB)
```

## DATA FLOW

### Application Submission Flow
1. User visits `/apply` → **applicantController.renderApplyForm()**
2. User submits form with CV → **routes/applicantRoutes** POST
3. **middleware/upload.js** validates file
4. **applicantController.submitApplication()** saves to MongoDB
5. Success page rendered

### Admin Dashboard Flow
1. User visits `/admin/login` → **adminController.renderLoginPage()**
2. User submits credentials → **routes/adminRoutes** POST
3. **adminController.loginAdmin()** validates & sets session
4. User redirected to `/admin/dashboard`
5. **middleware/auth.js** checks session
6. **adminController.getDashboard()** fetches from MongoDB & renders table

## IMPORTANT NOTES

✅ **NO .html files** - Only .ejs templates
✅ **MVC Pattern** - Separated Models, Controllers, Views
✅ **Single Responsibility** - Each file does one thing
✅ **No Hardcoded Data** - Uses .env for configuration
✅ **Clean Structure** - Easy to navigate and maintain
