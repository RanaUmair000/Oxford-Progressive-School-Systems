# Stock / Inventory Module — Integration Guide

## 1. Backend File Placement

```
your-project/
├── models/
│   └── stock/                         ← CREATE this folder
│       ├── StockItem.js               ← from backend/models/StockItem.js
│       ├── Supplier.js                ← from backend/models/Supplier.js
│       ├── StockPurchase.js           ← from backend/models/StockPurchase.js
│       └── StockSale.js               ← from backend/models/StockSale.js
│
├── controllers/
│   └── stock/                         ← CREATE this folder
│       ├── stockItemController.js     ← from backend/controllers/
│       ├── supplierController.js
│       ├── stockPurchaseController.js
│       ├── stockSaleController.js
│       └── stockDashboardController.js
│
└── routes/
    └── stockRoutes.js                 ← from backend/routes/stockRoutes.js
```

## 2. Register the Route in your Express app

In your main `server.js` or `app.js`, add ONE line:

```js
const stockRoutes = require('./routes/stockRoutes');
app.use('/api/stock', stockRoutes);
```

## 3. Fix the Counter import in stockSaleController.js

The sale controller reuses your existing invoice counter. Update the path:

```js
// Change this line to match where your Counter model actually lives:
const Counter = require('../fees/Counter');
// e.g. if it's at models/Counter.js:
const Counter = require('../../models/Counter');
```

## 4. Frontend File Placement

```
src/
├── modules/
│   └── stock/                         ← CREATE this folder
│       ├── pages/
│       │   ├── StockDashboard.jsx
│       │   ├── StockItemsList.jsx
│       │   ├── AddEditStockItem.jsx
│       │   ├── SuppliersList.jsx
│       │   ├── AddEditSupplier.jsx
│       │   ├── PurchaseStock.jsx
│       │   ├── SellItem.jsx
│       │   └── SalesHistory.jsx
│       ├── components/
│       │   ├── StockTable.jsx
│       │   ├── StatCard.jsx
│       │   └── LowStockBadge.jsx
│       ├── services/
│       │   └── stockService.js
│       ├── utils/
│       │   └── stockHelpers.js
│       ├── stockRoutes.jsx
│       └── stock.css
```

## 5. Register Routes in React Router

In your existing `App.jsx` (or wherever your routes are defined):

```jsx
import { stockRoutes } from './modules/stock/stockRoutes';

// Inside your <Routes>:
<Routes>
  {/* your existing routes */}
  <Route path="/dashboard" element={<Dashboard />} />
  
  {/* add stock routes */}
  {stockRoutes}
</Routes>
```

## 6. Import the CSS

In your main `index.js` or `App.jsx`:

```js
import './modules/stock/stock.css';
```

## 7. Wire Up the Student Search in SellItem.jsx

The `SellItem.jsx` page has a placeholder for your student API.
Find this comment and replace with your actual student service call:

```jsx
// Replace this block:
fetch(`/api/students?search=${studentSearch}&limit=30`)
  .then((r) => r.json())
  .then((r) => setStudents(r.data || []))

// With your existing service, e.g.:
import { getStudents } from '../../students/services/studentService';
getStudents({ search: studentSearch }).then(r => setStudents(r.data.data));
```

## 8. Add to Sidebar Navigation

Add these links to your existing sidebar component:

```jsx
// Stock section
{ label: 'Stock Dashboard',  path: '/stock',            icon: 'chart' },
{ label: 'Stock Items',      path: '/stock/items',      icon: 'box' },
{ label: 'Suppliers',        path: '/stock/suppliers',  icon: 'truck' },
{ label: 'Purchase Stock',   path: '/stock/purchase',   icon: 'download' },
{ label: 'Sell Item',        path: '/stock/sell',       icon: 'shopping-cart' },
{ label: 'Sales History',    path: '/stock/sales',      icon: 'list' },
```

## 9. New Invoice Type

The stock sale creates invoices with `invoiceType: 'stock_sale'`.  
If your FeeInvoice schema has an enum for `invoiceType`, add `'stock_sale'` to it:

```js
// In models/fees/FeeInvoice.js
invoiceType: {
  type: String,
  enum: ['monthly', 'annual', 'event', 'manual', 'stock_sale'],  // ← add this
}
```

That's it — no other changes needed to your existing code.