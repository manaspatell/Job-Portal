# Candidate Application & Admin Dashboard System

A server-rendered web application built with Node.js, Express, EJS, and MongoDB for managing job applications.

## Features

- **Candidate Application Form**: Simple form for candidates to submit job applications with CV upload
- **Admin Dashboard**: Protected dashboard to view all submitted applications
- **File Upload**: Support for PDF, DOC, and DOCX file uploads (max 5MB)
- **Database Integration**: MongoDB with Mongoose ODM
- **Session Management**: Secure admin login with Express Sessions
- **Responsive Design**: Mobile-friendly CSS

## Tech Stack

- **Backend**: Node.js, Express.js
- **Frontend**: EJS (Server-Side Rendering)
- **Database**: MongoDB with Mongoose
- **File Upload**: Multer
- **Sessions**: Express-session
- **Environment**: Dotenv

## Project Structure

```
project-root/
├── server.js              # Main server file
├── .env                   # Environment variables
├── config/
│   └── db.js             # MongoDB connection
├── models/
│   └── Applicant.js      # Mongoose schema
├── controllers/
│   ├── applicantController.js
│   └── adminController.js
├── routes/
│   ├── applicantRoutes.js
│   └── adminRoutes.js
├── middleware/
│   ├── upload.js         # Multer configuration
│   └── auth.js           # Authentication middleware
├── views/
│   ├── home.ejs
│   ├── apply.ejs
│   ├── login.ejs
│   ├── dashboard.ejs
│   ├── success.ejs
│   ├── 404.ejs
│   ├── error.ejs
│   └── partials/
│       ├── header.ejs
│       └── footer.ejs
├── public/
│   ├── css/
│   │   └── style.css
│   └── js/
│       └── main.js
└── uploads/
    └── cvs/              # CV storage
```

## Installation

### Prerequisites
- Node.js (v14+)
- MongoDB (local or cloud)
- npm or yarn

### Setup Steps

1. **Navigate to project directory**
   ```bash
   cd project-root
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   Edit `.env` file:
   ```
   MONGODB_URI=mongodb://localhost:27017/candidate_dashboard
   ADMIN_EMAIL=admin@example.com
   ADMIN_PASSWORD=admin123
   SESSION_SECRET=your_session_secret_key_here
   PORT=3000
   NODE_ENV=development
   ```

4. **Ensure MongoDB is running**
   ```bash
   # For local MongoDB
   mongod
   ```

5. **Start the server**
   ```bash
   # Development mode with nodemon
   npm run dev
   
   # Or production mode
   npm start
   ```

## Usage

### Application Routes

- **Home Page**: `http://localhost:3000/`
- **Apply Form**: `http://localhost:3000/apply`
- **Admin Login**: `http://localhost:3000/admin/login`
- **Admin Dashboard**: `http://localhost:3000/admin/dashboard`

### Default Admin Credentials

- **Email**: admin@example.com
- **Password**: admin123

⚠️ **Important**: Change these credentials in `.env` for production!

## API Endpoints

### Applicant Routes
- `GET /apply` - Display application form
- `POST /apply` - Submit application with CV

### Admin Routes
- `GET /admin/login` - Display login form
- `POST /admin/login` - Authenticate admin
- `GET /admin/dashboard` - View all applications (protected)
- `GET /admin/logout` - Logout admin

## Database Schema

### Applicant Model
```javascript
{
  name: String (required),
  address: String,
  currentLocation: String,
  workedAt: String,
  educationFrom: String,
  preferredLocation: String,
  expectedSalary: Number,
  cvPath: String,
  createdAt: Date (default: now)
}
```

## Features in Detail

### Application Form
- Personal information fields (name, address, location)
- Professional information fields (company, education, salary)
- CV upload with validation
- Form validation on client and server side
- File type validation (PDF, DOC, DOCX only)
- Max file size: 5MB

### Admin Dashboard
- View all applications in a table
- Filter by preferred location
- Sort by:
  - Latest submissions
  - Expected salary (high to low)
  - Applicant name (A to Z)
- Download CV links
- Submission date display
- Protected route with session authentication

## Error Handling

- Multer file upload errors
- MongoDB connection errors
- Form validation errors
- Authentication errors
- 404 page not found
- General error page

## Security Features

- Express Sessions for admin authentication
- File upload validation (MIME type + extension)
- Secure file storage outside public folder
- Environment variables for sensitive data
- No hardcoded credentials
- CORS headers ready (can be enabled in server.js)

## Middleware

### Upload Middleware
- Validates file type (PDF, DOC, DOCX)
- Enforces max file size (5MB)
- Stores files in `/uploads/cvs` with unique names

### Auth Middleware
- Protects admin routes
- Redirects unauthenticated users to login
- Session-based authentication

## Styling

- Responsive CSS (mobile-friendly)
- Gradient header
- Form styling with focus states
- Table styling for dashboard
- Alert messages (error, success)
- Button variants (primary, secondary, danger)

## Client-side JavaScript

- Form validation
- File size validation
- Prevent form submission if validation fails
- User feedback with alerts

## Optional Enhancements

- ✅ Success message after submission
- ✅ Dashboard pagination
- ✅ Filter and sort capabilities
- CSV export functionality
- Role-based access control
- Email notifications
- Advanced search

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running
- Check `MONGODB_URI` in `.env`
- Verify MongoDB credentials if using Atlas

### File Upload Fails
- Check file format (must be PDF, DOC, or DOCX)
- Verify file size (max 5MB)
- Ensure `/uploads/cvs` directory exists

### Session Not Working
- Clear browser cookies
- Check `SESSION_SECRET` is set in `.env`
- Verify cookies are enabled

## Development Tips

- Use `npm run dev` for development with auto-reload
- Check console for MongoDB and server logs
- Use browser DevTools for frontend debugging
- Test form validation in browser console

## Production Deployment

Before deploying:

1. Change admin credentials in `.env`
2. Update `MONGODB_URI` to production database
3. Set `NODE_ENV=production`
4. Use a strong `SESSION_SECRET`
5. Enable HTTPS
6. Setup proper error logging
7. Configure CORS if needed
8. Setup backup strategy for uploads

## License

ISC

## Author

Manas Patel
