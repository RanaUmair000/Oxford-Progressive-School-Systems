import { FiEdit, FiTrash2 } from 'react-icons/fi';
import { useState } from 'react';
import Modal from '../Modal/modal';
import TeacherModal from '../Teachers/teacherModal.jsx';
const apiUrl = import.meta.env.VITE_API_URL;

const TableOne = ({ teachers }) => {
  const [open, setOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [mode, setMode] = useState("create"); // create | edit | view
  const handleAdd = () => {
    setSelectedTeacher(null);
    setMode("create");
    setOpen(true);
  };

  const handleEdit = (teacher) => {
    setSelectedTeacher(teacher);
    setMode("edit");
    setOpen(true);
  };

  const handleView = (teacher) => {
    setSelectedTeacher(teacher);
    setMode("view");
    setOpen(true);
  };

  const handleDelete = async (teacherId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this student?");
    if (!confirmDelete) return;

    try {
      await fetch(`${apiUrl}/api/teachers/${teacherId}`, {
        method: "DELETE",
      });

      // Option 1: refetch students from parent
      window.location.reload();

      // Option 2 (better): lift state up & remove locally
    } catch (error) {
      console.error("Delete failed", error);
      alert("Failed to delete teacher");
    }
  };

  return (
    <>
      <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
        <div className='add-stu-flex'>
          <h4 className="mb-6 text-xl font-semibold text-black dark:text-white">
            Teachers
          </h4>
          <div style={{display: "flex", gap: 14}}>
            <button
              onClick={() => {window.location.href = "/teachers/salaries/pay"}}

              className="flex justify-center rounded bg-primary px-4 py-2 font-medium text-gray hover:bg-opacity-90"
            >
              💰 Pay Salary
            </button>
            <button
              onClick={() => {window.location.href = "/teachers/salaries"}}

              className="flex justify-center rounded bg-primary px-4 py-2 font-medium text-gray hover:bg-opacity-90"
            >
              💵 View Salaries
            </button>
            <button
              onClick={handleAdd}

              className="flex justify-center rounded bg-primary px-4 py-2 font-medium text-gray hover:bg-opacity-90"
            >
              + New Teacher
            </button>
          </div>
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
                  Salary
                </th>
                <th className="p-2.5 text-center text-sm font-medium uppercase xsm:text-base">
                  Hiring Date
                </th>
                <th className="p-2.5 text-center text-sm font-medium uppercase xsm:text-base">
                  Qualification
                </th>
                <th className="hidden p-2.5 text-center sm:table-cell text-sm font-medium uppercase xsm:text-base">
                  Status
                </th>
                <th className="hidden p-2.5 text-center sm:table-cell text-sm font-medium uppercase xsm:text-base">
                  Action
                </th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-stroke dark:divide-strokedark">
              {teachers && teachers.map((teacher, index) => (
                <tr key={index} className="hover:bg-gray-100 dark:hover:bg-meta-3">
                  {/* Name */}
                  <td className="flex items-center gap-3 p-2.5">
                    <div className="flex-shrink-0">
                      <img
                        style={{ width: 40 }}
                        src={teacher.profilePic ? `${apiUrl}/${teacher.profilePic}` : "https://static.vecteezy.com/system/resources/thumbnails/020/765/399/small/default-profile-account-unknown-icon-black-silhouette-free-vector.jpg"}
                        alt={teacher.firstName}
                      />
                    </div>
                    <span className="text-black dark:text-white">
                      {teacher.firstName} {teacher.lastName}
                    </span>
                  </td>

                  {/* Roll Number */}
                  <td className="text-center p-2.5 text-black dark:text-white">
                    {teacher.salary}
                  </td>

                  <td className="text-center p-2.5 text-black dark:text-white">
                    {new Date(teacher.createdAt).toLocaleDateString()}
                  </td>

                  {/* Class */}
                  <td className="text-center p-2.5 text-black dark:text-white">
                    {teacher?.qualification}
                  </td>

                  {/* Status */}
                  <td className="hidden text-center p-2.5 text-black dark:text-white sm:table-cell">
                    {teacher.status}
                  </td>

                  {/* Action */}
                  <td className="hidden text-center p-2.5 sm:table-cell">
                    {/* Edit */}
                    <button
                      onClick={() => handleEdit(teacher)}
                      className="mr-2 rounded bg-blue-500 px-3 py-1 text-white hover:bg-blue-600"
                      title="Edit"
                    >
                      <FiEdit size={18} />
                    </button>

                    {/* View */}
                    <button
                      onClick={() => handleView(teacher)}
                      className="mr-2 rounded bg-indigo-500 px-3 py-1 text-white hover:bg-indigo-600"
                      title="View"
                    >
                      <FiEdit size={18} />
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => handleDelete(teacher._id)}
                      className="rounded bg-red-500 px-3 py-1 text-white hover:bg-red-600"
                      title="Delete"
                    >
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
        <TeacherModal
          mode={mode}
          teacher={selectedTeacher}
          onClose={() => setOpen(false)}
        />
      </Modal>
    </>
  );
};

export default TableOne;
