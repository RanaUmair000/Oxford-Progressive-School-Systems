# School Management Fee System

A comprehensive, production-ready School Management Fee System built with React, Node.js, Express, and MongoDB. This system follows real-world ERP standards and provides a complete solution for managing student fees, invoices, and payments.

## 🎯 Features

### Invoice Management
- **Monthly Fee Generation**: Bulk generate monthly invoices for entire classes or all students
- **Student-Specific Invoices**: Create custom invoices for individual students
- **Event-Based Invoices**: Generate invoices for school events and activities
- **Invoice Types**: Support for monthly, event, and manual invoice types
- **Duplicate Prevention**: Automatic prevention of duplicate monthly invoices

### Payment Processing
- **Multiple Payment Methods**: Cash, bank transfer, cheque, online, and card payments
- **Partial Payments**: Support for partial payment submissions
- **Automatic Status Updates**: Invoice status automatically updates based on payments
- **Payment History**: Complete payment tracking with receipt generation
- **Payment Receipts**: Professional receipt generation with all payment details

### Advanced Features
- **Advanced Filtering**: Search and filter invoices by student, class, month, status, and type
- **Fee Status Checker**: Quick lookup of student fee status with comprehensive history
- **Real-time Calculations**: Automatic calculation of totals, paid amounts, and balances
- **Professional UI**: Beautiful, intuitive interface following consistent design patterns
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices

## 🏗️ Architecture

### Backend Structure
```
backend/
├── models/
│   ├── FeeInvoice.js      # Invoice schema with auto-status updates
│   └── FeePayment.js       # Payment schema with receipt generation
├── controllers/
│   ├── feeInvoiceController.js  # Invoice business logic
│   └── feePaymentController.js  # Payment business logic
└── routes/
    └── feeRoutes.js        # API endpoints
```

### Frontend Structure
```
frontend/src/
├── components/
│   └── Fees/
│       ├── FeeDashboard.jsx           # Main dashboard with action cards
│       ├── InvoiceList.jsx            # Invoice listing with filters
│       ├── PaymentHistory.jsx         # Payment history view
│       └── Modals/
│           ├── GenerateMonthlyModal.jsx
│           ├── CreateStudentInvoiceModal.jsx
│           ├── CreateEventInvoiceModal.jsx
│           ├── CheckFeeStatusModal.jsx
│           ├── SubmitPaymentModal.jsx
│           └── InvoiceDetailsModal.jsx
└── services/
    └── feeService.js       # API service layer with helper functions
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### Backend Setup

1. **Install Dependencies**
```bash
cd backend
npm install express mongoose cors dotenv
```

2. **Environment Variables**
Create a `.env` file in the backend directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/school-management
```

3. **Start the Server**
```bash
npm start
```

### Frontend Setup

1. **Install Dependencies**
```bash
cd frontend
npm install axios react-router-dom react-icons
```

2. **Start Development Server**
```bash
npm start
```

## 📡 API Endpoints

### Invoice Endpoints
- `POST /api/fees/invoices/generate-monthly` - Generate monthly invoices in bulk
- `POST /api/fees/invoices/student` - Create invoice for specific student
- `POST /api/fees/invoices/generate-event` - Generate event-based invoices
- `GET /api/fees/invoices` - Get all invoices with filtering
- `GET /api/fees/invoices/:id` - Get single invoice with payment history
- `DELETE /api/fees/invoices/:id` - Delete invoice (with validation)
- `GET /api/fees/students/fee-status` - Get student fee status

### Payment Endpoints
- `POST /api/fees/payments` - Submit a payment
- `GET /api/fees/payments` - Get all payments with filtering
- `GET /api/fees/payments/:id` - Get payment details
- `GET /api/fees/payments/:id/receipt` - Get payment receipt data
- `DELETE /api/fees/payments/:id` - Void a payment
- `GET /api/fees/payments/stats/summary` - Get payment statistics

## 🎨 Design System

The system follows a consistent design language:

### Colors
- **Primary**: Blue (`bg-primary`)
- **Success**: Green (`bg-green-500`)
- **Warning**: Orange (`bg-orange-500`)
- **Danger**: Red (`bg-red-500`)
- **Info**: Indigo (`bg-indigo-500`)

