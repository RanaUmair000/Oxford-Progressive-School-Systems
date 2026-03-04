import { useState, useEffect } from 'react';
import { 
  FiClock, 
  FiBook, 
  FiUsers, 
  FiMapPin,
  FiCalendar,
  FiCheckCircle
} from 'react-icons/fi';
import {
  getTodayScheduleForTeacher,
  getCurrentAcademicYear,
  getCurrentDay,
  formatTimeSlot
} from '../../services/timetableService';

const TeacherTimetableWidget = ({ teacherId = "6978bd0090c393ae0ac49f7e" }) => {
  const [schedule, setSchedule] = useState([]);
  const [currentLecture, setCurrentLecture] = useState(null);
  const [nextLecture, setNextLecture] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    if (teacherId) {
      fetchTodaySchedule();
    }

    // Update time every minute
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, [teacherId]);

  const fetchTodaySchedule = async () => {
    try {
      setLoading(true);
      const academicYear = getCurrentAcademicYear();
      
      const response = await getTodayScheduleForTeacher(teacherId, academicYear);

      setSchedule(response.data.schedule || []);
      setCurrentLecture(response.data.currentLecture);
      setNextLecture(response.data.nextLecture);
    } catch (error) {
      console.error('Failed to fetch today\'s schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentTimeString = () => {
    return currentTime.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const isCurrentLecture = (entry) => {
    if (!entry.timeSlotId) return false;
    
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    
    const [startHour, startMin] = entry.timeSlotId.startTime.split(':').map(Number);
    const [endHour, endMin] = entry.timeSlotId.endTime.split(':').map(Number);
    
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    
    return currentMinutes >= startMinutes && currentMinutes < endMinutes;
  };

  const isPastLecture = (entry) => {
    if (!entry.timeSlotId) return false;
    
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    
    const [endHour, endMin] = entry.timeSlotId.endTime.split(':').map(Number);
    const endMinutes = endHour * 60 + endMin;
    
    return currentMinutes >= endMinutes;
  };

  if (loading) {
    return (
      <div className="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="flex justify-center py-10">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
      {/* Header */}
      <div className="border-b border-stroke px-6 py-4 dark:border-strokedark bg-gradient-to-r from-purple-600 to-indigo-600">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <FiCalendar />
              My Teaching Schedule
            </h3>
            <p className="text-sm text-purple-100 mt-1">
              {getCurrentDay()} • {currentTime.toLocaleDateString('en-US', { 
                month: 'long', 
                day: 'numeric',
                year: 'numeric'
              })}
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-white">
              {getCurrentTimeString()}
            </div>
            <div className="text-xs text-purple-100">Current Time</div>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 p-6 bg-gray-50 dark:bg-meta-4 border-b border-stroke dark:border-strokedark">
        <div className="text-center">
          <div className="text-2xl font-bold text-primary">
            {schedule.length}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            Total Classes
          </div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-500">
            {schedule.filter(isPastLecture).length}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            Completed
          </div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-500">
            {schedule.filter(entry => !isPastLecture(entry) && !isCurrentLecture(entry)).length}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            Upcoming
          </div>
        </div>
      </div>

      {/* Current & Next Lecture */}
      {(currentLecture || nextLecture) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6 bg-white dark:bg-boxdark">
          {/* Current Lecture */}
          <div className={`p-4 rounded-lg border-2 ${
            currentLecture 
              ? 'bg-green-50 border-green-500 dark:bg-green-900 dark:bg-opacity-20 dark:border-green-600' 
              : 'bg-gray-100 border-gray-300 dark:bg-boxdark-2 dark:border-strokedark'
          }`}>
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-3 h-3 rounded-full ${currentLecture ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                CURRENT CLASS
              </span>
            </div>
            
            {currentLecture ? (
              <>
                <h4 className="text-xl font-bold text-black dark:text-white mb-2 flex items-center gap-2">
                  <FiBook className="text-primary" />
                  {currentLecture.subjectId?.name}
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <FiUsers size={14} />
                    <span>
                      {currentLecture.classId?.name} - {currentLecture.sectionId?.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <FiClock size={14} />
                    <span>{formatTimeSlot(currentLecture.timeSlotId)}</span>
                  </div>
                  {currentLecture.room && (
                    <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <FiMapPin size={14} />
                      <span>Room {currentLecture.room}</span>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                <p>No class in progress</p>
              </div>
            )}
          </div>

          {/* Next Lecture */}
          <div className="p-4 rounded-lg border-2 bg-blue-50 border-blue-500 dark:bg-blue-900 dark:bg-opacity-20 dark:border-blue-600">
            <div className="flex items-center gap-2 mb-3">
              <FiClock className="text-blue-600 dark:text-blue-400" size={16} />
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                NEXT CLASS
              </span>
            </div>
            
            {nextLecture ? (
              <>
                <h4 className="text-xl font-bold text-black dark:text-white mb-2 flex items-center gap-2">
                  <FiBook className="text-primary" />
                  {nextLecture.subjectId?.name}
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <FiUsers size={14} />
                    <span>
                      {nextLecture.classId?.name} - {nextLecture.sectionId?.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <FiClock size={14} />
                    <span>{formatTimeSlot(nextLecture.timeSlotId)}</span>
                  </div>
                  {nextLecture.room && (
                    <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <FiMapPin size={14} />
                      <span>Room {nextLecture.room}</span>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                <p>No more classes today</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Full Schedule */}
      <div className="p-6">
        <h4 className="text-lg font-semibold text-black dark:text-white mb-4">
          Today's Complete Schedule
        </h4>

        {schedule.length > 0 ? (
          <div className="space-y-3">
            {schedule.map((entry, index) => {
              const isCurrent = isCurrentLecture(entry);
              const isPast = isPastLecture(entry);

              return (
                <div
                  key={entry._id || index}
                  className={`p-4 rounded-lg border transition-all ${
                    isCurrent
                      ? 'bg-green-50 border-green-500 dark:bg-green-900 dark:bg-opacity-20 dark:border-green-600 shadow-md'
                      : isPast
                      ? 'bg-gray-100 border-gray-300 dark:bg-boxdark-2 dark:border-strokedark opacity-60'
                      : 'bg-white border-stroke dark:bg-meta-4 dark:border-strokedark hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h5 className="font-bold text-black dark:text-white">
                          {entry.subjectId?.name}
                        </h5>
                        {isCurrent && (
                          <span className="px-2 py-0.5 bg-green-500 text-white text-xs font-semibold rounded-full animate-pulse">
                            IN PROGRESS
                          </span>
                        )}
                        {entry.timeSlotId?.label && (
                          <span className="px-2 py-0.5 bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 text-xs rounded">
                            {entry.timeSlotId.label}
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <FiUsers size={12} />
                          <span>
                            {entry.classId?.name} - {entry.sectionId?.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FiClock size={12} />
                          <span>{formatTimeSlot(entry.timeSlotId)}</span>
                        </div>
                        {entry.room && (
                          <div className="flex items-center gap-1">
                            <FiMapPin size={12} />
                            <span>Room {entry.room}</span>
                          </div>
                        )}
                      </div>

                      {entry.notes && (
                        <div className="mt-2 text-sm text-gray-500 dark:text-gray-400 italic">
                          Note: {entry.notes}
                        </div>
                      )}
                    </div>

                    {isPast && (
                      <FiCheckCircle className="text-green-500" size={20} />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-10 text-gray-500 dark:text-gray-400">
            <FiCalendar size={48} className="mx-auto mb-4 opacity-50" />
            <p>No classes scheduled for today</p>
            <p className="text-sm mt-2">Enjoy your day off!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherTimetableWidget;