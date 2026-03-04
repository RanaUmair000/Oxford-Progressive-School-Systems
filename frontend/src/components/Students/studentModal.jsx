import SelectGroupOne from "../Forms/SelectGroup/SelectGroupOne"
import { useEffect, useState, useMemo } from "react";
import flatpickr from 'flatpickr';
const apiUrl = import.meta.env.VITE_API_URL;
const token = localStorage.getItem("token");

const StudentModal = ({ onClose, student }) => {

    const [classes, setClasses] = useState([]);
    const [existingProfilePic, setExistingProfilePic] = useState(null);
    const [existingCnicPic, setExistingCnicPic] = useState(null);
    const [fee, setFee] = useState("");
    const handleClassChange = (e) => {
        const selectedClassId = e.target.value;

        setFormData((prev) => ({
            ...prev,
            class: selectedClassId,
        }));

        const selectedClass = classes.find(
            (cls) => cls._id === selectedClassId
        );

        // 🔥 Only auto-fill fee when creating OR class actually changed
        if (selectedClass) {
            setFee((prevFee) => {
                if (isEditing && prevFee !== "") {
                    return prevFee; // keep student's fee
                }
                return selectedClass.fee ?? "";
            });
        } else {
            setFee("");
        }
    };



    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        gender: "",
        dateOfBirth: "",
        religion: "",
        email: "",
        studentId: "",
        rollNumber: "",
        class: "",
        fee: "",
        academicYear: "",
        status: "Active",
        enrollmentDate: "",
        guardianName: "",
        guardianPhone: "",
        address: "",
    });

    useEffect(() => {
        if (student) {
            setFormData({
                firstName: student.firstName,
                lastName: student.lastName,
                gender: student.gender || "",
                dateOfBirth: student.dateOfBirth || "",
                religion: student.religion || "",
                email: student.email || "",
                studentId: student.studentId || "",
                rollNumber: student.rollNumber || "",
                class: student.class?._id || student.class || "",
                academicYear: student.academicYear || "",
                status: student.status || "Active",
                enrollmentDate: student.enrollmentDate || "",
                guardianName: student.guardian?.name || "",
                guardianPhone: student.guardian?.phone || "",
                address: student.guardian?.address || "",
            });
            setExistingProfilePic(student.profilePic || null);
            setExistingCnicPic(student.cnicPic || null);
            setFee(student.fee ?? "");
        }
    }, [student]);

    const isEditing = Boolean(student);

    const [profilePic, setProfilePic] = useState(null);
    const [cnicPic, setCnicPic] = useState(null);
    const [loading, setLoading] = useState(false);

    // 🟢 Handle text/select changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // 🟢 Submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const data = new FormData();

        Object.entries(formData).forEach(([key, value]) => {
            data.append(key, value);
        });

        if (profilePic) data.append("profilePic", profilePic);
        if (cnicPic) data.append("cnicPic", cnicPic);

        const url = student
            ? `${apiUrl}/api/students/${student._id}`
            : `${apiUrl}/api/students`;
        const method = student ? "PUT" : "POST";
        console.log([...data.entries()]);
        try {
            await fetch(url, {
                method,
                body: data,
                headers: {
                    "Authorization": `Bearer ${token}`,
                }
            });
            onClose();
            window.location.href = "/students";
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const res = await fetch(`${apiUrl}/api/classes`);
                const data = await res.json();
                setClasses(data);
            } catch (err) {
                console.error("Failed to load classes", err);
            }
        };

        fetchClasses();
    }, []);

    const getProfileImageSrc = () => {
        if (typeof existingProfilePic === "string" && existingProfilePic.length > 0) {
            const normalized = existingProfilePic.replace(/\\/g, "/");
            return normalized.startsWith("http")
                ? normalized
                : `${apiUrl}/${normalized}`;
        }
        return null;
    };

    const getCnicImageSrc = () => {
        if (typeof existingCnicPic === "string" && existingCnicPic.length > 0) {
            const normalized = existingCnicPic.replace(/\\/g, "/");
            return normalized.startsWith("http")
                ? normalized
                : `${apiUrl}/${normalized}`;
        }
        return null;
    };

    const profilePreview = useMemo(() => {
        if (profilePic instanceof File) {
            return URL.createObjectURL(profilePic);
        }
        return getProfileImageSrc();
    }, [profilePic, existingProfilePic]);

    const cnicPreview = useMemo(() => {
        if (cnicPic instanceof File) {
            return URL.createObjectURL(cnicPic);
        }
        return getCnicImageSrc();
    }, [cnicPic, existingCnicPic]);

    useEffect(() => {
        return () => {
            if (profilePic instanceof File && profilePreview) {
                URL.revokeObjectURL(profilePreview);
            }
        };
    }, [profilePreview, profilePic]);

    useEffect(() => {
        return () => {
            if (cnicPic instanceof File && cnicPreview) {
                URL.revokeObjectURL(cnicPreview);
            }
        };
    }, [cnicPreview, cnicPic]);

    return (
        <div className="flex flex-col gap-9">
            {/* <!-- Contact Form --> */}
            <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
                    <h3 className="font-medium text-black dark:text-white">
                        Contact Form
                    </h3>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6.5">

                        {/* ================= Personal Information ================= */}
                        <h3 className="mb-4 text-lg font-semibold text-black dark:text-white">
                            Personal Information
                        </h3>

                        <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">
                            <div className="w-full xl:w-1/2">
                                <label className="mb-2.5 block text-black dark:text-white">
                                    First Name <span className="text-meta-1">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    placeholder="Enter first name"
                                    className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary"
                                />
                            </div>

                            <div className="w-full xl:w-1/2">
                                <label className="mb-2.5 block text-black dark:text-white">
                                    Last Name <span className="text-meta-1">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    placeholder="Enter last name"
                                    className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                                />
                            </div>
                        </div>

                        <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">
                            <div className="w-full xl:w-1/2">
                                <label className="mb-2.5 block text-black dark:text-white">
                                    Gender <span className="text-meta-1">*</span>
                                </label>
                                <select
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleChange}
                                    className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                                >
                                    <option value="">Select gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <div className="w-full xl:w-1/2">
                                <label className="mb-2.5 block text-black dark:text-white">
                                    Date of Birth <span className="text-meta-1">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="date"
                                        name="dateOfBirth"
                                        value={formData.dateOfBirth}
                                        onChange={handleChange}
                                        className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                    />

                                    {/* <div className="pointer-events-none absolute inset-0 left-auto right-5 flex items-center">
                                        <svg
                                            width="18"
                                            height="18"
                                            viewBox="0 0 18 18"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path
                                                d="M15.7504 2.9812H14.2879V2.36245C14.2879 2.02495 14.0066 1.71558 13.641 1.71558C13.2754 1.71558 12.9941 1.99683 12.9941 2.36245V2.9812H4.97852V2.36245C4.97852 2.02495 4.69727 1.71558 4.33164 1.71558C3.96602 1.71558 3.68477 1.99683 3.68477 2.36245V2.9812H2.25039C1.29414 2.9812 0.478516 3.7687 0.478516 4.75308V14.5406C0.478516 15.4968 1.26602 16.3125 2.25039 16.3125H15.7504C16.7066 16.3125 17.5223 15.525 17.5223 14.5406V4.72495C17.5223 3.7687 16.7066 2.9812 15.7504 2.9812ZM1.77227 8.21245H4.16289V10.9968H1.77227V8.21245ZM5.42852 8.21245H8.38164V10.9968H5.42852V8.21245ZM8.38164 12.2625V15.0187H5.42852V12.2625H8.38164V12.2625ZM9.64727 12.2625H12.6004V15.0187H9.64727V12.2625ZM9.64727 10.9968V8.21245H12.6004V10.9968H9.64727ZM13.8379 8.21245H16.2285V10.9968H13.8379V8.21245ZM2.25039 4.24683H3.71289V4.83745C3.71289 5.17495 3.99414 5.48433 4.35977 5.48433C4.72539 5.48433 5.00664 5.20308 5.00664 4.83745V4.24683H13.0504V4.83745C13.0504 5.17495 13.3316 5.48433 13.6973 5.48433C14.0629 5.48433 14.3441 5.20308 14.3441 4.83745V4.24683H15.7504C16.0316 4.24683 16.2566 4.47183 16.2566 4.75308V6.94683H1.77227V4.75308C1.77227 4.47183 1.96914 4.24683 2.25039 4.24683ZM1.77227 14.5125V12.2343H4.16289V14.9906H2.25039C1.96914 15.0187 1.77227 14.7937 1.77227 14.5125ZM15.7504 15.0187H13.8379V12.2625H16.2285V14.5406C16.2566 14.7937 16.0316 15.0187 15.7504 15.0187Z"
                                                fill="#64748B"
                                            />
                                        </svg>
                                    </div> */}
                                </div>
                            </div>
                        </div>

                        <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">
                            <div className="w-full xl:w-1/2">
                                <label className="mb-2.5 block text-black dark:text-white">
                                    Religion <span className="text-meta-1">*</span>
                                </label>
                                <select
                                    name="religion"
                                    value={formData.religion}
                                    onChange={handleChange}
                                    className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                                >
                                    <option value="">Select Religion</option>
                                    <option value="Islam">Islam</option>
                                    <option value="Christian">Christian</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <div className="w-full xl:w-1/2">
                                <label className="mb-2.5 block text-black dark:text-white">
                                    Email <span className="text-meta-1">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="Student Email"
                                        className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                    />

                                </div>
                            </div>
                        </div>

                        <div className="mb-6">
                            <label className="mb-2.5 block text-black dark:text-white">
                                Student Photo / Avatar (optional)
                            </label>

                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (file) {
                                        setProfilePic(file);
                                        setExistingProfilePic(null); // ✅ IMPORTANT
                                    }
                                }}
                                className="w-full rounded border-[1.5px] ..."
                            />

                            {getProfileImageSrc() && (
                                <div className="mt-4 flex items-center gap-4">
                                    {profilePreview && (
                                        <img
                                            src={profilePreview}
                                            className="h-24 w-24 rounded-lg object-cover border"
                                        />
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="mb-6">
                            <label className="mb-2.5 block text-black dark:text-white">
                                CNIC Picture
                            </label>

                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (file) {
                                        setCnicPic(file);
                                        setExistingCnicPic(null); // ✅ IMPORTANT
                                    }
                                }}
                                className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                            />

                            {cnicPreview && (
                                <img
                                    src={cnicPreview}
                                    className="h-32 w-full max-w-xs rounded-lg object-cover border"
                                />
                            )}


                        </div>


                        {/* ================= Academic Information ================= */}
                        <h3 className="mb-4 text-lg font-semibold text-black dark:text-white">
                            Academic Information
                        </h3>

                        <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">
                            <div className="w-full xl:w-1/2">
                                <label className="mb-2.5 block text-black dark:text-white">
                                    Admission Number / Student ID <span className="text-meta-1">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="studentId"        // change to the correct field name
                                    value={formData.studentId}
                                    onChange={handleChange}
                                    className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                                />
                            </div>

                            <div className="w-full xl:w-1/2">
                                <label className="mb-2.5 block text-black dark:text-white">
                                    Roll Number <span className="text-meta-1">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="rollNumber"          // change this to the actual field name
                                    value={formData.rollNumber}
                                    onChange={handleChange}
                                    className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                                />
                            </div>
                        </div>

                        <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">

                            {/* Class Select */}
                            <div className="w-full xl:w-1/4">
                                <label className="mb-2.5 block text-black dark:text-white">
                                    Class *
                                </label>
                                <select
                                    name="class"
                                    value={formData.class}
                                    onChange={handleClassChange}
                                    className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                                >
                                    <option value="">Select class</option>
                                    {classes.map((cls) => (
                                        <option key={cls._id} value={cls._id}>
                                            {cls.name} - Section {cls.section}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Fee Input (shows only when class selected) */}
                            {formData.class && (
                                <div className="w-full xl:w-1/4">
                                    <label className="mb-2.5 block text-black dark:text-white">
                                        Fee
                                    </label>
                                    <input
                                        type="number"
                                        value={fee}
                                        onChange={(e) => {
                                            const value = e.target.value === "" ? "" : Number(e.target.value);
                                            setFee(value);

                                            setFormData((prev) => ({
                                                ...prev,
                                                fee: value,
                                            }));
                                        }}
                                        className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                                    />
                                </div>
                            )}

                            <div className="w-full xl:w-1/4">
                                <label className="mb-2.5 block text-black dark:text-white">Academic Year *</label>
                                <select
                                    name="academicYear"
                                    value={formData.academicYear}
                                    onChange={handleChange}
                                    className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                                >
                                    <option value="2024-2025">2024-2025</option>
                                    <option value="2025-2026">2025-2026</option>
                                </select>
                            </div>

                            <div className="w-full xl:w-1/4">
                                <label className="mb-2.5 block text-black dark:text-white">Status *</label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                                >
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                    <option value="Alumni">Alumni</option>
                                </select>
                            </div>
                        </div>

                        <div className="mb-6">
                            <label className="mb-2.5 block text-black dark:text-white">
                                Admission Date <span className="text-meta-1">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    type="date"
                                    name="enrollmentDate"
                                    value={formData.enrollmentDate}
                                    onChange={handleChange}
                                    className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3"
                                />

                                {/* <div className="pointer-events-none absolute inset-0 left-auto right-5 flex items-center">
                                    <svg
                                        width="18"
                                        height="18"
                                        viewBox="0 0 18 18"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            d="M15.7504 2.9812H14.2879V2.36245C14.2879 2.02495 14.0066 1.71558 13.641 1.71558C13.2754 1.71558 12.9941 1.99683 12.9941 2.36245V2.9812H4.97852V2.36245C4.97852 2.02495 4.69727 1.71558 4.33164 1.71558C3.96602 1.71558 3.68477 1.99683 3.68477 2.36245V2.9812H2.25039C1.29414 2.9812 0.478516 3.7687 0.478516 4.75308V14.5406C0.478516 15.4968 1.26602 16.3125 2.25039 16.3125H15.7504C16.7066 16.3125 17.5223 15.525 17.5223 14.5406V4.72495C17.5223 3.7687 16.7066 2.9812 15.7504 2.9812ZM1.77227 8.21245H4.16289V10.9968H1.77227V8.21245ZM5.42852 8.21245H8.38164V10.9968H5.42852V8.21245ZM8.38164 12.2625V15.0187H5.42852V12.2625H8.38164V12.2625ZM9.64727 12.2625H12.6004V15.0187H9.64727V12.2625ZM9.64727 10.9968V8.21245H12.6004V10.9968H9.64727ZM13.8379 8.21245H16.2285V10.9968H13.8379V8.21245ZM2.25039 4.24683H3.71289V4.83745C3.71289 5.17495 3.99414 5.48433 4.35977 5.48433C4.72539 5.48433 5.00664 5.20308 5.00664 4.83745V4.24683H13.0504V4.83745C13.0504 5.17495 13.3316 5.48433 13.6973 5.48433C14.0629 5.48433 14.3441 5.20308 14.3441 4.83745V4.24683H15.7504C16.0316 4.24683 16.2566 4.47183 16.2566 4.75308V6.94683H1.77227V4.75308C1.77227 4.47183 1.96914 4.24683 2.25039 4.24683ZM1.77227 14.5125V12.2343H4.16289V14.9906H2.25039C1.96914 15.0187 1.77227 14.7937 1.77227 14.5125ZM15.7504 15.0187H13.8379V12.2625H16.2285V14.5406C16.2566 14.7937 16.0316 15.0187 15.7504 15.0187Z"
                                            fill="#64748B"
                                        />
                                    </svg>
                                </div> */}
                            </div>
                        </div>

                        {/* ================= Contact Information ================= */}
                        <h3 className="mb-4 text-lg font-semibold text-black dark:text-white">
                            Contact Information
                        </h3>

                        <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">
                            <div className="w-full xl:w-1/2">
                                <label className="mb-2.5 block text-black dark:text-white">
                                    Parent / Guardian Name <span className="text-meta-1">*</span>
                                </label>

                                <input
                                    type="text"
                                    name="guardianName"
                                    value={formData.guardianName}
                                    onChange={handleChange}
                                    className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                                />
                            </div>

                            <div className="w-full xl:w-1/2">
                                <label className="mb-2.5 block text-black dark:text-white">
                                    Parent / Guardian Phone <span className="text-meta-1">*</span>
                                </label>

                                <input
                                    type="text"
                                    name="guardianPhone"
                                    value={formData.guardianPhone}
                                    onChange={handleChange}
                                    className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                                />
                            </div>

                        </div>

                        <div className="mb-6">
                            <label className="mb-2.5 block text-black dark:text-white">
                                Address <span className="text-meta-1">*</span>
                            </label>
                            <textarea
                                rows={3}
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                            />
                        </div>

                        <button
                            disabled={loading}
                            className="flex w-full justify-center rounded bg-primary p-3 font-medium text-gray hover:bg-opacity-90"
                        >
                            {student ? "Update Student" : "Save Student"}
                        </button>

                    </div>
                </form>

            </div>
        </div>
    )
}

export default StudentModal;