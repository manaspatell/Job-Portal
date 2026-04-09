# 🎓 Teacher Recruitment System - Quick Start Guide

## 🚀 Getting Started

### 1. Start the Server
```bash
npm start
```
The application will start on `http://localhost:3000`

### 2. Login to Admin Panel
- **URL**: http://localhost:3000/admin/login
- **Email**: admin@example.com
- **Password**: admin123

### 3. You're in! 🎉

---

## 📊 Dashboard Overview

### Top Section: Statistics Cards
Shows 6 key metrics:
- **Total Applicants**: Overall count of all applicants
- **Shortlisted**: Number marked as shortlisted
- **Approved**: Number marked as approved
- **Pending Review**: Number awaiting action
- **Avg Expected Salary**: Average salary expectation
- **Top Qualification**: Most common qualification

### Search Bar
Use to quickly find applicants:
- Type **name**, **email**, **phone**, or **skills**
- Results update in the table below
- Case-insensitive search

### Advanced Filters
Five dropdown filters:
1. **Status** - Pending, Shortlisted, Approved, Rejected
2. **State** - Choose from all 28 Indian states
3. **Preferred Location** - Where they want to work
4. **College Tier** - Tier 1, 2, or 3 institutions
5. **Qualification** - B.Tech, M.Tech, B.Sc, M.Sc, etc.

Click **"✓ Apply Filters"** to search or **"↺ Reset"** to clear all filters

---

## 👤 Managing Individual Applicants

### View Full Profile
1. Click the **👁️ icon** in the Actions column
2. See complete details including:
   - Full contact information
   - Education details
   - Skills (with color coding)
   - Salary expectation
   - Tags
   - Resume/CV (if available)
   - Internal notes
   - Activity timeline

### Update Status
1. Click the **Status dropdown** for any applicant
2. Select one of:
   - ⏳ **Pending** - Under review
   - ⭐ **Shortlisted** - Good candidate
   - ✅ **Approved** - Ready to hire
   - ❌ **Rejected** - Not suitable
3. Status updates immediately

### Give a Rating
1. Click the **stars (★)** in the Rating column
2. Select 1-5 stars
3. Rating updates immediately

### Add Tags
1. Type in the **"Add tag..." field**
2. Press **Enter** to save
3. Tags appear as yellow badges above the field
4. Useful tags: experienced, certified, excellent, etc.

### Add Notes
1. Click the **📝 icon** in Actions
2. Type your notes in the popup
3. Click **"Save Notes"** to store
4. Notes are saved with the applicant profile

### Download CV
1. Click the **📄 icon** if available
2. Opens PDF/document in new window
3. Can save to computer

### Delete Applicant
1. Click the **🗑️ icon** in Actions
2. Confirm deletion in popup
3. Applicant is permanently removed

---

## ✅ Bulk Operations

### Select Multiple Applicants
1. Check the **checkbox ☑️** next to applicant names
2. Check **"Select All"** at top to select all on page
3. A **yellow action bar** appears showing count selected

### Bulk Status Update
1. Select applicants (checkboxes)
2. Click **"Change Status"** button
3. Choose new status in popup
4. Click **"Update Status"**
5. All selected applicants get the new status

### Bulk Delete
1. Select applicants (checkboxes)
2. Click **"Delete Selected"** button
3. Confirm in popup
4. All selected applicants are deleted

### Clear Selection
Click **"Clear Selection"** to uncheck all boxes

---

## 📄 Export & Reports

### Export to CSV
1. Click **"📥 Export CSV"** button in top right
2. Downloads file with all applicants
3. Open in Excel for further analysis
4. Includes all fields: name, email, phone, status, rating, etc.

### View Shortlisted Only
1. Click **"⭐ Shortlisted"** button in top right
2. See shortlisted candidates in card view
3. Shows rating, contact, education, skills
4. Can filter by state
5. Can remove from shortlist
6. Export just shortlisted candidates

---

## 📋 Pagination

### Navigate Pages
- Shows current page (e.g., "Page 1 of 15")
- Shows 10 applicants per page
- **First** / **Previous** - Go to start or previous page
- **Page numbers** - Click to jump to specific page
- **Next** / **Last** - Go to next or last page
- **Active page** shown in blue

---

## 💡 Pro Tips

