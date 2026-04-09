# 🌱 SEED SCRIPT - Generate 150 Sample Applicants

## Overview

The `seed.js` file generates **150 realistic sample applicants** with random data. Perfect for testing the admin dashboard with real-looking data.

## What It Creates

Each sample applicant includes:
- ✅ Full Name (random first + last name)
- ✅ Address (random US address format)
- ✅ Current Location (real US cities)
- ✅ Previous Company (Fortune 500 & tech companies)
- ✅ Education (top universities)
- ✅ Expected Salary ($40,000 - $200,000 range)
- ✅ Preferred Location (various US cities or Remote/Hybrid)
- ✅ CV Path (80% have CV files, 20% don't)
- ✅ Creation Date (random date in last 90 days)

## How to Use

### Option 1: Using npm script (Recommended)

```bash
npm run seed
```

### Option 2: Direct node command

```bash
node seed.js
```

## What Happens

1. **Connects to MongoDB** using `MONGODB_URI` from `.env`
2. **Clears existing data** (removes old applicants)
3. **Generates 150 new sample records** with realistic data
4. **Inserts into database** in bulk
5. **Shows summary** with statistics
6. **Displays 5 sample records** for verification

## Expected Output

```
✅ Cleared existing applicants
✅ Generated 150 sample applicants
✅ Successfully inserted 150 applicants into database

📊 SEED DATA SUMMARY:
   Total Applicants: 150
   Average Expected Salary: $118,500
   Applicants with CV: 120
   Applicants without CV: 30

📝 SAMPLE RECORDS:
   1. James Smith
      Location: New York, NY
      Preferred: Remote
      Education: MIT
      Company: Google
      Salary: $150,000
      CV: ✅ Yes
   ...

✅ SEED COMPLETED SUCCESSFULLY!
```

## When to Use

### ✅ Use when:
- Testing the admin dashboard for the first time
- Want to populate database with test data
- Need to test filtering and sorting
- Showing the project to others
- Performance testing

### ❌ Don't use when:
- You have real applicant data
- In production environment
- You want to keep existing data (it will be cleared!)

## Customization

### Change Number of Records

Edit `seed.js` line where `generateApplicants` is called:

```javascript
// Change 150 to any number you want
const applicants = generateApplicants(150);
```

### Add More Data Options

Edit the arrays at the top of `seed.js`:

```javascript
const companies = [
  'Your Company 1',
  'Your Company 2',
  // ... more companies
];
```

### Adjust Salary Range

Find this line and modify:

```javascript
// Change 40000-200000 to your range
const getRandomSalary = () => Math.floor(Math.random() * (200000 - 40000 + 1)) + 40000;
```

### Change CV Probability

Find this line and adjust the percentage:

```javascript
// Change 0.2 to 0.3 for 70% with CV instead of 80%
const hasCv = Math.random() > 0.2;
```

## Data Breakdown

### Names (50 first names, 50 last names)
- Realistic English names
- Mix of male and female names

### Addresses (10 sample formats)
- Street addresses with suite/apt numbers
- Realistic US address patterns

### Companies (48 companies)
- Tech giants: Google, Microsoft, Apple, etc.
- Banks: JPMorgan, Goldman Sachs, etc.
- Consulting: McKinsey, BCG, Bain, etc.

### Universities (42 universities)
- Top tier: MIT, Stanford, Harvard, etc.
- Excellent schools: Northwestern, Duke, etc.
- State universities: Michigan, Wisconsin, etc.

### Locations (20+ locations)
- Major US cities
- Remote and Hybrid options

## Salary Distribution

```
Minimum: $40,000
Maximum: $200,000
Average:  ~$120,000
Distribution: Random (uniform)
```

## File Storage

- **80% of records** include a CV file reference (e.g., `uploads/cvs/cv-sample-001.pdf`)
- **20% of records** don't have a CV (null value)
- Files are referenced but not actually created (references only)
- Use for testing download functionality

## Database Requirements

- MongoDB must be running
- `.env` file with correct `MONGODB_URI`
- Database can be local or MongoDB Atlas

## Troubleshooting

### Error: "Cannot find module 'mongoose'"
**Solution:** Run `npm install` first

### Error: "MongoDB connection refused"
**Solution:** Ensure MongoDB is running (`mongod`)

### Error: "Connection to `mongodb://localhost:27017` failed"
**Solution:** Check `MONGODB_URI` in `.env` file

### Error: "Applicant is not a constructor"
**Solution:** Ensure MongoDB connection is established before schema creation

## Testing After Seed

1. **Run server:** `npm run dev`
2. **Visit dashboard:** `http://localhost:3000/admin/login`
3. **Login:** admin@example.com / admin123
4. **Should see:** 150 applicants in the table
5. **Test filtering:** Try filtering by location
6. **Test sorting:** Sort by salary, name, date

## Security Notes

⚠️ **WARNING:** This script clears all existing data!

```javascript
// This line deletes all applicants:
await Applicant.deleteMany({});
```

**Before running in production:**
- Create a backup first
- Use separate testing database
- Modify script to NOT clear data if needed

## To Keep Existing Data

If you want to add 150 records without deleting existing ones, comment out:

```javascript
// await Applicant.deleteMany({});  // Comment this line
```

Then run again.

## Performance

- **Execution Time:** ~2-5 seconds for 150 records
- **Database Size:** ~150KB (rough estimate)
- **Network:** Minimal (local operations)

## What Data Files Represent

The CV paths (e.g., `uploads/cvs/cv-sample-001.pdf`) are:
- ✅ Referenced in database records
- ❌ Not actually created as files
- For testing download link functionality

To actually create the files, see [VISUAL_GUIDE.md](VISUAL_GUIDE.md)

## Next Steps After Seeding

1. ✅ Seed the database: `npm run seed`
2. ✅ Start server: `npm run dev`
3. ✅ View dashboard: Visit `/admin/dashboard`
4. ✅ Test features: Filter, sort, download
5. ✅ Create real entries: Visit `/apply`

## Example Script Variations

### Seed with fewer records:
```bash
# Modify seed.js line to:
const applicants = generateApplicants(50);
node seed.js
```

### Seed production database:
```bash
# Update .env with production URI
MONGODB_URI=your-atlas-connection-string
npm run seed
```

### Seed and keep logs:
```bash
# Redirect output to file
npm run seed > seed-log.txt
```

## Help & Support

- Check `.env` is configured correctly
- Ensure MongoDB is accessible
- Review console output for specific errors
- Check [SETUP_GUIDE.txt](SETUP_GUIDE.txt) for troubleshooting

---

**Seed File:** `seed.js`  
**Command:** `npm run seed`  
**Records Generated:** 150  
**Status:** ✅ Ready to use
