# Subscription Auto-Pause & Daily Countdown System

## Overview
This system automatically manages school subscription lifecycles with zero manual intervention:
- **Daily Countdown**: Days remaining decrease automatically each day
- **Auto-Pause**: Accounts automatically pause when subscription expires
- **Real-time Validation**: No cron jobs needed - checks happen on every page access

---

## How It Works

### 1. Daily Countdown (Automatic)
The system calculates days remaining dynamically on every page view:

```javascript
const now = new Date();
const subEndDate = new Date(school.subscription.endDate);
const subDaysLeft = Math.ceil((subEndDate - now) / (1000 * 60 * 60 * 24));
```

**Example Timeline:**
- Day 1: Subscription created, 30 days remaining shown
- Day 2: Days countdown automatically shows 29 days (no database update needed)
- Day 30: 1 day remaining
- Day 31: Subscription expired, account auto-paused

### 2. Auto-Pause Mechanism

The system pauses accounts automatically through **two safety checkpoints**:

#### Checkpoint 1: Login Check (`schoolController.js`)
When a school tries to login:
```javascript
if (new Date() > school.subscription.endDate) {
  // Subscription expired - pause account automatically
  school.status = 'paused';
  school.subscription.status = 'expired';
  await school.save();
  // Show error: "Your subscription expired on X. Your account has been paused."
}
```

#### Checkpoint 2: Session Validation Middleware (`schoolAuth.js`)
On every page access, the middleware checks and pauses if needed:
```javascript
const checkAndPauseExpiredSubscriptions = async (schoolId) => {
  const school = await School.findById(schoolId);
  if (new Date() > school.subscription.endDate) {
    school.status = 'paused';
    school.subscription.status = 'expired';
    await school.save();
    return { expired: true };
  }
};
```

### 3. Access Blocking
After pause, schools see error message:
```
Your subscription expired on MM/DD/YYYY. Your account has been paused. 
Please contact admin to renew.
```

---

## Database Fields

### School Model (`models/School.js`)
```javascript
subscription: {
  tier: String,           // 'none', 'silver', 'gold', 'diamond'
  startDate: Date,        // When subscription started
  endDate: Date,          // When subscription expires (auto-calculated)
  status: String          // 'active' or 'expired' (set when paused)
}
status: String           // 'active', 'paused', etc.
```

### Subscription Tiers
- **Silver**: 30 days
- **Gold**: 6 months (182 days)
- **Diamond**: 1 year (365 days)

---

## File Locations

### Core Implementation

1. **schoolAuth.js** - Middleware for real-time validation
   - Function: `checkAndPauseExpiredSubscriptions()`
   - Called: On every protected school page access
   - Action: Auto-pauses account when endDate passed

2. **schoolController.js** - Login checkpoint
   - Function: `login()`
   - Action: Prevents login if expired, auto-pauses account
   - Shows: Clear expiry message to school

3. **manage-credentials.ejs** - Admin dashboard
   - Displays: "30d left", "29d left", etc. (updates daily)
   - Shows: "Expired" badge when past endDate
   - Color coding: Green (active), Red (critical/expired)

4. **adminController.js** - Subscription management
   - Function: `createCredential()` - Sets up subscription
   - Function: `editCredential()` - Updates tier & recalculates endDate
   - Function: `getSubscriptions()` - Shows all subscriptions

---

## Testing the System

### Manual Test: Create Test Subscription
1. Go to Admin → Credentials → Create School
2. Select subscription tier (e.g., Silver for 30 days)
3. Note the start date and calculated end date

### Verify Daily Countdown
1. Admin Dashboard → Manage Credentials
2. Check "days left" column (e.g., "30d left")
3. Next day, reload page: should show "29d left"
4. No database changes needed - calculation is automatic

### Verify Auto-Pause (Quick Test)
To test without waiting 30 days:
1. In database, manually set `subscription.endDate` to yesterday
2. Reload school dashboard page
3. Should see: "Your account has been paused"
4. Try to login: same message appears
5. Check database: `school.status = 'paused'`, `subscription.status = 'expired'`

