import React from 'react';
import ReminderItem from './ReminderItem';
import './ReminderList.css';

const ReminderList = ({ reminders, onDelete }) => {
  return (
    <div className="reminders">
      <h2>Set Reminder</h2>
      <div className="reminder-list">
        {reminders.length > 0 ? (
          reminders.map((reminder) => (
            <ReminderItem 
              key={reminder.id} 
              reminder={reminder} 
              onDelete={onDelete} 
            />
          ))
        ) : (
          <p>No reminders to show</p>
        )}
      </div>
    </div>
  );
};

export default ReminderList;