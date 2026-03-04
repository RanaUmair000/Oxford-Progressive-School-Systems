import { useEffect, useState } from 'react';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import Courses from '../../components/Courses/courses';
const apiUrl = import.meta.env.VITE_API_URL;

const Students = () => {
    const [courses, setCourses] = useState([]);

    const fetchCourses = async () => {
        try {
            const res = await fetch(`${apiUrl}/api/courses`);
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            console.log(res);
            const data = await res.json();
            console.log(data);
            setCourses(data.data); // assuming your API returns { success: true, count, data }
        } catch (err) {
            console.error("Error Fetching Students: ", err);
        }
    };

    const toggleStatus = async (id, currentStatus) => {
        try {
            await fetch(`${apiUrl}/api/courses/${id}/status`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    status: currentStatus === "Active" ? "Inactive" : "Active",
                }),
            });

            fetchCourses(); // refresh list
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchCourses();
    }, []);

    return (
        <>
            <Breadcrumb pageName="Courses" />
            <div className="flex flex-col gap-10">
                <Courses courses={courses} toggleStatus={toggleStatus} />
            </div>
        </>
    )
}

export default Students;