# 📡 Timetable Module - Complete API Documentation

## Base URL
```
http://localhost:5000/api/timetable
```

---

## 🔐 Authentication

Most endpoints require authentication. Include JWT token in headers:

```javascript
headers: {
  'Authorization': 'Bearer YOUR_JWT_TOKEN',
  'Content-Type': 'application/json'
}
```

**Role Requirements:**
- **Admin**: Full access to all endpoints
- **Teacher**: Read access to own schedule
- **Student**: Read access to class schedule

---

## 📚 Table of Contents

1. [Time Slot APIs](#time-slot-apis)
2. [Timetable APIs](#timetable-apis)
3. [Holiday APIs](#holiday-apis)
4. [Error Responses](#error-responses)
5. [Rate Limiting](#rate-limiting)

---

## ⏰ Time Slot APIs

### Create Time Slot

Create a new time period for the school day.

**Endpoint:** `POST /timeslots`  
**Auth:** Admin only  
**Request Body:**

```json
{
  "startTime": "08:00",
  "endTime": "08:45",
  "order": 1,
  "label": "Period 1",
  "isBreak": false
}
```

**Field Validation:**
- `startTime`: Required, format "HH:MM" (24-hour)
- `endTime`: Required, format "HH:MM", must be after startTime
- `order`: Required, positive integer, unique
- `label`: Optional, string
- `isBreak`: Optional, boolean, default false

**Success Response (201):**
```json
{
  "success": true,
  "message": "Time slot created successfully",
  "data": {
    "_id": "60f7b3b3b3b3b3b3b3b3b3b5",
    "startTime": "08:00",
    "endTime": "08:45",
    "order": 1,
    "label": "Period 1",
    "isBreak": false,
    "duration": 45,
    "isActive": true,
    "createdAt": "2024-01-15T08:00:00.000Z"
  }
}
```

**Error Responses:**

400 - Validation Error
```json
{
  "success": false,
  "message": "End time must be after start time"
}
```

400 - Overlap Error
```json
{
  "success": false,
  "message": "Time slot overlaps with existing slot: 08:00 - 08:45",
  "conflict": { /* conflicting slot */ }
}
```

400 - Duplicate Order
```json
{
  "success": false,
  "message": "Order 1 is already assigned to time slot: 08:00 - 08:45"
}
```

---

### Get All Time Slots

Retrieve all time slots.

**Endpoint:** `GET /timeslots`  
**Auth:** All authenticated users  
**Query Parameters:**
- `isActive` (optional): "true" or "false"

**Request:**
```
GET /timeslots?isActive=true
```

**Success Response (200):**
```json
{
  "success": true,
  "count": 8,
  "data": [
    {
      "_id": "...",
      "startTime": "08:00",
      "endTime": "08:45",
      "order": 1,
      "label": "Period 1",
      "duration": 45,
      "isBreak": false
    },
    // ... more slots
  ]
}
```

---

### Get Active Time Slots

Get only active time slots, sorted by order.

**Endpoint:** `GET /timeslots/active`  
**Auth:** All authenticated users

**Success Response (200):**
```json
{
  "success": true,
  "count": 6,
  "data": [ /* active slots only */ ]
}
```

---

### Update Time Slot

Update an existing time slot.

**Endpoint:** `PUT /timeslots/:id`  
**Auth:** Admin only  
**Request Body:** (all fields optional)

```json
{
  "startTime": "08:00",
  "endTime": "09:00",
  "order": 1,
  "label": "Extended Period 1",
  "isBreak": false,
  "isActive": true
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Time slot updated successfully",
  "data": { /* updated slot */ }
}
```

---

### Delete Time Slot (Soft Delete)

Mark time slot as inactive.

**Endpoint:** `DELETE /timeslots/:id`  
**Auth:** Admin only

**Success Response (200):**
```json
{
  "success": true,
  "message": "Time slot deleted successfully"
}
```

---

### Bulk Create Time Slots

Create multiple time slots at once.

**Endpoint:** `POST /timeslots/bulk`  
**Auth:** Admin only  
**Request Body:**

```json
{
  "timeSlots": [
    {
      "startTime": "08:00",
      "endTime": "08:45",
      "order": 1,
      "label": "Period 1"
    },
    {
      "startTime": "08:45",
      "endTime": "09:30",
      "order": 2,
      "label": "Period 2"
    }
  ]
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Created 2 time slots",
  "data": {
    "created": [ /* created slots */ ],
    "errors": [ /* any errors */ ]
  }
}
```

---

## 📅 Timetable APIs

### Create Timetable Entry

Create a single timetable entry.

**Endpoint:** `POST /entries`  
**Auth:** Admin only  
**Request Body:**

```json
{
  "classId": "60f7b3b3b3b3b3b3b3b3b3b3",
  "sectionId": "60f7b3b3b3b3b3b3b3b3b3b4",
  "day": "Monday",
  "timeSlotId": "60f7b3b3b3b3b3b3b3b3b3b5",
  "subjectId": "60f7b3b3b3b3b3b3b3b3b3b6",
  "teacherId": "60f7b3b3b3b3b3b3b3b3b3b7",
  "room": "101",
  "academicYear": "2024-2025",
  "semester": "Fall",
  "notes": "Bring calculator"
}
```

**Field Validation:**
- All fields required except `room`, `semester`, `notes`
- `day`: Must be one of: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday
- `academicYear`: Format "YYYY-YYYY"

**Success Response (201):**
```json
{
  "success": true,
  "message": "Timetable entry created successfully",
  "data": {
    "_id": "...",
    "classId": { "_id": "...", "name": "Class 10" },
    "sectionId": { "_id": "...", "name": "A" },
    "day": "Monday",
    "timeSlotId": {
      "startTime": "08:00",
      "endTime": "08:45",
      "label": "Period 1"
    },
    "subjectId": { "_id": "...", "name": "Mathematics" },
    "teacherId": {
      "_id": "...",
      "firstName": "John",
      "lastName": "Smith"
    },
    "room": "101",
    "academicYear": "2024-2025"
  }
}
```

**Error Responses:**

409 - Teacher Conflict
```json
{
  "success": false,
  "message": "Teacher conflict: John Smith is already teaching Physics to Class 9-B at 08:00-08:45 on Monday",
  "conflictType": "TeacherConflict"
}
```

409 - Class Conflict
```json
{
  "success": false,
  "message": "Class conflict: This class already has English with Jane Doe at 08:00-08:45 on Monday",
  "conflictType": "ClassConflict"
}
```

---

### Check Conflict

Check for conflicts before creating entry.

**Endpoint:** `POST /check-conflict`  
**Auth:** Admin only  
**Request Body:**

```json
{
  "teacherId": "60f7b3b3b3b3b3b3b3b3b3b7",
  "classId": "60f7b3b3b3b3b3b3b3b3b3b3",
  "sectionId": "60f7b3b3b3b3b3b3b3b3b3b4",
  "day": "Monday",
  "timeSlotId": "60f7b3b3b3b3b3b3b3b3b3b5",
  "academicYear": "2024-2025"
}
```

**Success Response (200):**

No Conflicts:
```json
{
  "success": true,
  "hasConflict": false,
  "conflicts": {
    "teacherConflict": null,
    "classConflict": null
  }
}
```

With Conflicts:
```json
{
  "success": true,
  "hasConflict": true,
  "conflicts": {
    "teacherConflict": {
      /* conflicting entry details */
    },
    "classConflict": null
  }
}
```

---

### Get Weekly Timetable by Class

Get complete week schedule for a class.

**Endpoint:** `GET /class/:classId/:sectionId`  
**Auth:** All authenticated users  
**Query Parameters:**
- `academicYear` (required): "2024-2025"

**Request:**
```
GET /class/60f7b3b3b3b3b3b3b3b3b3b3/60f7b3b3b3b3b3b3b3b3b3b4?academicYear=2024-2025
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "schedule": {
      "Monday": [
        {
          "_id": "...",
          "day": "Monday",
          "timeSlotId": { "startTime": "08:00", "endTime": "08:45", "order": 1 },
          "subjectId": { "name": "Mathematics" },
          "teacherId": { "firstName": "John", "lastName": "Smith" },
          "room": "101"
        },
        // ... more Monday entries
      ],
      "Tuesday": [ /* ... */ ],
      // ... other days
    },
    "raw": [ /* all entries as array */ ]
  }
}
```

---

### Get Today's Schedule for Class

Get today's schedule with current and next period.

**Endpoint:** `GET /today/class/:classId/:sectionId`  
**Auth:** All authenticated users  
**Query Parameters:**
- `academicYear` (required): "2024-2025"

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "schedule": [
      {
        "_id": "...",
        "timeSlotId": { "startTime": "08:00", "endTime": "08:45" },
        "subjectId": { "name": "Mathematics" },
        "teacherId": { "firstName": "John", "lastName": "Smith" }
      },
      // ... more periods
    ],
    "currentPeriod": {
      /* currently ongoing class */
    },
    "nextPeriod": {
      /* upcoming class */
    }
  }
}
```

---

### Get Teacher Schedule

Get teacher's weekly or daily schedule.

**Endpoint:** `GET /teacher/:teacherId`  
**Auth:** Admin, Teacher (own schedule only)  
**Query Parameters:**
- `academicYear` (required): "2024-2025"
- `day` (optional): "Monday"

**Request:**
```
GET /teacher/60f7b3b3b3b3b3b3b3b3b3b7?academicYear=2024-2025&day=Monday
```

**Success Response (200):**

Weekly (no day parameter):
```json
{
  "success": true,
  "data": {
    "schedule": {
      "Monday": [ /* classes */ ],
      "Tuesday": [ /* classes */ ],
      // ... other days
    },
    "raw": [ /* all entries */ ]
  }
}
```

Daily (with day parameter):
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "classId": { "name": "Class 10" },
      "sectionId": { "name": "A" },
      "subjectId": { "name": "Mathematics" },
      "timeSlotId": { "startTime": "08:00", "endTime": "08:45" }
    }
  ]
}
```

---

### Get Today's Schedule for Teacher

Get teacher's schedule for today.

**Endpoint:** `GET /today/teacher/:teacherId`  
**Auth:** Admin, Teacher (own schedule only)  
**Query Parameters:**
- `academicYear` (required): "2024-2025"

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "schedule": [ /* today's classes */ ],
    "currentLecture": {
      /* currently teaching */
    },
    "nextLecture": {
      /* upcoming class */
    }
  }
}
```

---

### Update Timetable Entry

Update an existing entry.

**Endpoint:** `PUT /entries/:id`  
**Auth:** Admin only  
**Request Body:** (all fields optional)

```json
{
  "subjectId": "60f7b3b3b3b3b3b3b3b3b3b6",
  "teacherId": "60f7b3b3b3b3b3b3b3b3b3b7",
  "room": "102",
  "notes": "Updated notes",
  "isActive": true
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Timetable entry updated successfully",
  "data": { /* updated entry */ }
}
```

**Note:** Updating will re-validate conflicts.

---

### Delete Timetable Entry

Permanently delete an entry.

**Endpoint:** `DELETE /entries/:id`  
**Auth:** Admin only

**Success Response (200):**
```json
{
  "success": true,
  "message": "Timetable entry deleted successfully"
}
```

---

### Bulk Create Timetable

Create multiple entries at once.

**Endpoint:** `POST /entries/bulk`  
**Auth:** Admin only  
**Request Body:**

```json
{
  "academicYear": "2024-2025",
  "entries": [
    {
      "classId": "...",
      "sectionId": "...",
      "day": "Monday",
      "timeSlotId": "...",
      "subjectId": "...",
      "teacherId": "...",
      "room": "101"
    },
    // ... more entries
  ]
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Created 5 entries. 2 conflicts. 0 errors.",
  "data": {
    "created": [ /* successfully created */ ],
    "conflicts": [
      {
        "entry": { /* conflicting entry */ },
        "reason": "Teacher already has a class at this time",
        "conflict": { /* existing entry */ }
      }
    ],
    "errors": [ /* validation errors */ ]
  }
}
```

---

### Copy Timetable

Copy schedule from one academic year to another.

**Endpoint:** `POST /copy`  
**Auth:** Admin only  
**Request Body:**

```json
{
  "sourceAcademicYear": "2023-2024",
  "targetAcademicYear": "2024-2025",
  "classId": "optional",
  "sectionId": "optional"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Copied timetable successfully. Created 48 entries.",
  "data": {
    "created": [ /* new entries */ ],
    "conflicts": [ /* any conflicts */ ],
    "errors": [ /* any errors */ ]
  }
}
```

---

### Get All Timetable Entries

Get all entries with optional filters.

**Endpoint:** `GET /entries`  
**Auth:** Admin only  
**Query Parameters:**
- `academicYear` (optional)
- `classId` (optional)
- `sectionId` (optional)
- `teacherId` (optional)
- `day` (optional)
- `subjectId` (optional)

**Request:**
```
GET /entries?academicYear=2024-2025&classId=...&day=Monday
```

**Success Response (200):**
```json
{
  "success": true,
  "count": 15,
  "data": [ /* filtered entries */ ]
}
```

---

## 🎉 Holiday APIs

### Create Holiday

Add a holiday to the academic calendar.

**Endpoint:** `POST /holidays`  
**Auth:** Admin only  
**Request Body:**

```json
{
  "name": "Independence Day",
  "date": "2024-08-14",
  "type": "National",
  "description": "Pakistan Independence Day",
  "academicYear": "2024-2025"
}
```

**Field Validation:**
- `name`: Required
- `date`: Required, ISO date format
- `type`: Optional, one of: "National", "Religious", "Academic", "Other"
- `academicYear`: Required, format "YYYY-YYYY"

**Success Response (201):**
```json
{
  "success": true,
  "message": "Holiday created successfully",
  "data": {
    "_id": "...",
    "name": "Independence Day",
    "date": "2024-08-14T00:00:00.000Z",
    "type": "National",
    "academicYear": "2024-2025"
  }
}
```

---

### Get All Holidays

Retrieve holidays with filters.

**Endpoint:** `GET /holidays`  
**Auth:** All authenticated users  
**Query Parameters:**
- `academicYear` (optional)
- `type` (optional)
- `upcoming` (optional): "true" for upcoming holidays only

**Request:**
```
GET /holidays?academicYear=2024-2025&upcoming=true
```

**Success Response (200):**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "_id": "...",
      "name": "Independence Day",
      "date": "2024-08-14T00:00:00.000Z",
      "type": "National"
    }
  ]
}
```

---

### Check if Date is Holiday

Check if a specific date is a holiday.

**Endpoint:** `GET /holidays/check/:date`  
**Auth:** All authenticated users  
**Query Parameters:**
- `academicYear` (required)

**Request:**
```
GET /holidays/check/2024-08-14?academicYear=2024-2025
```

**Success Response (200):**

Is Holiday:
```json
{
  "success": true,
  "isHoliday": true,
  "holiday": {
    "_id": "...",
    "name": "Independence Day",
    "date": "2024-08-14T00:00:00.000Z",
    "type": "National"
  }
}
```

Not Holiday:
```json
{
  "success": true,
  "isHoliday": false,
  "holiday": null
}
```

---

### Update Holiday

Update holiday details.

**Endpoint:** `PUT /holidays/:id`  
**Auth:** Admin only  
**Request Body:** (all fields optional)

```json
{
  "name": "Updated Holiday Name",
  "date": "2024-08-15",
  "type": "Academic",
  "description": "Updated description"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Holiday updated successfully",
  "data": { /* updated holiday */ }
}
```

---

### Delete Holiday

Remove a holiday.

**Endpoint:** `DELETE /holidays/:id`  
**Auth:** Admin only

**Success Response (200):**
```json
{
  "success": true,
  "message": "Holiday deleted successfully"
}
```

---

### Bulk Create Holidays

Create multiple holidays at once.

**Endpoint:** `POST /holidays/bulk`  
**Auth:** Admin only  
**Request Body:**

```json
{
  "holidays": [
    {
      "name": "Eid ul Fitr",
      "date": "2024-04-10",
      "type": "Religious",
      "academicYear": "2024-2025"
    },
    {
      "name": "Eid ul Adha",
      "date": "2024-06-17",
      "type": "Religious",
      "academicYear": "2024-2025"
    }
  ]
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Created 2 holidays",
  "data": [ /* created holidays */ ]
}
```

---

## ❌ Error Responses

### Standard Error Format

All error responses follow this format:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Optional error details"
}
```

### Common HTTP Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | Success | Resource retrieved |
| 201 | Created | Resource created |
| 400 | Bad Request | Invalid input |
| 401 | Unauthorized | Missing/invalid token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate/conflict |
| 500 | Server Error | Internal error |

### Validation Errors

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "startTime": "Invalid time format. Use HH:MM (24-hour)",
    "order": "Order must be at least 1"
  }
}
```

