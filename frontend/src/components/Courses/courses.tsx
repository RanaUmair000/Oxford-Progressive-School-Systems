import { FiEdit, FiTrash2 } from 'react-icons/fi';
import { useState, useMemo } from 'react';
import { FaCheck, FaTimes } from "react-icons/fa";
import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL;

import Modal from '../Modal/modal';
import CourseModal from './courseModal';

const Courses = ({ courses, toggleStatus }) => {
  const [open, setOpen] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleDelete = async (courseId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this course?"
    );

    if (!confirmDelete) return;

    try {
      await axios.delete(`${apiUrl}/api/courses/${courseId}`);
      alert("Course deleted successfully");
      window.location.reload();
    } catch (error) {
      alert(error.response?.data?.message || "Delete failed");
    }
  };

  // 🔎 Search filter logic
  const filteredCourses = useMemo(() => {
    if (!searchTerm) return courses;

    return courses.filter(course =>
      course.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [courses, searchTerm]);

  return (
    <>
      <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
        
        {/* Header Section */}
        <div className='add-stu-flex mb-4 flex justify-between items-center'>
          <h4 className="text-xl font-semibold text-black dark:text-white">
            Courses
          </h4>

          <div className="flex gap-3">
            {/* 🔎 Search Input */}
            <input
              type="text"
              style={{height: '100%', padding: "10px", border: '1px solid #717171'}}
              placeholder="Search course by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary dark:bg-boxdark dark:text-white"
            />

            <button
              onClick={() => {
                setSelectedCourseId(null);
                setOpen(true);
              }}
              className="flex justify-center rounded bg-primary px-4 py-2 font-medium text-gray hover:bg-opacity-90"
            >
              + New Course
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-stroke dark:divide-strokedark">
            <thead className="bg-gray-2 dark:bg-meta-4">
              <tr>
                <th className="p-2.5 text-left text-sm font-medium uppercase xsm:text-base">
                  Name
                </th>
                <th className="p-2.5 text-center text-sm font-medium uppercase xsm:text-base">
                  Type
                </th>
                <th className="p-2.5 text-center text-sm font-medium uppercase xsm:text-base">
                  Added
                </th>
                <th className="p-2.5 text-center text-sm font-medium uppercase xsm:text-base">
                  Status
                </th>
                <th className="hidden p-2.5 text-center sm:table-cell text-sm font-medium uppercase xsm:text-base">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-stroke dark:divide-strokedark">
              {filteredCourses && filteredCourses.length > 0 ? (
                filteredCourses.map((course) => (
                  <tr key={course._id} className="hover:bg-gray-100 dark:hover:bg-meta-3">
                    <td className="flex items-center gap-3 p-2.5">
                      <span className="text-black dark:text-white">
                        {course.name}
                      </span>
                    </td>

                    <td className="text-center p-2.5 text-black dark:text-white">
                      {course.type}
                    </td>

                    <td className="text-center p-2.5 text-black dark:text-white">
                      {new Date(course.createdAt).toLocaleDateString()}
                    </td>

                    <td className="hidden text-center p-2.5 text-black dark:text-white sm:table-cell">
                      {course.status}
                    </td>

                    <td className="hidden text-center p-2.5 sm:table-cell">
                      <button
                        onClick={() => toggleStatus(course._id, course.status)}
                        className={`mr-2 rounded px-3 py-[6px] text-white 
                          ${course.status !== "Active" ? "bg-green-500" : "bg-red-500"}
                        `}
                      >
                        {course.status !== "Active" ? <FaCheck /> : <FaTimes />}
                      </button>

                      <button
                        className='mr-2 rounded bg-blue-500 px-3 py-1 text-white hover:bg-blue-600'
                        onClick={() => {
                          setSelectedCourseId(course._id);
                          setOpen(true);
                        }}
                      >
                        <FiEdit />
                      </button>

                      <button
                        onClick={() => handleDelete(course._id)}
                        className="rounded bg-red-500 px-3 py-1 text-white hover:bg-red-600"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center p-4 text-gray-500">
                    No courses found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={open} onClose={() => setOpen(false)}>
        <CourseModal 
          onClose={() => setOpen(false)} 
          courseId={selectedCourseId} 
        />
      </Modal>
    </>
  );
};

export default Courses;