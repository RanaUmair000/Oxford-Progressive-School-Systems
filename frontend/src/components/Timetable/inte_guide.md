# Timetable Module - Integration Guide

## 📋 Table of Contents
1. [Backend Integration](#backend-integration)
2. [Frontend Integration](#frontend-integration)
3. [Database Setup](#database-setup)
4. [API Testing](#api-testing)
5. [Common Issues](#common-issues)

---

## 🔧 Backend Integration

### Step 1: Copy Models to Your Project

Copy the following model files to your backend `models` directory:

```
backend/
  models/
    TimeSlot.js
    Timetable.js
    Holiday.js
```

### Step 2: Copy Controllers

Copy controller files to your `controllers` directory:

```
backend/
  controllers/
    timeSlotController.js
    timetableController.js
    holidayController.js
```

### Step 3: Register Routes

Add the timetable routes to your main Express app (usually in `server.js` or `app.js`):

```javascript
// Import routes
const timetableRoutes = require('./routes/timetableRoutes');

// Register routes
app.use('/api/timetable', timetableRoutes);
```

### Step 4: Setup Authentication Middleware (Optional)

If you have authentication in your project, uncomment the auth middleware in `timetableRoutes.js`:

```javascript
// Before:
router.post('/timeslots', /* protect, authorize('admin'), */ createTimeSlot);

// After (with your auth middleware):
router.post('/timeslots', protect, authorize('admin'), createTimeSlot);
```

Make sure your auth middleware exports match:
- `protect` - Verifies JWT token
- `authorize(...roles)` - Checks user role

### Step 5: Environment Variables

Add to your `.env` file if needed:

```env
ACADEMIC_YEAR=2024-2025
```

---

## 🎨 Frontend Integration

### Step 1: Copy Service File

Copy `timetableService.js` to your services folder:

```
frontend/
  src/
    services/
      timetableService.js
```

Update the API_URL in the service file to match your backend:

```javascript
const API_URL = 'http://localhost:5000/api/timetable'; // Adjust port if needed
```

### Step 2: Copy Components

Copy all component files to your components directory:

```
frontend/
  src/
    components/
      Timetable/
        TimetableBuilder.jsx
        StudentTimetableWidget.jsx
        TeacherTimetableWidget.jsx
        TimeSlotManager.jsx
```

### Step 3: Install Required Dependencies

If not already installed:

```bash
npm install react-icons axios
```

### Step 4: Add Routes

Add routes to your React Router configuration:

```javascript
import TimetableBuilder from './components/Timetable/TimetableBuilder';
import TimeSlotManager from './components/Timetable/TimeSlotManager';

// In your routes:
<Route path="/timetable/builder" element={<TimetableBuilder />} />
<Route path="/timetable/timeslots" element={<TimeSlotManager />} />
```

### Step 5: Add Dashboard Widgets

#### For Student Dashboard:

```javascript
import StudentTimetableWidget from './components/Timetable/StudentTimetableWidget';

// In your student dashboard:
<StudentTimetableWidget studentData={currentStudent} />
```

Pass student data with format:
```javascript
{
  classId: "mongoId" or { _id: "mongoId", name: "Class 10" },
  sectionId: "mongoId" or { _id: "mongoId", name: "A" }
}
```

#### For Teacher Dashboard:

```javascript
import TeacherTimetableWidget from './components/Timetable/TeacherTimetableWidget';

// In your teacher dashboard:
<TeacherTimetableWidget teacherId={currentTeacher._id} />
```

---

## 💾 Database Setup

### Step 1: Create Indexes

The models will automatically create indexes, but you can manually verify in MongoDB:

```javascript
// In MongoDB shell or Compass
db.timeslots.createIndex({ order: 1 })
db.timetables.createIndex({ classId: 1, sectionId: 1, day: 1, academicYear: 1 })
db.timetables.createIndex({ teacherId: 1, day: 1, academicYear: 1 })
db.holidays.createIndex({ date: 1, academicYear: 1 })
```

### Step 2: Seed Initial Data (Optional)

Create time slots via the TimeSlotManager UI or use the API:

```javascript
// Example: Creating default time slots
POST http://localhost:5000/api/timetable/timeslots/bulk

Body:
{
  "timeSlots": [
    { "startTime": "08:00", "endTime": "08:45", "order": 1, "label": "Period 1" },
    { "startTime": "08:45", "endTime": "09:30", "order": 2, "label": "Period 2" },
    { "startTime": "09:30", "endTime": "09:45", "order": 3, "label": "Break", "isBreak": true },
    { "startTime": "09:45", "endTime": "10:30", "order": 4, "label": "Period 3" },
    { "startTime": "10:30", "endTime": "11:15", "order": 5, "label": "Period 4" }
  ]
}
```

---

## 🧪 API Testing

### Using Postman/Thunder Client

#### 1. Create Time Slot
```
POST /api/timetable/timeslots
Content-Type: application/json

{
  "startTime": "08:00",
  "endTime": "08:45",
  "order": 1,
  "label": "Period 1"
}
```

#### 2. Create Timetable Entry
```
POST /api/timetable/entries
Content-Type: application/json

{
  "classId": "60f7b3b3b3b3b3b3b3b3b3b3",
  "sectionId": "60f7b3b3b3b3b3b3b3b3b3b4",
  "day": "Monday",
  "timeSlotId": "60f7b3b3b3b3b3b3b3b3b3b5",
  "subjectId": "60f7b3b3b3b3b3b3b3b3b3b6",
  "teacherId": "60f7b3b3b3b3b3b3b3b3b3b7",
  "room": "101",
  "academicYear": "2024-2025"
}
```

#### 3. Get Class Weekly Schedule
```
GET /api/timetable/class/:classId/:sectionId?academicYear=2024-2025
```

#### 4. Get Teacher Today's Schedule
```
GET /api/timetable/today/teacher/:teacherId?academicYear=2024-2025
```

#### 5. Check Conflict
```
POST /api/timetable/check-conflict
Content-Type: application/json

{
  "teacherId": "60f7b3b3b3b3b3b3b3b3b3b7",
  "classId": "60f7b3b3b3b3b3b3b3b3b3b3",
  "sectionId": "60f7b3b3b3b3b3b3b3b3b3b4",
  "day": "Monday",
  "timeSlotId": "60f7b3b3b3b3b3b3b3b3b3b5",
  "academicYear": "2024-2025"
}
```

---

## 🔍 Common Issues & Solutions

### Issue 1: "Teacher conflict" or "Class conflict" errors

**Solution:** The system is working correctly! These errors prevent double-booking:
- Teacher cannot teach two classes at the same time
- Class cannot have two subjects at the same time

Check existing timetable entries before creating new ones.

### Issue 2: Cannot fetch timetable - Returns empty

**Checklist:**
1. ✅ Time slots created?
2. ✅ Correct academic year format (YYYY-YYYY)?
3. ✅ Valid class and section IDs?
4. ✅ Entries marked as `isActive: true`?

### Issue 3: Student/Teacher widget not showing data

**Common causes:**
1. Wrong student/teacher data format
2. Missing classId/sectionId in student data
3. Academic year mismatch
4. No entries created for today

**Debug:**
```javascript
// Check student data structure
console.log(studentData);
// Should have: { classId: "...", sectionId: "..." }

// Check academic year
console.log(getCurrentAcademicYear());
// Should match entries in database
```

### Issue 4: Time slot overlap error

**Solution:** This is a validation feature. Time slots cannot overlap.

Example of conflict:
- Slot 1: 08:00 - 08:45 ✅
- Slot 2: 08:30 - 09:15 ❌ (overlaps with Slot 1)

### Issue 5: Port conflicts or CORS errors

**Solution:**

1. Update API URL in `timetableService.js`:
```javascript
const API_URL = 'http://localhost:YOUR_PORT/api/timetable';
```

2. Ensure CORS is enabled in your backend:
```javascript
app.use(cors({
  origin: 'http://localhost:3000', // Your frontend URL
  credentials: true
}));
```

---

## 🎯 Quick Start Checklist

### Backend:
- [ ] Models copied to `/models`
- [ ] Controllers copied to `/controllers`
- [ ] Routes registered in main app
- [ ] Auth middleware configured (if applicable)
- [ ] Server restarted

### Frontend:
- [ ] Service file copied and API_URL updated
- [ ] Components copied to `/components`
- [ ] Routes added to React Router
- [ ] Dashboard widgets integrated
- [ ] Dependencies installed (`npm install`)

### Database:
- [ ] MongoDB running
- [ ] Collections created (auto-created on first use)
- [ ] Time slots created
- [ ] Test entries created

### Testing:
- [ ] API endpoints responding
- [ ] Conflict detection working
- [ ] Widgets displaying data
- [ ] CRUD operations working

---

## 📚 Next Steps

1. **Create Time Slots** - Use TimeSlotManager component
2. **Build Schedule** - Use TimetableBuilder for each class
3. **Test Conflicts** - Try creating overlapping entries
4. **Add Holidays** - Use Holiday APIs for academic calendar
5. **Copy Schedule** - Use copy API for new academic year

---

## 🆘 Support

If you encounter issues:

1. Check browser console for errors
2. Check server logs for backend errors
3. Verify all IDs are valid MongoDB ObjectIds
4. Ensure all required fields are provided
5. Check network tab for API response details

## 📄 API Documentation Summary

### Time Slots
- `POST /api/timetable/timeslots` - Create time slot
- `GET /api/timetable/timeslots` - Get all time slots
- `GET /api/timetable/timeslots/active` - Get active time slots
- `PUT /api/timetable/timeslots/:id` - Update time slot
- `DELETE /api/timetable/timeslots/:id` - Delete time slot

### Timetable
- `POST /api/timetable/entries` - Create entry
- `PUT /api/timetable/entries/:id` - Update entry
- `DELETE /api/timetable/entries/:id` - Delete entry
- `GET /api/timetable/class/:classId/:sectionId` - Get weekly schedule
- `GET /api/timetable/today/class/:classId/:sectionId` - Get today's schedule
- `GET /api/timetable/teacher/:teacherId` - Get teacher schedule
- `GET /api/timetable/today/teacher/:teacherId` - Get teacher today
- `POST /api/timetable/entries/bulk` - Bulk create
- `POST /api/timetable/copy` - Copy timetable
- `POST /api/timetable/check-conflict` - Check conflicts

### Holidays
- `POST /api/timetable/holidays` - Create holiday
- `GET /api/timetable/holidays` - Get all holidays
- `GET /api/timetable/holidays/check/:date` - Check if date is holiday
- `PUT /api/timetable/holidays/:id` - Update holiday
- `DELETE /api/timetable/holidays/:id` - Delete holiday

---

**Version:** 1.0.0  
**Last Updated:** 2024  
**Compatible With:** MERN Stack (MongoDB, Express, React, Node.js)