---

## ⚡ Rate Limiting

Current limits:
- **General endpoints**: 100 requests per 15 minutes
- **Bulk operations**: 10 requests per hour
- **Create/Update**: 60 requests per minute

Exceeded limit response:
```json
{
  "success": false,
  "message": "Too many requests, please try again later.",
  "retryAfter": 900
}
```

---

## 📝 Notes

1. All dates are in UTC format
2. Times use 24-hour format (HH:MM)
3. ObjectIds must be valid MongoDB ObjectIds
4. Academic year format must be "YYYY-YYYY"
5. Populated fields are automatically included in responses
6. All list endpoints support pagination (to be implemented)

---

## 🧪 Testing with cURL

### Create Time Slot
```bash
curl -X POST http://localhost:5000/api/timetable/timeslots \
  -H "Content-Type: application/json" \
  -d '{
    "startTime": "08:00",
    "endTime": "08:45",
    "order": 1,
    "label": "Period 1"
  }'
```

### Get Today's Schedule
```bash
curl -X GET "http://localhost:5000/api/timetable/today/class/CLASS_ID/SECTION_ID?academicYear=2024-2025"
```

### Check Conflict
```bash
curl -X POST http://localhost:5000/api/timetable/check-conflict \
  -H "Content-Type: application/json" \
  -d '{
    "teacherId": "TEACHER_ID",
    "classId": "CLASS_ID",
    "sectionId": "SECTION_ID",
    "day": "Monday",
    "timeSlotId": "SLOT_ID",
    "academicYear": "2024-2025"
  }'
```

---

**API Version**: 1.0  
**Last Updated**: 2024  
**Base URL**: `/api/timetable`