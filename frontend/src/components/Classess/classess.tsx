import { FiEdit, FiTrash2 } from 'react-icons/fi';
import { useState } from 'react';
import { FaCheck, FaTimes } from "react-icons/fa";
import axios from 'axios';

import Modal from '../Modal/modal';
import ClassModal from './classModal';

const apiUrl = import.meta.env.VITE_API_URL;


const Classes = ({ classes, toggleStatus }) => {
  const [open, setOpen] = useState(false);
const [selectedClassId, setSelectedClassId] = useState(null);
  console.log(classes);
  const handleDelete = async (classId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this Class?"
    );

    if (!confirmDelete) return;

    try {
      await axios.delete(
        `${apiUrl}/api/classes/${classId}`
      );

      alert("Class deleted successfully");
      window.location.reload();
    } catch (error) {
      alert(error.response?.data?.message || "Delete failed");
    }
  };

  return (
    <>
      <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
        <div className='add-stu-flex'>
          <h4 className="mb-6 text-xl font-semibold text-black dark:text-white">
            Classes
          </h4>
          <button
            onClick={() => setOpen(true)}
            className="flex justify-center rounded bg-primary px-4 py-2 font-medium text-gray hover:bg-opacity-90"
          >
            + New Class
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-stroke dark:divide-strokedark">
            {/* Table Head */}
            <thead className="bg-gray-2 dark:bg-meta-4">
              <tr>
                <th className="p-2.5 text-left text-sm font-medium uppercase xsm:text-base">
                  Name
                </th>
                <th className="p-2.5 text-center text-sm font-medium uppercase xsm:text-base">
                  Section
                </th>
                <th className="p-2.5 text-center text-sm font-medium uppercase xsm:text-base">
                  Courses
                </th>
                <th className="p-2.5 text-center text-sm font-medium uppercase xsm:text-base">
                  Status
                </th>
                <th className="hidden p-2.5 text-center sm:table-cell text-sm font-medium uppercase xsm:text-base">
                  Action
                </th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-stroke dark:divide-strokedark">
              {classes && classes.map((cls, index) => (
                <tr key={index} className="hover:bg-gray-100 dark:hover:bg-meta-3">
                  {/* Name */}
                  <td className="flex items-center gap-3 p-2.5">
                    <span className="text-black dark:text-white">
                      {cls.name}
                    </span>
                  </td>
                  <td className="text-center p-2.5 text-black dark:text-white">
                    {cls.section}
                  </td>

                  <td className="text-center p-2.5 text-black dark:text-white">
                    {cls.courseIds?.length ? (
                      cls.courseIds.map(course => (
                        <span
                          key={course._id}
                          className="mr-1 inline-block rounded bg-blue-100 px-2 py-0.5 text-xs text-blue-700"
                        >
                          {course.name}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-400">No courses</span>
                    )}
                  </td>

                  {/* Status */}
                  <td className="hidden text-center p-2.5 text-black dark:text-white sm:table-cell">
                    {cls.status}
                  </td>

                  {/* Action */}
                  <td className="hidden text-center p-2.5 sm:table-cell">
                    <button
                      onClick={() => toggleStatus(cls._id, cls.status)}
                      className={`mr-2 rounded bg-blue-500 px-3 py-[6px] text-white hover:bg-blue-600
                        ${cls.status !== "Active" ? "bg-green-500" : "bg-red-500"}
                      `}
                    >
                      {cls.status !== "Active" ? <FaCheck /> : <FaTimes />}
                    </button>
                    <button className='mr-2 rounded bg-blue-500 px-3 py-1 text-white hover:bg-red-600'
                      onClick={() => {
                        setSelectedClassId(cls._id);
                        setOpen(true);
                      }}
                    >
                      <FiEdit />
                    </button>
                    <button onClick={() => handleDelete(cls._id)} className="rounded bg-red-500 px-3 py-1 text-white hover:bg-red-600">
                      <FiTrash2 size={18} />
                    </button>

                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <Modal isOpen={open} onClose={() => setOpen(false)}>
        <ClassModal onClose={() => setOpen(false)} classId={selectedClassId} />
      </Modal>
    </>
  );
};

export default Classes;
