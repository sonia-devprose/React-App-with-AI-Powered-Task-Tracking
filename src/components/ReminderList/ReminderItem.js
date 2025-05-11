import React from 'react';

const ReminderItem = ({ reminder, onDelete }) => {
  return (
    <div className="reminder-item">
      <div>
        <h3>{reminder.text}</h3>
        <p>{reminder.dayTime}</p>
      </div>
      <button 
        onClick={() => onDelete(reminder.id)}
        className="btn-delete"
      >
        X
      </button>
    </div>
  );
};

export default ReminderItem;