import { useEffect, useState } from 'react';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import Classess from '../../components/Classess/classess';
const apiUrl = import.meta.env.VITE_API_URL;

const Classes = () => {
    const [classes, setClasses] = useState([]);

    const fetchClasses = async () => {
        try {
            const res = await fetch(`${apiUrl}/api/classes`);
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }   
            const data = await res.json();
            setClasses(data); // assuming your API returns { success: true, count, data }
        } catch (err) {
            console.error("Error Fetching Students: ", err);
        }
    };

    const toggleStatus = async (id, currentStatus) => {
        try {
            await fetch(`${apiUrl}/api/classes/${id}/status`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    status: currentStatus === "Active" ? "Inactive" : "Active",
                }),
            });

            fetchClasses(); // refresh list
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchClasses();
    }, []);

    return (
        <>
            <Breadcrumb pageName="Classes" />
            <div className="flex flex-col gap-10">
                <Classess classes={classes} toggleStatus={toggleStatus} />
            </div>
        </>
    )
}

export default Classes;