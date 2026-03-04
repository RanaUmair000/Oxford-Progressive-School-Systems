# Timetable Module - Usage Examples

## 🎯 Complete Workflow Examples

### Scenario 1: Setting Up Timetable for a New Academic Year

#### Step 1: Create Time Slots

```javascript
// Using the API
const timeSlots = [
  { startTime: "08:00", endTime: "08:45", order: 1, label: "Period 1" },
  { startTime: "08:45", endTime: "09:30", order: 2, label: "Period 2" },
  { startTime: "09:30", endTime: "09:45", order: 3, label: "Short Break", isBreak: true },
  { startTime: "09:45", endTime: "10:30", order: 4, label: "Period 3" },
  { startTime: "10:30", endTime: "11:15", order: 5, label: "Period 4" },
  { startTime: "11:15", endTime: "12:00", order: 6, label: "Lunch Break", isBreak: true },
  { startTime: "12:00", endTime: "12:45", order: 7, label: "Period 5" },
  { startTime: "12:45", endTime: "13:30", order: 8, label: "Period 6" }
];

// Bulk create
await axios.post('http://localhost:5000/api/timetable/timeslots/bulk', { timeSlots });
```

#### Step 2: Create Timetable Entries

```javascript
// Example: Monday schedule for Class 10-A

const mondaySchedule = [
  {
    classId: "60f7b3b3b3b3b3b3b3b3b3b3",
    sectionId: "60f7b3b3b3b3b3b3b3b3b3b4",
    day: "Monday",
    timeSlotId: "60f7b3b3b3b3b3b3b3b3b3b5", // Period 1
    subjectId: "60f7b3b3b3b3b3b3b3b3b3b6",  // Mathematics
    teacherId: "60f7b3b3b3b3b3b3b3b3b3b7",  // Mr. Smith
    room: "101",
    academicYear: "2024-2025"
  },
  {
    classId: "60f7b3b3b3b3b3b3b3b3b3b3",
    sectionId: "60f7b3b3b3b3b3b3b3b3b3b4",
    day: "Monday",
    timeSlotId: "60f7b3b3b3b3b3b3b3b3b3b8", // Period 2
    subjectId: "60f7b3b3b3b3b3b3b3b3b3b9",  // English
    teacherId: "60f7b3b3b3b3b3b3b3b3b3ba",  // Ms. Johnson
    room: "102",
    academicYear: "2024-2025"
  }
  // ... more entries
];

// Bulk create
await axios.post('http://localhost:5000/api/timetable/entries/bulk', {
  entries: mondaySchedule,
  academicYear: "2024-2025"
});
```

---

### Scenario 2: Copy Timetable from Previous Year

```javascript
// Copy entire timetable from 2023-2024 to 2024-2025
const response = await axios.post('http://localhost:5000/api/timetable/copy', {
  sourceAcademicYear: "2023-2024",
  targetAcademicYear: "2024-2025"
});

console.log(`Copied ${response.data.data.created.length} entries`);
console.log(`Conflicts: ${response.data.data.conflicts.length}`);

// Copy only for a specific class
const responseClass = await axios.post('http://localhost:5000/api/timetable/copy', {
  sourceAcademicYear: "2023-2024",
  targetAcademicYear: "2024-2025",
  classId: "60f7b3b3b3b3b3b3b3b3b3b3",
  sectionId: "60f7b3b3b3b3b3b3b3b3b3b4"
});
```

---

### Scenario 3: React Component Integration

#### Student Dashboard Integration

```jsx
// StudentDashboard.jsx
import React from 'react';
import StudentTimetableWidget from './components/Timetable/StudentTimetableWidget';

const StudentDashboard = () => {
  // Get student data from your auth context or props
  const student = useAuthContext(); // or however you get current student
  
  return (
    <div className="dashboard">
      <h1>Welcome, {student.firstName}!</h1>
      
      {/* Timetable Widget */}
      <StudentTimetableWidget 
        studentData={{
          classId: student.classId,
          sectionId: student.sectionId
        }}
      />
      
      {/* Other dashboard widgets */}
    </div>
  );
};
```

