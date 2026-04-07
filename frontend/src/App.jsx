import { useEffect, useState } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { useNavigate } from "react-router-dom";

import Loader from './common/Loader/index.tsx';
import PageTitle from './components/PageTitle.tsx';
import SignIn from './pages/Authentication/SignIn.tsx';
import SignUp from './pages/Authentication/SignUp.tsx';
import Calendar from './pages/Calendar.tsx';
// @ts-ignore
import Students from './pages/Students/Students.tsx';
import Courses from './pages/Courses/Courses.tsx';
import Classess from './pages/Classess/Classes.tsx';
import Teachers from './pages/Teachers/Teachers.jsx';
import FeeDashboard from './components/Fees/feeDashboard.jsx';
import InvoiceList from './components/Fees/invoiceList.jsx';
import PaymentHistory from './components/Fees/paymentHistory.jsx';
import UnpaidFeesList from './components/Fees/unpaidStudents.jsx';
import TeacherSalaryList from './components/Teachers/teacherSalaries.jsx';
import PayTeacherSalary from './components/Teachers/paySalary.jsx';
import AttendanceManagementSystem from './pages/Attendence/AttendenceSystem.jsx';
import Timeslots from './components/Timetable/TimeSlotManager.jsx';
import TimetableBuilder from './components/Timetable/TimetableBuilder.jsx';
import StudentTimetableWidget from './components/Timetable/StudentTimetableWidget.jsx';
import TeacherTimetableWidget from './components/Timetable/TeacherTimetableWidget.jsx';
import DiaryPage from './pages/Diary.jsx';
import TeacherAttendanceAdmin from './pages/TeacherAttendanceAdminPage.jsx';

import StockDashboard from './components/Stocks/StockDashboard.jsx';
import StockItemsList from './components/Stocks/StockItemslist.jsx';
import AddEditStockItem from './components/Stocks/AddEditStockItem.jsx';
import SuppliersList from './components/Stocks/SuppliersList.jsx';
import AddEditSupplier from './components/Stocks/AddEditSupplier.jsx';
import PurchaseStock from './components/Stocks/PurchaseStock.jsx';
import SellItem from './components/Stocks/SellItem.jsx';
import SalesHistory from './components/Stocks/SalesHistory.jsx';

import Chart from './pages/Chart.tsx';
import ECommerce from './pages/Dashboard/ECommerce.tsx';
import FormElements from './pages/Form/FormElements.tsx';
import FormLayout from './pages/Form/FormLayout.tsx';
import Profile from './pages/Profile.tsx';
import Settings from './pages/Settings.tsx';
import Tables from './pages/Tables.tsx';
import Alerts from './pages/UiElements/Alerts.tsx';
import Buttons from './pages/UiElements/Buttons.tsx';
import DefaultLayout from './layout/DefaultLayout.tsx';

import TeacherLayout from './components/Teachers/TeacherLayout.jsx';
import TeacherDashboard from './pages/Teachers/TeacherDashboard.jsx';
import TimetablePage from './pages/Teachers/TimetablePage.jsx';
import AttendancePage from './pages/Teachers/AttendancePage.jsx';
import AssignmentsPage from './pages/Teachers/AssignmentsPage.jsx';
import MarksPage from './pages/Teachers/MarksPage.jsx';
import LeavePage from './pages/Teachers/LeavePage.jsx';
import NotificationsPage from './pages/Teachers/NotificationsPage.jsx';
import ProfilePage from './pages/Teachers/ProfilePage.jsx';
import Login from './pages/LoginPage.jsx';
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import TeacherAttendancePage from "./pages/Teachers/teacherAttendancePage.jsx";

// import Student_Login from "./pages/Login";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import Student_Dashboard from "./pages/student_portal/dashboard.jsx";
import Student_Sidebar from "./components/student_portal/sidebar.jsx";
import Student_Topbar from "./components/student_portal/sidebar.jsx";
import Student_FeeInvoices from "./pages/student_portal/feeInvoices.jsx";
import Student_Courses from "./pages/student_portal/courses.jsx";
import Student_Timetable from "./pages/student_portal/timetable.jsx";
import Student_Diary from "./pages/student_portal/diary.jsx";
import Student_Profile from "./pages/student_portal/profile.jsx";
import Student_InvoiceDetail from "./pages/student_portal/invoiceDetail.jsx";
import Student_Attendance from "./pages/student_portal/attendance.jsx";

import { Outlet } from "react-router-dom";

