import React from 'react';

/**
 * Generic reusable table.
 * Props:
 *   columns: [{ key, label, render? }]
 *   data: []
 *   loading: bool
 *   emptyMessage: string
 */
const StockTable = ({ columns, data = [], loading = false, emptyMessage = 'No records found.' }) => {
  return (
    <div className="stock-table-wrapper">
      <table className="stock-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={columns.length} className="stock-table__loading">
                <div className="stock-spinner" />
                Loading...
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="stock-table__empty">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, idx) => (
              <tr key={row._id || idx}>
                {columns.map((col) => (
                  <td key={col.key}>
                    {col.render ? col.render(row[col.key], row) : row[col.key] ?? '—'}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default StockTable;