### Status Colors
- **Paid**: Green
- **Partially Paid**: Yellow/Orange
- **Unpaid**: Red

### Components
- Consistent card-based layouts
- Action buttons with hover effects
- Modal overlays for data entry
- Responsive tables with alternating row colors
- Badge components for status indicators

## 🔐 Security Considerations

### Implemented
- Input validation on both frontend and backend
- Mongoose schema validation
- Duplicate prevention for monthly invoices
- Payment amount validation against remaining balance
- Delete restrictions for invoices with payments

### Recommended for Production
- JWT authentication and authorization
- Role-based access control (admin, accountant, viewer)
- API rate limiting
- Request logging and audit trails
- Password hashing for user accounts
- HTTPS/SSL certificates
- Environment variable protection

## 📊 Database Schema

### FeeInvoice
```javascript
{
  student: ObjectId (ref: Student),
  class: ObjectId (ref: Class),
  invoiceNumber: String (auto-generated),
  invoiceType: String (monthly/event/manual),
  title: String,
  month: Date (optional),
  feeItems: [{ title, amount, description }],
  totalAmount: Number,
  paidAmount: Number,
  dueDate: Date,
  status: String (unpaid/partially_paid/paid),
  createdBy: ObjectId (ref: User),
  notes: String
}
```

### FeePayment
```javascript
{
  invoice: ObjectId (ref: FeeInvoice),
  student: ObjectId (ref: Student),
  receiptNumber: String (auto-generated),
  amount: Number,
  paymentMethod: String,
  paymentDate: Date,
  transactionId: String (optional),
  chequeNumber: String (optional),
  bankName: String (optional),
  notes: String,
  receivedBy: ObjectId (ref: User)
}
```

## 🎯 Key Features Implementation

### Automatic Status Updates
Invoices automatically update their status based on payment activity:
- `unpaid`: No payments received
- `partially_paid`: Some payment received but less than total
- `paid`: Full amount received

### Invoice Number Generation
Format: `INV-YYYY-XXXXXX`
- YYYY: Current year
- XXXXXX: 6-digit sequential number

### Receipt Number Generation
Format: `RCP-YYYY-XXXXXX`
- YYYY: Current year
- XXXXXX: 6-digit sequential number

### Duplicate Prevention
The system uses compound indexes to prevent duplicate monthly invoices:
```javascript
{ student: 1, month: 1, invoiceType: 1 }
```

## 🔄 Future Enhancements

1. **Discounts & Scholarships**: Support for percentage/fixed discounts
2. **Late Payment Fines**: Automatic calculation of late fees
3. **Online Payment Gateway**: Integration with payment processors
4. **Email Notifications**: Automated email for invoice generation and reminders
5. **SMS Notifications**: SMS alerts for payment confirmations
6. **Advanced Reporting**: Detailed financial reports and analytics
7. **Multi-currency Support**: Handle multiple currencies
8. **Installment Plans**: Support for payment in installments
9. **Bulk Payment Import**: Import payments from Excel/CSV
10. **Mobile App**: Native mobile application for parents

## 📝 Usage Examples

### Generate Monthly Invoices
```javascript
POST /api/fees/invoices/generate-monthly
{
  "classId": "all",  // or specific class ID
  "month": 1,
  "year": 2025,
  "dueDate": "2025-01-31",
  "feeItems": [
    { "title": "Tuition Fee", "amount": 5000 },
    { "title": "Lab Fee", "amount": 1000 }
  ]
}
```

### Submit Payment
```javascript
POST /api/fees/payments
{
  "invoiceId": "invoice_id_here",
  "amount": 3000,
  "paymentMethod": "cash",
  "paymentDate": "2025-01-28",
  "notes": "Partial payment"
}
```

## 🤝 Contributing

This is a production-ready template. Feel free to customize and extend based on your specific requirements.

## 📄 License

This project is provided as-is for educational and commercial use.

## 🙏 Acknowledgments

Built following real-world ERP standards and best practices for school management systems.

---

**Note**: This system is designed to be scalable and maintainable. All components follow separation of concerns, making it easy to add new features or modify existing ones.