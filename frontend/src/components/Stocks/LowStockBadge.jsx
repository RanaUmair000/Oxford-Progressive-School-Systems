import React from 'react';

const LowStockBadge = ({ qty, min }) => {
  if (qty <= 0) return <span className="badge badge--danger">Out of Stock</span>;
  if (qty <= min) return <span className="badge badge--warning">Low Stock</span>;
  return <span className="badge badge--success">In Stock</span>;
};

export default LowStockBadge;