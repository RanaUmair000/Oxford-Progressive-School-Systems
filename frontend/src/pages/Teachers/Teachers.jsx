import { useEffect, useState } from 'react';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import TeacherModal from '../../components/Teachers/teachers';
const apiUrl = import.meta.env.VITE_API_URL;

const Teachers = () => {
    const [teachers, setTeachers] = useState([]);

    const fetchTeachers = async () => {
        try {
            const res = await fetch(`${apiUrl}/api/teachers`);
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            const data = await res.json();
            console.log(data);
            setTeachers(data.data); // assuming your API returns { success: true, count, data }
        } catch (err) {
            console.error("Error Fetching Teachers: ", err);
        }
    };

    useEffect(() => {
        fetchTeachers();
    }, []);

    return (
        <>
            <Breadcrumb pageName="Teachers" />
            <div className="flex flex-col gap-10">
                <TeacherModal teachers={teachers}/>
            </div>
        </>
    )
}

export default Teachers;