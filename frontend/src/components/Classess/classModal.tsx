import { useEffect, useState } from "react";
import axios from "axios";
import { FaCheck, FaTimes } from "react-icons/fa";
import { useActionData } from "react-router-dom";
const apiUrl = import.meta.env.VITE_API_URL;


const ClassModal = ({ onClose, classId }) => {
    const isEditMode = Boolean(classId);

    const [allCourses, setAllCourses] = useState([]);
    const [search, setSearch] = useState("");
    const [selectedCourses, setSelectedCourses] = useState([]);

    const [formData, setFormData] = useState({
        name: "",
        section: "",
        status: "Active",
        fee: "",
        academicYear: "",
        description: "",
        courseIds: [], // 🔑 IMPORTANT

    });

    const [loading, setLoading] = useState(false);

    // 🔹 Fetch class data for edit
    useEffect(() => {
        if (!classId) return;

        const fetchClass = async () => {
            const res = await axios.get(
                `${apiUrl}/api/classes/${classId}`
            );
            console.log(res, res.data);
            setFormData({
                name: res.data.name,
                section: res.data.section,
                description: res.data.description,
                status: res.data.status,
                fee: res.data.fee,
                academicYear: res.data.academicYear
            });

            // ✅ Preload assigned courses
            setSelectedCourses(res.data.courseIds);
        };

        fetchClass();
    }, [classId]);

    useEffect(() => {
        if (search.trim().length < 2) {
            setAllCourses([]);
            return;
        }

        const fetchCourses = async () => {
            const res = await axios.get(
                `${apiUrl}/api/courses/getCourse?search=${search}`
            );
            setAllCourses(res.data.data);
        };

        const delay = setTimeout(fetchCourses, 300); // debounce
        return () => clearTimeout(delay);
    }, [search]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const payload = {
            ...formData,
            courseIds: selectedCourses.map(c => c._id), // 👈 ARRAY
        };

        try {
            if (isEditMode) {
                await axios.put(
                    `${apiUrl}/api/classes/${classId}`,
                    payload
                );
            } else {
                await axios.post(
                    `${apiUrl}/api/classes`,
                    payload
                );
            }

            alert("Saved successfully");
            window.location.reload();
            onClose?.();
        } catch (err) {
            alert("Something went wrong");
        }
    };


    return (
        <div className="flex flex-col gap-9">
            <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
                    <h3 className="font-medium text-black dark:text-white">
                        {isEditMode ? "Edit Class" : "Add Class"}
                    </h3>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="p-6.5">
                        <h3 className="mb-4 text-lg font-semibold text-black dark:text-white">
                            Class Information
                        </h3>

                        <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">
                            <div className="w-full xl:w-1/2">
                                <label className="mb-2.5 block text-black dark:text-white">
                                    Class Name *
                                </label>
                                <input
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5"
                                />
                            </div>

                            <div className="w-full xl:w-1/2">
                                <label className="mb-2.5 block text-black dark:text-white">
                                    Section
                                </label>
                                <input
                                    name="section"
                                    value={formData.section}
                                    onChange={handleChange}
                                    className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5"
                                />
                            </div>
                        </div>

                        <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">
                            <div className="w-full xl:w-1/2">
                                <label className="mb-2.5 block text-black dark:text-white">
                                    Status
                                </label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5"
                                >
                                    <option>Active</option>
                                    <option>Inactive</option>
                                </select>
                            </div>
                            <div className="w-full xl:w-1/2">
                                <label className="mb-2.5 block text-black dark:text-white">
                                    Class Fee
                                </label>
                                <input
                                    type="number"
                                    name="fee"
                                    value={formData.fee}
                                    onChange={handleChange}
                                    className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5"
                                >
                                </input>
                            </div>
                            <div className="w-full xl:w-1/2">
                                <label className="mb-2.5 block text-black dark:text-white">
                                    Academic Year
                                </label>
                                <input
                                    type="text"
                                    name="academicYear"
                                    value={formData.academicYear}
                                    onChange={handleChange}
                                    placeholder="2024-2025"
                                    pattern="\d{4}-\d{4}"
                                    title="Format should be YYYY-YYYY"
                                    className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5"
                                />
                            </div>

                        </div>

                        <div className="mb-4.5">
                            <label className="mb-2.5 block text-black dark:text-white">
                                Assign Courses
                            </label>

                            <input
                                type="text"
                                placeholder="Search course..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="mb-2 w-full rounded border-[1.5px] border-stroke bg-transparent py-2 px-4"
                            />

                            <div className="max-h-40 overflow-y-auto rounded border border-stroke">
                                {allCourses.map(course => {
                                    const isSelected = selectedCourses.some(
                                        c => c._id === course._id
                                    );

                                    return (
                                        <div
                                            key={course._id}
                                            className={`flex cursor-pointer items-center justify-between px-4 py-2
          ${isSelected ? "bg-gray-100 opacity-60" : "hover:bg-gray-100"}
        `}
                                            onClick={() => {
                                                if (isSelected) return;

                                                setSelectedCourses([...selectedCourses, course]);
                                            }}
                                        >
                                            <span>{course.name}</span>
                                            {isSelected && <FaCheck className="text-green-500" />}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {selectedCourses.length > 0 && (
                            <div className="mb-4 flex flex-wrap gap-2">
                                {selectedCourses.map(course => (
                                    <span
                                        key={course._id}
                                        className="flex items-center gap-2 rounded bg-primary px-3 py-1 text-sm text-white"
                                    >
                                        {course.name}
                                        <FaTimes
                                            className="cursor-pointer"
                                            onClick={() =>
                                                setSelectedCourses(
                                                    selectedCourses.filter(c => c._id !== course._id)
                                                )
                                            }
                                        />
                                    </span>
                                ))}
                            </div>
                        )}

                        <div className="mb-6">
                            <label className="mb-2.5 block text-black dark:text-white">
                                Description
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={3}
                                className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5"
                            />
                        </div>

                        <button
                            disabled={loading}
                            className="flex w-full justify-center rounded bg-primary p-3 font-medium text-gray hover:bg-opacity-90"
                        >
                            {loading
                                ? "Saving..."
                                : isEditMode
                                    ? "Update Class"
                                    : "Save Class"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ClassModal;
