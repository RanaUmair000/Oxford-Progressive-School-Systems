import { useEffect, useState } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';

import Loader from './common/Loader';
import PageTitle from './components/PageTitle';
import SignIn from './pages/Authentication/SignIn';
import SignUp from './pages/Authentication/SignUp';
import Calendar from './pages/Calendar';
// @ts-ignore
import Students from './pages/Students/Students';
import Courses from './pages/Courses/Courses';
import Classess from './pages/Classess/Classes';
import Teachers from './pages/Teachers/Teachers';
import FeeDashboard from './Components/Fees/feeDashboard';
import InvoiceList from './Components/Fees/invoiceList';
import PaymentHistory from './Components/Fees/paymentHistory';
import UnpaidFeesList from './Components/Fees/unpaidStudents';
import TeacherSalaryList from './Components/Teachers/teacherSalaries';
import PayTeacherSalary from './Components/Teachers/paySalary';
import AttendanceManagementSystem from './pages/Attendence/AttendenceSystem';
import Timeslots from './components/Timetable/TimeSlotManager';
import TimetableBuilder from './components/Timetable/TimetableBuilder';
import StudentTimetableWidget from './components/Timetable/StudentTimetableWidget.jsx';
import TeacherTimetableWidget from './components/Timetable/TeacherTimetableWidget.jsx';
import DiaryPage from './pages/Diary';
import TeacherAttendanceAdmin from './pages/TeacherAttendanceAdminPage';

import StockDashboard   from './components/Stocks/StockDashboard';
import StockItemsList   from './components/Stocks/StockItemsList';
import AddEditStockItem from './components/Stocks/AddEditStockItem';
import SuppliersList    from './components/Stocks/SuppliersList';
import AddEditSupplier  from './components/Stocks/AddEditSupplier';
import PurchaseStock    from './components/Stocks/PurchaseStock';
import SellItem         from './components/Stocks/SellItem';
import SalesHistory     from './components/Stocks/SalesHistory';


import Chart from './pages/Chart';
import ECommerce from './pages/Dashboard/ECommerce';
import FormElements from './pages/Form/FormElements';
import FormLayout from './pages/Form/FormLayout';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Tables from './pages/Tables';
import Alerts from './pages/UiElements/Alerts';
import Buttons from './pages/UiElements/Buttons';
import DefaultLayout from './layout/DefaultLayout';

import TeacherLayout from './components/Teachers/TeacherLayout';
import TeacherDashboard from './pages/Teachers/TeacherDashboard';
import TimetablePage from './pages/Teachers/TimetablePage';
import AttendancePage from './pages/Teachers/AttendancePage';
import AssignmentsPage from './pages/Teachers/AssignmentsPage';
import MarksPage from './pages/Teachers/MarksPage';
import LeavePage from './pages/Teachers/LeavePage';
import NotificationsPage from './pages/Teachers/NotificationsPage';
import ProfilePage from './pages/Teachers/ProfilePage';
import Login from './pages/LoginPage.jsx';
import ProtectedRoute from "./components/ProtectedRoute";
import TeacherAttendancePage from "./pages/Teachers/teacherAttendancePage.jsx";

function App() {
  const [loading, setLoading] = useState<boolean>(true);
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  return loading ? (
    <Loader />
  ) : (
    <>
      {/* Auth Routes */}
      <Routes>
        <Route
          path="/login"
          element={
            <>
              <PageTitle title="Login | School Management System" />
              <Login />
            </>
          }
        />
      </Routes>

      <DefaultLayout>

        {/* Admin Routes */}
        <Routes>
          <Route
            path="/attendence"
            element={
              <>
                <ProtectedRoute allowedRoles={["admin"]}>
                  <PageTitle title="Attendence | TailAdmin - Tailwind CSS Admin Dashboard Template" />
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
                  <PageTitle title="TimeTable | TailAdmin - Tailwind CSS Admin Dashboard Template" />
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
                  <PageTitle title="TimeTable | TailAdmin - Tailwind CSS Admin Dashboard Template" />
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

                  <PageTitle title="TimeTable | TailAdmin - Tailwind CSS Admin Dashboard Template" />
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

                  <PageTitle title="TimeTable | TailAdmin - Tailwind CSS Admin Dashboard Template" />
                  <TimetableBuilder />
                </ProtectedRoute>
              </>
            }
          />
          <Route
            index
            element={
              <>
                <PageTitle title="eCommerce Dashboard | TailAdmin - Tailwind CSS Admin Dashboard Template" />
                <ECommerce />
              </>
            }
          />
          <Route
            path="/calendar"
            element={
              <>
                <PageTitle title="Calendar | TailAdmin - Tailwind CSS Admin Dashboard Template" />
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
          

          //Stock Routes
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
                <PageTitle title="Profile | TailAdmin - Tailwind CSS Admin Dashboard Template" />
                <Profile />
              </>
            }
          />



          <Route
            path="/forms/form-elements"
            element={
              <>
                <PageTitle title="Form Elements | TailAdmin - Tailwind CSS Admin Dashboard Template" />
                <FormElements />
              </>
            }
          />
          <Route
            path="/forms/form-layout"
            element={
              <>
                <PageTitle title="Form Layout | TailAdmin - Tailwind CSS Admin Dashboard Template" />
                <FormLayout />
              </>
            }
          />
          <Route
            path="/tables"
            element={
              <>
                <PageTitle title="Tables | TailAdmin - Tailwind CSS Admin Dashboard Template" />
                <Tables />
              </>
            }
          />
          <Route
            path="/settings"
            element={
              <>
                <PageTitle title="Settings | TailAdmin - Tailwind CSS Admin Dashboard Template" />
                <Settings />
              </>
            }
          />
          <Route
            path="/chart"
            element={
              <>
                <PageTitle title="Basic Chart | TailAdmin - Tailwind CSS Admin Dashboard Template" />
                <Chart />
              </>
            }
          />
          <Route
            path="/ui/alerts"
            element={
              <>
                <PageTitle title="Alerts | TailAdmin - Tailwind CSS Admin Dashboard Template" />
                <Alerts />
              </>
            }
          />
          <Route
            path="/ui/buttons"
            element={
              <>
                <PageTitle title="Buttons | TailAdmin - Tailwind CSS Admin Dashboard Template" />
                <Buttons />
              </>
            }
          />
          <Route
            path="/auth/signin"
            element={
              <>
                <PageTitle title="Signin | TailAdmin - Tailwind CSS Admin Dashboard Template" />
                <SignIn />
              </>
            }
          />
          <Route
            path="/auth/signup"
            element={
              <>
                <PageTitle title="Signup | TailAdmin - Tailwind CSS Admin Dashboard Template" />
                <SignUp />
              </>
            }
          />
        </Routes>
      </DefaultLayout>
    </>
  );

}

export default App;
