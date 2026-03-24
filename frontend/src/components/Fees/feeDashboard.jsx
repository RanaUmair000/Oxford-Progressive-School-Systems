import { useState, useEffect } from 'react';
import { FiDollarSign, FiUsers, FiCalendar, FiSearch, FiFileText, FiTrendingUp } from 'react-icons/fi';
import Modal from '../Modal/modal';
import GenerateAnnualModal from './Modals/generateAnnualModal';
import GenerateMonthlyModal from './Modals/GenerateMonthlyModal';
import CreateStudentInvoiceModal from './Modals/CreateStudentInvoiceModal';
import CreateEventInvoiceModal from './Modals/CreateEventInvoiceModal';
import CheckFeeStatusModal from './Modals/CheckFeeStatusModal';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
const apiUrl = import.meta.env.VITE_API_URL;


const FeeDashboard = () => {
  const [openModal, setOpenModal] = useState(null);
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalInvoices: 0,
    pendingAmount: 0,
    collectedToday: 0,
    overdueCount: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get(`${apiUrl}/api/fees/invoices/dashboard`);
        setStats(res.data.data);
      } catch (error) {
        console.error('Failed to load fee stats', error);
      }
    };

    fetchStats();
  }, []);

  const actionCards = [
    {
      id: 'monthly',
      title: 'Generate Monthly Invoices',
      description: 'Create monthly fee invoices for classes or all students',
      icon: FiCalendar,
      color: 'from-blue-500 to-blue-600',
      hoverColor: 'hover:from-blue-600 hover:to-blue-700',
      action: () => setOpenModal('monthly')
    },
    {
      id: 'annual',
      title: 'Generate Annual Invoices',
      description: 'Create annual fee invoices for classes or all students',
      icon: FiCalendar,
      color: 'from-blue-500 to-blue-600',
      hoverColor: 'hover:from-blue-600 hover:to-blue-700',
      action: () => setOpenModal('annual')
    },
    {
      id: 'student',
      title: 'Create Student Invoice',
      description: 'Generate custom invoice for a specific student',
      icon: FiFileText,
      color: 'from-purple-500 to-purple-600',
      hoverColor: 'hover:from-purple-600 hover:to-purple-700',
      action: () => setOpenModal('student')
    },
    {
      id: 'event',
      title: 'Create Event Invoice',
      description: 'Generate invoices for school events and activities',
      icon: FiUsers,
      color: 'from-green-500 to-green-600',
      hoverColor: 'hover:from-green-600 hover:to-green-700',
      action: () => setOpenModal('event')
    },
    {
      id: 'invoices',
      title: 'View All Unpaid Invoices',
      description: 'Browse and manage all unpaid invoices',
      icon: FiDollarSign,
      color: 'from-indigo-500 to-indigo-600',
      hoverColor: 'hover:from-indigo-600 hover:to-indigo-700',
      action: () => navigate('/fees/invoices/unpaid-students')
    },
    {
      id: 'status',
      title: 'Check Fee Status',
      description: 'Search and view student fee status and history',
      icon: FiSearch,
      color: 'from-orange-500 to-orange-600',
      hoverColor: 'hover:from-orange-600 hover:to-orange-700',
      action: () => setOpenModal('status')
    },
    {
      id: 'invoices',
      title: 'View All Invoices',
      description: 'Browse and manage all generated invoices',
      icon: FiDollarSign,
      color: 'from-indigo-500 to-indigo-600',
      hoverColor: 'hover:from-indigo-600 hover:to-indigo-700',
      action: () => navigate('/fees/invoices')
    },
    {
      id: 'payments',
      title: 'Payment History',
      description: 'View all payments and generate receipts',
      icon: FiTrendingUp,
      color: 'from-teal-500 to-teal-600',
      hoverColor: 'hover:from-teal-600 hover:to-teal-700',
      action: () => navigate('/fees/payments')
    }
  ];

  return (
    <>
      <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-10 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-black dark:text-white mb-2">
            Fee Management System
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Manage student fees, generate invoices, and track payments
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
          <div className="rounded-lg border border-stroke bg-gray-50 dark:border-strokedark dark:bg-meta-4 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Invoices</p>
                <p className="text-2xl font-bold text-black dark:text-white mt-1">{stats.totalInvoices}</p>
              </div>
              <FiFileText className="text-blue-500" size={32} />
            </div>
          </div>

          <div className="rounded-lg border border-stroke bg-gray-50 dark:border-strokedark dark:bg-meta-4 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Pending Amount</p>
                <p className="text-2xl font-bold text-black dark:text-white mt-1">Rs {stats.pendingAmount.toLocaleString()}</p>
              </div>
              <FiDollarSign className="text-orange-500" size={32} />
            </div>
          </div>

          <div className="rounded-lg border border-stroke bg-gray-50 dark:border-strokedark dark:bg-meta-4 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Collected Today</p>
                <p className="text-2xl font-bold text-black dark:text-white mt-1">Rs {stats.collectedToday.toLocaleString()}</p>
              </div>
              <FiTrendingUp className="text-green-500" size={32} />
            </div>
          </div>

          <div className="rounded-lg border border-stroke bg-gray-50 dark:border-strokedark dark:bg-meta-4 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Overdue</p>
                <p className="text-2xl font-bold text-black dark:text-white mt-1">{stats.overdueCount}</p>
              </div>
              <FiCalendar className="text-red-500" size={32} />
            </div>
          </div>
        </div>
        {/* Action Cards Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {actionCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.id}
                onClick={card.action}
                className={`group cursor-pointer rounded-lg bg-gradient-to-br ${card.color} ${card.hoverColor} p-6 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="rounded-full bg-white bg-opacity-20 p-3">
                    <Icon className="text-white" size={28} />
                  </div>
                  <div className="rounded-full bg-white bg-opacity-20 px-3 py-1">
                    <span className="text-xs font-semibold text-white">Action</span>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-white mb-2">
                  {card.title}
                </h3>

                <p className="text-sm text-white text-opacity-90">
                  {card.description}
                </p>

                <div className="mt-4 flex items-center text-white">
                  <span className="text-sm font-medium">Click to proceed</span>
                  <svg
                    className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* Modals */}
      <Modal isOpen={openModal === 'annual'} onClose={() => setOpenModal(null)}>
        <GenerateAnnualModal onClose={() => setOpenModal(null)} />
      </Modal>

      <Modal isOpen={openModal === 'monthly'} onClose={() => setOpenModal(null)}>
        <GenerateMonthlyModal onClose={() => setOpenModal(null)} />
      </Modal>

      <Modal isOpen={openModal === 'student'} onClose={() => setOpenModal(null)}>
        <CreateStudentInvoiceModal onClose={() => setOpenModal(null)} />
      </Modal>

      <Modal isOpen={openModal === 'event'} onClose={() => setOpenModal(null)}>
        <CreateEventInvoiceModal onClose={() => setOpenModal(null)} />
      </Modal>

      <Modal isOpen={openModal === 'status'} onClose={() => setOpenModal(null)}>
        <CheckFeeStatusModal onClose={() => setOpenModal(null)} />
      </Modal>
    </>
  );
};

export default FeeDashboard;