#### Teacher Dashboard Integration

```jsx
// TeacherDashboard.jsx
import React from 'react';
import TeacherTimetableWidget from './components/Timetable/TeacherTimetableWidget';

const TeacherDashboard = () => {
  const teacher = useAuthContext();
  
  return (
    <div className="dashboard">
      <h1>Welcome, {teacher.firstName}!</h1>
      
      {/* Timetable Widget */}
      <TeacherTimetableWidget teacherId={teacher._id} />
      
      {/* Other dashboard widgets */}
    </div>
  );
};
```

#### Admin Timetable Management

```jsx
// TimetableManagement.jsx
import React, { useState } from 'react';
import { Tabs, TabList, Tab, TabPanel } from 'react-tabs';
import TimeSlotManager from './components/Timetable/TimeSlotManager';
import TimetableBuilder from './components/Timetable/TimetableBuilder';

const TimetableManagement = () => {
  return (
    <div>
      <h1>Timetable Management</h1>
      
      <Tabs>
        <TabList>
          <Tab>Time Slots</Tab>
          <Tab>Timetable Builder</Tab>
          <Tab>Holidays</Tab>
        </TabList>
        
        <TabPanel>
          <TimeSlotManager />
        </TabPanel>
        
        <TabPanel>
          <TimetableBuilder />
        </TabPanel>
        
        <TabPanel>
          {/* Holiday component here */}
        </TabPanel>
      </Tabs>
    </div>
  );
};
```

---

### Scenario 4: Mobile App Integration

```javascript
// React Native example
import { getTodayScheduleForClass } from './services/timetableService';

const StudentScheduleScreen = () => {
  const [schedule, setSchedule] = useState([]);
  const { student } = useAuth();

  useEffect(() => {
    loadSchedule();
  }, []);

  const loadSchedule = async () => {
    try {
      const response = await getTodayScheduleForClass(
        student.classId,
        student.sectionId,
        getCurrentAcademicYear()
      );
      
      setSchedule(response.data.schedule);
    } catch (error) {
      Alert.alert('Error', 'Failed to load schedule');
    }
  };

  return (
    <ScrollView>
      <Text style={styles.header}>Today's Schedule</Text>
      
      {schedule.map((entry, index) => (
        <View key={index} style={styles.card}>
          <Text style={styles.subject}>{entry.subjectId.name}</Text>
          <Text style={styles.time}>
            {entry.timeSlotId.startTime} - {entry.timeSlotId.endTime}
          </Text>
          <Text style={styles.teacher}>
            {entry.teacherId.firstName} {entry.teacherId.lastName}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
};
```

---

### Scenario 5: Conflict Prevention Example

```javascript
// Check for conflicts before creating entry
const checkAndCreate = async (entryData) => {
  try {
    // First, check for conflicts
    const conflictCheck = await axios.post(
      'http://localhost:5000/api/timetable/check-conflict',
      {
        teacherId: entryData.teacherId,
        classId: entryData.classId,
        sectionId: entryData.sectionId,
        day: entryData.day,
        timeSlotId: entryData.timeSlotId,
        academicYear: entryData.academicYear
      }
    );

    if (conflictCheck.data.hasConflict) {
      // Handle conflict
      if (conflictCheck.data.conflicts.teacherConflict) {
        alert(
          `Teacher conflict: This teacher is already teaching ` +
          `${conflictCheck.data.conflicts.teacherConflict.subjectId.name} ` +
          `to ${conflictCheck.data.conflicts.teacherConflict.classId.name}`
        );
        return;
      }

      if (conflictCheck.data.conflicts.classConflict) {
        alert(
          `Class conflict: This class already has ` +
          `${conflictCheck.data.conflicts.classConflict.subjectId.name} ` +
          `at this time`
        );
        return;
      }
    }

    // No conflicts, proceed to create
    const response = await axios.post(
      'http://localhost:5000/api/timetable/entries',
      entryData
    );

    alert('Timetable entry created successfully!');
    
  } catch (error) {
    console.error('Error:', error);
    alert('Failed to create entry');
  }
};
```

