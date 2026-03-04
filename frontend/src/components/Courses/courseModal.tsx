import { useEffect, useState } from "react";
import flatpickr from "flatpickr";
import axios from "axios";
const apiUrl = import.meta.env.VITE_API_URL;

const CourseModal = ({ onClose, courseId }) => {
    const isEditMode = Boolean(courseId);

    const [formData, setFormData] = useState({
        name: "",
        code: "",
        type: "",
        status: "Active",
        description: "",
        weeklyHours: "",
        classId: "",
    });

    const [loading, setLoading] = useState(false);

    // datepicker (unchanged)
    useEffect(() => {
        flatpickr(".form-datepicker", {
            mode: "single",
            static: true,
            monthSelectorType: "static",
            dateFormat: "M j, Y",
        });
    }, []);

    // 🔹 Fetch course data for edit
    useEffect(() => {
        if (!courseId) return;

        const fetchCourse = async () => {
            try {
                setLoading(true);
                const res = await axios.get(
                    `${apiUrl}/api/courses/${courseId}`
                );

                setFormData({
                    name: res.data.name || "",
                    code: res.data.code || "",
                    type: res.data.type || "",
                    status: res.data.status || "Active",
                    description: res.data.description || "",
                    weeklyHours: res.data.weeklyHours || "",
                    classId: res.data.classId || "",
                });
            } catch (err) {
                alert("Failed to load course data");
            } finally {
                setLoading(false);
            }
        };

        fetchCourse();
    }, [courseId]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);

            if (isEditMode) {
                // ✏️ UPDATE
                await axios.put(
                    `${apiUrl}/api/courses/${courseId}`,
                    formData
                );
                alert("Course updated successfully");
            } else {
                // ➕ CREATE
                await axios.post(`${apiUrl}/api/courses`, formData);
                alert("Course added successfully");
            }

            onClose?.();
            window.location.reload();
        } catch (error) {
            alert(error.response?.data?.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-9">
            <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
                    <h3 className="font-medium text-black dark:text-white">
                        {isEditMode ? "Edit Course" : "Courses"}
                    </h3>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="p-6.5">
                        <h3 className="mb-4 text-lg font-semibold text-black dark:text-white">
                            Course Information
                        </h3>

                        <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">
                            <div className="w-full xl:w-1/2">
                                <label className="mb-2.5 block text-black dark:text-white">
                                    Course Name *
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
                                    Course Code *
                                </label>
                                <input
                                    name="code"
                                    value={formData.code}
                                    onChange={handleChange}
                                    className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5"
                                />
                            </div>
                        </div>

                        <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">
                            <div className="w-full xl:w-1/2">
                                <label className="mb-2.5 block text-black dark:text-white">
                                    Course Type *
                                </label>
                                <select
                                    name="type"
                                    value={formData.type}
                                    onChange={handleChange}
                                    className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5"
                                >
                                    <option value="">Select</option>
                                    <option>Core</option>
                                    <option>Elective</option>
                                    <option>Optional</option>
                                </select>
                            </div>
                        </div>

                        <h3 className="mb-4 text-lg font-semibold text-black dark:text-white">
                            Additional Details
                        </h3>

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
                        </div>

                        <div className="mb-6">
                            <label className="mb-2.5 block text-black dark:text-white">
                                Course Description
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
                                    ? "Update Course"
                                    : "Save Course"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CourseModal;