// ── Student shell (unchanged) ─────────────────────────────────────────────────
function AppShell() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loader-ring"></div>
        <p>Loading portal…</p>
      </div>
    );
  }

  if (!user) return <Login />;

  return (
    <div className={`app-shell ${sidebarOpen ? "sidebar-open" : "sidebar-closed"}`}>

      {/* Sidebar stays */}
      <Student_Sidebar isOpen={sidebarOpen} />

      <div className="main-area">

        {/* Topbar stays */}
        <Student_Topbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

        {/* 🔥 THIS IS WHERE ROUTES WILL RENDER */}
        <main className="page-content">
          <Outlet />
        </main>

      </div>
    </div>
  );
}

function Logout() {
  const navigate = useNavigate();
  const { setUser } = useAuth(); // remove if your AuthContext doesn't expose setUser

  useEffect(() => {
    // Clear all localStorage keys
    localStorage.removeItem("role");
    localStorage.removeItem("username");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    // Nuclear option — clears everything:
    // localStorage.clear();

    // Reset auth context state so AppRouter re-evaluates
    if (setUser) setUser(null);

    navigate("/login", { replace: true });
  }, []);

  return null; // renders nothing, redirects immediately
}

// ── Decides which shell to render based on role ───────────────────────────────
function AppRouter() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const role = localStorage.getItem('role');
  console.log(role);
  if (loading) return <Loader />;

  // ✅ Guard: no user at all → show login
  if (!user) {
    return (
      <Routes>
        <Route path="*" element={<Login />} />
      </Routes>
    );
  }

  // Not logged in or admin/teacher → DefaultLayout with all existing routes

  if (role === "student") {
    return (
      <Routes>
        <Route path="/logout" element={<Logout />} />
        <Route path="/student" element={<AppShell />}>
          <Route index element={<Student_Dashboard />} />
          <Route path="dashboard" element={<Student_Dashboard />} />
          <Route path="fees" element={<Student_FeeInvoices />} />
          <Route path="invoice/:id" element={<Student_InvoiceDetail />} />
          <Route path="courses" element={<Student_Courses />} />
          <Route path="timetable" element={<Student_Timetable />} />
          <Route path="diary" element={<Student_Diary />} />
          <Route path="profile" element={<Student_Profile />} />
          <Route path="attendance" element={<Student_Attendance />} />

        </Route>
        <Route path="*" element={<Student_Dashboard />} />
      </Routes>
    );
  }
  return (
    <>
      <Routes>

        {/* Auth */}
        <Route
          path="/login"
          element={
            <>
              <PageTitle title="Login | School Management System" />
              <Login />
            </>
          }
        />

        <Route
          path="/logout"
          element={
            <>
              <PageTitle title="Logging Out | School Management System" />
              <Logout />
            </>
          }
        />

        {/* Student Routes
        <Route path="/student" element={<AppShell />}>

          <Route path="dashboard" element={<Student_Dashboard />} />
          <Route path="fees" element={<Student_FeeInvoices />} />
          <Route path="invoice/:id" element={<Student_InvoiceDetail />} />
          <Route path="courses" element={<Student_Courses />} />
          <Route path="timetable" element={<Student_Timetable />} />
          <Route path="diary" element={<Student_Diary />} />
          <Route path="profile" element={<Student_Profile />} />

        </Route> */}



        {role !== "student" && (
          <Route path="/" element={<DefaultLayout />}>

            <Route
              path="/attendence"
              element={
                <>
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <PageTitle title="Attendence | Oxford Progressive - School Management System" />
                    <AttendanceManagementSystem />
                  </ProtectedRoute>
                </>
              }
            />

            <Route
              path="/timeslots"
              element={
                <>
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <PageTitle title="TimeTable | Oxford Progressive - School Management System" />
                    <Timeslots />
                  </ProtectedRoute>
                </>
              }
            />
            <Route
              path="/studenttimetable"
              element={
                <>
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <PageTitle title="TimeTable | Oxford Progressive - School Management System" />
                    <StudentTimetableWidget />
                  </ProtectedRoute>
                </>
              }
            />
            <Route
              path="/teachertimetable"
              element={
                <>
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <PageTitle title="TimeTable | Oxford Progressive - School Management System" />
                    <TeacherTimetableWidget />
                  </ProtectedRoute>
                </>
              }
            />
            <Route
              path="/timetable"
              element={
                <>
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <PageTitle title="TimeTable | Oxford Progressive - School Management System" />
                    <TimetableBuilder />
                  </ProtectedRoute>
                </>
              }
            />
            <Route
              path="/dashboard"
              element={
                <>
                  <PageTitle title="Dashboard | Oxford Progressive - School Management System" />
                  <ECommerce />
                </>
              }
            />

            <Route
              path="/"
              element={
                <>
                  <PageTitle title="Dashboard | Oxford Progressive - School Management System" />
                  <ECommerce />
                </>
              }
            />
            <Route
              path="/calendar"
              element={
                <>
                  <PageTitle title="Calendar | Oxford Progressive - School Management System" />
                  <Calendar />
                </>
              }
            />
            <Route
              path="/students"
              element={
                <>
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <PageTitle title="Students | Oxoford" />
                    <Students />
                  </ProtectedRoute>
                </>
              }
            />
            <Route
              path="/courses"
              element={
                <>
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <PageTitle title="Courses | Oxoford Progressive" />
                    <Courses />
                  </ProtectedRoute>
                </>
              }
            />
            <Route
              path="/classes"
              element={
                <>
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <PageTitle title="Classes | Oxoford Progressive" />
                    <Classess />
                  </ProtectedRoute>
                </>
              }
            />
            <Route
              path="/teachers"
              element={
                <>
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <PageTitle title="Teachers | Oxoford Progressive" />
                    <Teachers />
                  </ProtectedRoute>
                </>
              }
            />
            <Route
              path="/fees"
              element={
                <>
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <PageTitle title="Fee Invoices | Oxoford Progressive" />
                    <FeeDashboard />
                  </ProtectedRoute>
                </>
              }
            />
            <Route
              path="/fees/payments"
              element={
                <>
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <PageTitle title="Fee Payments | Oxoford Progressive" />
                    <PaymentHistory />
                  </ProtectedRoute>
                </>
              }
            />
            <Route
              path="/fees/invoices"
              element={
                <>
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <PageTitle title="Fee Invoices | Oxoford Progressive" />
                    <InvoiceList />
                  </ProtectedRoute>
                </>
              }
            />
            <Route
              path="/fees/invoices/unpaid-students"
              element={
                <>
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <PageTitle title="Unpaid Student Invoices | Oxoford Progressive" />
                    <UnpaidFeesList />
                  </ProtectedRoute>
                </>
              }
            />
            <Route
              path="/teachers/salaries"
              element={
                <>
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <PageTitle title="Teacher Salaries | Oxoford Progressive" />
                    <TeacherSalaryList />
                  </ProtectedRoute>
                </>
              }
            />
            <Route
              path="/teachers/salaries/pay"
              element={
                <>
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <PageTitle title="Pay Salary | Oxoford Progressive" />
                    <PayTeacherSalary />
                  </ProtectedRoute>
                </>
              }
            />

            {/* Stock Routes */}
            <Route
              path="/stock"
              element={
                <>
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <PageTitle title="Stock Dashboard" />
                    <StockDashboard />
                  </ProtectedRoute>
                </>
              }
            />
            <Route
              path="/stock/items"
              element={
                <>
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <PageTitle title="Pay Salary | Oxoford Progressive" />
                    <StockItemsList />
                  </ProtectedRoute>
                </>
              }
            />
            <Route
              path="/stock/items/add"
              element={
                <>
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <PageTitle title="Pay Salary | Oxoford Progressive" />
                    <AddEditStockItem />
                  </ProtectedRoute>
                </>
              }
            />
            <Route
              path="/stock/items/:id/edit"
              element={
                <>
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <PageTitle title="Pay Salary | Oxoford Progressive" />
                    <AddEditStockItem />
                  </ProtectedRoute>
                </>
              }
            />
            <Route
              path="/stock/suppliers"
              element={
                <>
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <PageTitle title="Pay Salary | Oxoford Progressive" />
                    <SuppliersList />
                  </ProtectedRoute>
                </>
              }
            />
            <Route
              path="/stock/suppliers/add"
              element={
                <>
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <PageTitle title="Pay Salary | Oxoford Progressive" />
                    <AddEditSupplier />
                  </ProtectedRoute>
                </>
              }
            />
            <Route
              path="/stock/suppliers/:id/edit"
              element={
                <>
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <PageTitle title="Pay Salary | Oxoford Progressive" />
                    <AddEditSupplier />
                  </ProtectedRoute>
                </>
              }
            />
            <Route
              path="/stock/purchase"
              element={
                <>
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <PageTitle title="Pay Salary | Oxoford Progressive" />
                    <PurchaseStock />
                  </ProtectedRoute>
                </>
              }
            />
            <Route
              path="/stock/sell"
              element={
                <>
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <PageTitle title="Pay Salary | Oxoford Progressive" />
                    <SellItem />
                  </ProtectedRoute>
                </>
              }
            />
            <Route
              path="/stock/sales"
              element={
                <>
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <PageTitle title="Pay Salary | Oxoford Progressive" />
                    <SalesHistory />
                  </ProtectedRoute>
                </>
              }
            />

            <Route
              path="/teacherattendances"
              element={
                <>
                  <PageTitle title="Teacher Dashboard | School Management System" />
                  <TeacherAttendanceAdmin />
                </>
              }
            />
            <Route
              path="/diary"
              element={
                <>
                  <ProtectedRoute allowedRoles={["teacher", "admin"]}>
                    <PageTitle title="Diary | Oxoford Progressive" />
                    <DiaryPage />
                  </ProtectedRoute>
                </>
              }
            />

            {/* Teacher Routes */}
            <Route
              path="/teacher/dashboard"
              element={
                <>
                  <PageTitle title="Teacher Dashboard | School Management System" />
                  <TeacherDashboard />
                </>
              }
            />
            <Route
              path="/teacher/timetable"
              element={
                <>
                  <PageTitle title="Timetable | School Management System" />
                  <TimetablePage />
                </>
              }
            />
            <Route
              path="/teacher/selfattendance"
              element={
                <>
                  <PageTitle title="Timetable | School Management System" />
                  <TeacherAttendancePage />
                </>
              }
            />
            <Route
              path="/teacher/attendance"
              element={
                <>
                  <PageTitle title="Attendance | School Management System" />
                  <AttendancePage />
                </>
              }
            />
            <Route
              path="/teacher/assignments"
              element={
                <>
                  <PageTitle title="Assignments | School Management System" />
                  <AssignmentsPage />
                </>
              }
            />
            <Route
              path="/teacher/marks"
              element={
                <>
                  <PageTitle title="Marks Entry | School Management System" />
                  <MarksPage />
                </>
              }
            />
            <Route
              path="/teacher/leave"
              element={
                <>
                  <PageTitle title="Leave Management | School Management System" />
                  <LeavePage />
                </>
              }
            />
            <Route
              path="/teacher/notifications"
              element={
                <>
                  <PageTitle title="Notifications | School Management System" />
                  <NotificationsPage />
                </>
              }
            />
            <Route
              path="/teacher/profile"
              element={
                <>
                  <PageTitle title="Profile | School Management System" />
                  <ProfilePage />
                </>
              }
            />
            <Route
              path="/profile"
              element={
                <>
                  <PageTitle title="Profile | Oxford Progressive - School Management System" />
                  <Profile />
                </>
              }
            />
            <Route
              path="/forms/form-elements"
              element={
                <>
                  <PageTitle title="Form Elements | Oxford Progressive - School Management System" />
                  <FormElements />
                </>
              }
            />
            <Route
              path="/forms/form-layout"
              element={
                <>
                  <PageTitle title="Form Layout | Oxford Progressive - School Management System" />
                  <FormLayout />
                </>
              }
            />
            <Route
              path="/tables"
              element={
                <>
                  <PageTitle title="Tables | Oxford Progressive - School Management System" />
                  <Tables />
                </>
              }
            />
            <Route
              path="/settings"
              element={
                <>
                  <PageTitle title="Settings | Oxford Progressive - School Management System" />
                  <Settings />
                </>
              }
            />
            <Route
              path="/chart"
              element={
                <>
                  <PageTitle title="Basic Chart | Oxford Progressive - School Management System" />
                  <Chart />
                </>
              }
            />
            <Route
              path="/ui/alerts"
              element={
                <>
                  <PageTitle title="Alerts | Oxford Progressive - School Management System" />
                  <Alerts />
                </>
              }
            />
            <Route
              path="/ui/buttons"
              element={
                <>
                  <PageTitle title="Buttons | Oxford Progressive - School Management System" />
                  <Buttons />
                </>
              }
            />
            <Route
              path="/auth/signin"
              element={
                <>
                  <PageTitle title="Signin | Oxford Progressive - School Management System" />
                  <SignIn />
                </>
              }
            />
            <Route
              path="/auth/signup"
              element={
                <>
                  <PageTitle title="Signup | Oxford Progressive - School Management System" />
                  <SignUp />
                </>
              }
            />
          </Route>
        )}
      </Routes>
    </>
  );
}

// ── App root ──────────────────────────────────────────────────────────────────
function App() {
  const [loading, setLoading] = useState(true);
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  if (loading) return <Loader />;

  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}

export default App;