---

### Scenario 6: Holiday Management

```javascript
// Create holidays for the year
const holidays2024 = [
  {
    name: "Independence Day",
    date: new Date("2024-08-14"),
    type: "National",
    description: "Pakistan Independence Day",
    academicYear: "2024-2025"
  },
  {
    name: "Eid ul Fitr",
    date: new Date("2024-04-10"),
    type: "Religious",
    description: "Islamic festival",
    academicYear: "2024-2025"
  },
  {
    name: "Winter Break",
    date: new Date("2024-12-25"),
    type: "Academic",
    description: "Winter vacation starts",
    academicYear: "2024-2025"
  }
];

// Bulk create holidays
await axios.post('http://localhost:5000/api/timetable/holidays/bulk', {
  holidays: holidays2024
});

// Check if today is a holiday
const checkToday = async () => {
  const today = new Date().toISOString().split('T')[0];
  const response = await axios.get(
    `http://localhost:5000/api/timetable/holidays/check/${today}`,
    { params: { academicYear: "2024-2025" } }
  );
  
  if (response.data.isHoliday) {
    console.log(`Today is ${response.data.holiday.name}!`);
  }
};
```

---

### Scenario 7: Weekly View Component

```jsx
// WeeklyTimetableView.jsx
import React, { useState, useEffect } from 'react';
import { getWeeklyTimetableByClass } from './services/timetableService';

