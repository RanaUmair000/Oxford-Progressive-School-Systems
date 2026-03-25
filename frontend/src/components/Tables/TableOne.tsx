import { FiEdit, FiTrash2 } from 'react-icons/fi';
import { useState } from 'react';
import Modal from '../Modal/modal';
import StudentModal from '../Students/studentModal';
const apiUrl = import.meta.env.VITE_API_URL;
const token = localStorage.getItem("token");

const TableOne = ({ students }) => {
  const [open, setOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [mode, setMode] = useState("create"); // create | edit | view
  const handleAdd = () => {
    setSelectedStudent(null);
    setMode("create");
    setOpen(true);
  };

  const handleEdit = (student) => {
    setSelectedStudent(student);
    setMode("edit");
    setOpen(true);
  };

  const handleDelete = async (studentId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this student?");
    if (!confirmDelete) return;

    try {
      const res = await fetch(`${apiUrl}/api/students/${studentId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });


      // Option 1: refetch students from parent
      if (res.ok) {
        window.location.reload();
      }

      // Option 2 (better): lift state up & remove locally
    } catch (error) {
      console.error("Delete failed", error);
      alert("Failed to delete student");
    }
  };

  return (
    <>
      <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
        <div className='add-stu-flex'>
          <h4 className="mb-6 text-xl font-semibold text-black dark:text-white">
            Students
          </h4>
          <button
            onClick={handleAdd}

            className="flex justify-center rounded bg-primary px-4 py-2 font-medium text-gray hover:bg-opacity-90"
          >
            + New Student
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
                  Roll #
                </th>
                <th className="p-2.5 text-center text-sm font-medium uppercase xsm:text-base">
                  Admission Date
                </th>
                <th className="p-2.5 text-center text-sm font-medium uppercase xsm:text-base">
                  Class
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
              {students && students.map((student, index) => (
                <tr key={index} className="hover:bg-gray-100 dark:hover:bg-meta-3">
                  {/* Name */}
                  <td className="flex items-center gap-3 p-2.5">
                    <div className="flex-shrink-0">
                      <img
                        style={{ width: 40 }}
                        src={student.profilePic ? `${apiUrl}/${student.profilePic}` : "https://static.vecteezy.com/system/resources/thumbnails/020/765/399/small/default-profile-account-unknown-icon-black-silhouette-free-vector.jpg"}
                        alt={student.firstName}
                      />
                    </div>
                    <span className="text-black dark:text-white">
                      {student.firstName} {student.lastName}
                    </span>
                  </td>

                  {/* Roll Number */}
                  <td className="text-center p-2.5 text-black dark:text-white">
                    {student.rollNumber}
                  </td>

                  <td className="text-center p-2.5 text-black dark:text-white">
                    {new Date(student.createdAt).toLocaleDateString()}
                  </td>

                  {/* Class */}
                  <td className="text-center p-2.5 text-black dark:text-white">
                    {student?.class?.name } - Section {student?.class?.section}
                  </td>

                  {/* Status */}
                  <td className="hidden text-center p-2.5 text-black dark:text-white sm:table-cell">
                    {student.status}
                  </td>

                  {/* Action */}
                  <td className="hidden text-center p-2.5 sm:table-cell">
                    {/* Edit */}
                    <button
                      onClick={() => handleEdit(student)}
                      className="mr-2 rounded bg-blue-500 px-3 py-1 text-white hover:bg-blue-600"
                      title="Edit"
                    >
                      <FiEdit size={18} />
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => handleDelete(student._id)}
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
        <StudentModal
          mode={mode}
          student={selectedStudent}
          onClose={() => setOpen(false)}
        />
      </Modal>
    </>
  );
};

export default TableOne;
