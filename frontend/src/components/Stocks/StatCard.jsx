import React from 'react';

/**
 * Props: title, value, icon, color ('primary'|'success'|'warning'|'danger'|'info'), sub
 */
const StatCard = ({ title, value, icon, color = 'primary', sub }) => {
  return (
    <div className={`stat-card stat-card--${color}`}>
      <div className="stat-card__body">
        <p className="stat-card__title">{title}</p>
        <h3 className="stat-card__value">{value}</h3>
        {sub && <p className="stat-card__sub">{sub}</p>}
      </div>
      {icon && <div className="stat-card__icon">{icon}</div>}
    </div>
  );
};

export default StatCard;