const WeeklyTimetableView = ({ classId, sectionId }) => {
  const [schedule, setSchedule] = useState({});
  const [timeSlots, setTimeSlots] = useState([]);
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  useEffect(() => {
    loadSchedule();
  }, [classId, sectionId]);

  const loadSchedule = async () => {
    const response = await getWeeklyTimetableByClass(
      classId,
      sectionId,
      getCurrentAcademicYear()
    );
    
    setSchedule(response.data.schedule);
    // Extract unique time slots
    const slots = response.data.raw.map(entry => entry.timeSlotId);
    setTimeSlots([...new Map(slots.map(s => [s._id, s])).values()]);
  };

  return (
    <div className="timetable-grid">
      <table>
        <thead>
          <tr>
            <th>Time</th>
            {days.map(day => <th key={day}>{day}</th>)}
          </tr>
        </thead>
        <tbody>
          {timeSlots.map(slot => (
            <tr key={slot._id}>
              <td>
                {slot.startTime} - {slot.endTime}
                <br />
                <small>{slot.label}</small>
              </td>
              {days.map(day => {
                const entry = schedule[day]?.find(
                  e => e.timeSlotId._id === slot._id
                );
                return (
                  <td key={`${day}-${slot._id}`}>
                    {entry ? (
                      <div className="period-card">
                        <strong>{entry.subjectId.name}</strong>
                        <br />
                        <small>
                          {entry.teacherId.firstName} {entry.teacherId.lastName}
                        </small>
                        {entry.room && <br />}
                        {entry.room && <small>Room: {entry.room}</small>}
                      </div>
                    ) : (
                      <div className="empty-period">-</div>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
```

---

### Scenario 8: Export Timetable to PDF/Excel

```javascript
// Export weekly timetable
const exportTimetable = async (classId, sectionId, format = 'pdf') => {
  try {
    const response = await getWeeklyTimetableByClass(
      classId,
      sectionId,
      getCurrentAcademicYear()
    );

    if (format === 'pdf') {
      // Use jsPDF or similar library
      const doc = new jsPDF();
      doc.text('Weekly Timetable', 10, 10);
      // ... add timetable content
      doc.save('timetable.pdf');
    } else if (format === 'excel') {
      // Use xlsx library
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(response.data.raw);
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Timetable');
      XLSX.writeFile(workbook, 'timetable.xlsx');
    }
  } catch (error) {
    console.error('Export failed:', error);
  }
};
```

---

### Scenario 9: Real-time Updates with Socket.io

```javascript
// Server side (optional enhancement)
io.on('connection', (socket) => {
  socket.on('timetable:updated', async (data) => {
    // Broadcast to all connected clients
    io.emit('timetable:refresh', {
      classId: data.classId,
      sectionId: data.sectionId
    });
  });
});

// Client side
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

socket.on('timetable:refresh', (data) => {
  if (data.classId === currentClass && data.sectionId === currentSection) {
    // Refresh timetable
    fetchTimetable();
  }
});
```

---

### Scenario 10: Notifications for Upcoming Classes

```javascript
// Send notification 5 minutes before class
const checkUpcomingClass = async (studentId) => {
  const response = await getTodayScheduleForClass(
    student.classId,
    student.sectionId,
    getCurrentAcademicYear()
  );

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  response.data.schedule.forEach(entry => {
    const [startHour, startMin] = entry.timeSlotId.startTime.split(':').map(Number);
    const startMinutes = startHour * 60 + startMin;
    
    // Check if class starts in 5 minutes
    if (startMinutes - currentMinutes === 5) {
      sendNotification({
        title: 'Upcoming Class',
        body: `${entry.subjectId.name} starts in 5 minutes!`,
        data: {
          room: entry.room,
          teacher: `${entry.teacherId.firstName} ${entry.teacherId.lastName}`
        }
      });
    }
  });
};

// Run every minute
setInterval(() => checkUpcomingClass(currentStudent._id), 60000);
```

---

## 📊 Sample Data Sets

### Complete Class 10-A Monday Schedule

```json
{
  "academicYear": "2024-2025",
  "entries": [
    {
      "classId": "class10_id",
      "sectionId": "sectionA_id",
      "day": "Monday",
      "timeSlotId": "period1_id",
      "subjectId": "mathematics_id",
      "teacherId": "mrSmith_id",
      "room": "101"
    },
    {
      "classId": "class10_id",
      "sectionId": "sectionA_id",
      "day": "Monday",
      "timeSlotId": "period2_id",
      "subjectId": "english_id",
      "teacherId": "msJohnson_id",
      "room": "102"
    },
    {
      "classId": "class10_id",
      "sectionId": "sectionA_id",
      "day": "Monday",
      "timeSlotId": "period4_id",
      "subjectId": "physics_id",
      "teacherId": "drBrown_id",
      "room": "Lab-1"
    },
    {
      "classId": "class10_id",
      "sectionId": "sectionA_id",
      "day": "Monday",
      "timeSlotId": "period5_id",
      "subjectId": "chemistry_id",
      "teacherId": "msWilson_id",
      "room": "Lab-2"
    },
    {
      "classId": "class10_id",
      "sectionId": "sectionA_id",
      "day": "Monday",
      "timeSlotId": "period7_id",
      "subjectId": "computerScience_id",
      "teacherId": "mrDavis_id",
      "room": "CompLab"
    },
    {
      "classId": "class10_id",
      "sectionId": "sectionA_id",
      "day": "Monday",
      "timeSlotId": "period8_id",
      "subjectId": "urdu_id",
      "teacherId": "msKhan_id",
      "room": "103"
    }
  ]
}
```

---

## 🎓 Best Practices

1. **Always use academic year** - Prevent mixing schedules from different years
2. **Check conflicts** - Use the conflict check API before bulk operations
3. **Soft delete** - Mark entries as inactive instead of deleting
4. **Index optimization** - Ensure proper indexes for performance
5. **Error handling** - Always wrap API calls in try-catch
6. **Loading states** - Show loading indicators for better UX
7. **Real-time updates** - Consider WebSocket for live updates
8. **Caching** - Cache timetable data to reduce API calls
9. **Validation** - Validate data on both frontend and backend
10. **Testing** - Test conflict scenarios thoroughly

---

This comprehensive usage guide should help you implement any timetable-related feature in your school management system!