import { useEffect, useState } from 'react';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import TableOne from '../../components/Tables/TableOne';

const apiUrl = import.meta.env.VITE_API_URL;
const token = localStorage.getItem("token");


const Students = () => {
    const [students, setStudents] = useState([]);

    const fetchStudents = async () => {
        try {
            const res = await fetch(`${apiUrl}/api/students`, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            const data = await res.json();
            console.log(data);
            setStudents(data.data); // assuming your API returns { success: true, count, data }
        } catch (err) {
            console.error("Error Fetching Students: ", err);
        }
    };

    useEffect(() => {
        fetchStudents();
    }, []);

    return (
        <>
            <Breadcrumb pageName="Students" />
            <div className="flex flex-col gap-10">
                <TableOne students={students} />
            </div>
        </>
    )
}

export default Students;