### Efficient Workflow
1. **Search first** - Find relevant applicants
2. **Filter by status** - Group by stage
3. **Rate & tag** - Add your assessment
4. **Add notes** - Reasons for decisions
5. **Bulk actions** - Update multiple at once
6. **Export** - For external sharing/analysis

### Using the Detail View
- Great for in-depth review
- Add comprehensive notes
- Check activity timeline
- See all information in one place
- Make final decision

### Shortlist Management
- Mark promising candidates as "Shortlisted"
- View shortlist for interviews
- Filter by location/qualification
- Export for interview planning
- Remove if circumstances change

### Status Workflow Example
1. **Pending** - Initial submission
2. **Shortlisted** - After initial review (good candidates)
3. **Approved** - Final hire decision
4. **Rejected** - Not suitable
5. Use **"Bulk Status"** to move multiple through workflow

---

## 🎨 UI Guide

### Color Meanings
- 🟢 **Green** - Approved, Shortlisted
- 🟠 **Orange** - Pending, Needs review
- 🔴 **Red** - Rejected, Delete
- 🔵 **Blue** - Info, Links
- ⭐ **Yellow** - Stars, Tags

### Button Types
- **Primary (Purple)** - Main actions (Apply, Search, Save)
- **Success (Green)** - Positive (Shortlisted)
- **Warning (Orange)** - Caution (Pending, Notes)
- **Danger (Red)** - Delete, Reject
- **Info (Blue)** - View, Download
- **Secondary (Gray)** - Back, Reset

### Status Badges
- ⏳ Pending - Gray
- ⭐ Shortlisted - Green
- ✅ Approved - Blue
- ❌ Rejected - Red

---

## ⚙️ Settings & Logout

### Logout
Click **"🚪 Logout"** button in top right to exit

### Login Again
Navigate to `/admin/login` and enter credentials

---

## ❓ Troubleshooting

### Filters not working?
- Check syntax (case doesn't matter)
- Use exact state/city names
- Clear filters and try again

### Changes not saving?
- Make sure you clicked Save/Submit
- Check browser console for errors
- Refresh page to see latest data

### Can't find an applicant?
- Use search bar instead of filters
- Search by email or phone
- Check filters aren't too restrictive

### Download not working?
- Check file path is correct
- Ensure CV was uploaded with application
- Try right-click → Save As

---

## 📊 Common Tasks

### Task: Find all engineers from Maharashtra
1. Search: "Engineer" (in skills)
2. Filter State: "Maharashtra"
3. Apply filters

### Task: Review pending applications
1. Filter Status: "Pending"
2. Sort newest first
3. Click each to review
4. Rate/tag/add notes
5. Update status when done

### Task: Prepare shortlist for interviews
1. Filter Status: "Shortlisted"
2. View Shortlisted section
3. Export CSV
4. Share with interview team

### Task: Bulk approve qualified candidates
1. Search by qualification
2. Select all good candidates
3. Bulk Status Update → Approved
4. Export list

### Task: Remove unsuitable candidates
1. Filter status: Pending
2. Review ratings/notes
3. Check rejected candidates
4. Bulk delete rejected
5. Filter again to confirm

---

## 📱 Mobile Usage

The dashboard is **responsive** and works on:
- ✅ Desktop computers
- ✅ Tablets
- ✅ Mobile phones (though table may scroll horizontally)

For best experience:
- Use portrait mode on mobile
- Rotate to landscape for table view
- Use search instead of filters on small screens

---

## 🔐 Security Notes

- **Keep login secure** - Don't share credentials
- **Change password** - Update in your profile (future feature)
- **Logout when done** - Always logout before leaving
- **Confidential data** - Don't share exported lists
- **Notes are private** - Only visible to admin users

---

## ✨ Features Summary

| Feature | How to Use |
|---------|-----------|
| 🔍 Search | Type name/email/phone in search bar |
| 📊 Filter | Use dropdown filters + Apply |
| ⭐ Rate | Click stars in rating column |
| 📝 Tag | Type tag name + Enter |
| 📄 Notes | Click 📝 icon, type, save |
| 💾 Save | All changes saved automatically |
| 📥 Export | Click Export CSV button |
| ⭐ Shortlist | View shortlisted section |
| ✅ Bulk Update | Select + Change Status |
| 🗑️ Delete | Click 🗑️ + confirm |
| 👁️ View Profile | Click 👁️ for full details |

---

**Ready to recruit! 🎉**

For questions or issues, contact your system administrator.