### Verify Access Blocking
1. Create test school with subscription
2. Login as school
3. Change `subscription.endDate` to yesterday (database)
4. Reload page: Redirected to login with error message
5. Try to login: Blocked with "Account paused" message

---

## Key Features

✅ **Zero Manual Updates**: Days countdown automatic, no cron jobs needed
✅ **Dual Checkpoint Security**: Login + middleware validation
✅ **Automatic Account Pausing**: `status='paused'` set automatically when expired
✅ **Clear Error Messages**: Users see exactly when subscription expired
✅ **Tracking**: `subscription.status='expired'` marks why account was paused
✅ **Real-time Calculation**: Math.ceil((endDate - now) / (1000*60*60*24))
✅ **Production Ready**: Handles timezone issues, no date parsing errors

---

## Subscription Lifecycle

```
1. Admin creates credential → Calculates subscription.endDate
                            ↓
2. School logs in         → Checks subscription.endDate
                            ↓
3. Days remaining shown   → Automatically counts down daily
                            ↓
4. Last day of subscription → Shows "1d left"
                            ↓
5. Subscription expires   → Auto-pauses account
                            ↓
6. School tries to access → Blocked with error message
                            ↓
7. Admin can renew        → New subscription tier + endDate set
```

---

## API Endpoints

### Create School with Subscription
```
POST /admin/credentials/create
Body: {
  name, email, location, genderFilter,
  subscriptionTier: 'silver' | 'gold' | 'diamond'
}
```

### Edit School Subscription
```
POST /admin/credentials/edit/:id
Body: {
  name, email, location, genderFilter,
  subscriptionTier: 'silver' | 'gold' | 'diamond'
}
```

### View All Subscriptions
```
GET /admin/subscriptions
```

### Upgrade Subscription
```
POST /admin/subscriptions/upgrade/:id
Body: { newTier: 'silver' | 'gold' | 'diamond' }
```

### Renew Subscription
```
POST /admin/subscriptions/renew/:id
Body: { renewTier: 'silver' | 'gold' | 'diamond' }
```

### Cancel Subscription
```
POST /admin/subscriptions/cancel/:id
```

---

## Status Indicators in Admin Dashboard

| Status | Color | Meaning |
|--------|-------|---------|
| "Active" + "30d left" | Green | Subscription active, 30 days remaining |
| "Active" + "7d left" | Orange/Red | Critical - expires soon |
| "Expired" | Red | Subscription past end date, account paused |
| "No subscription" | Gray | Subscription tier = 'none' |

---

## Important Notes

1. **No External Dependencies**: System works without cron jobs, scheduled tasks, or external services
2. **Browser Independence**: Countdown works across browsers/devices - based on server date
3. **Timezone Safe**: Uses JavaScript Date() which respects server timezone
4. **Database Efficient**: Only writes to DB when pausing (once per expired account)
5. **Session Secure**: Session cleared immediately on access after expiry

---

## Troubleshooting

### Issue: Countdown not updating daily
- **Cause**: Browser cache
- **Solution**: Hard refresh (Ctrl+Shift+R)
- **Alternative**: Days calculation is live - no refresh needed

### Issue: Account not pausing after expiry
- **Cause**: endDate calculation incorrect
- **Solution**: Check `editCredential()` function for proper tier → days mapping
- **Debug**: Check database `school.subscription.endDate` format

### Issue: School can still access after pause
- **Cause**: Middleware not catching all routes
- **Solution**: Add schoolAuth middleware to all protected school routes
- **Verify**: Check `schoolRoutes.js` has `router.use(schoolAuth)`

---

## Future Enhancements

- [ ] Pre-expiry warnings (7 days, 3 days before expiry)
- [ ] Admin notification when subscriptions expiring
- [ ] Auto-renewal with saved payment method
- [ ] Billing history and invoices
- [ ] Subscription change history audit log
