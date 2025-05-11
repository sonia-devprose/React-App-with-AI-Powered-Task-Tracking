// App.js
import React, { useState, useEffect } from 'react';
import Header from './components/Header/Header';
import TaskForm from './components/TaskForm/TaskForm';
import ReminderList from './components/ReminderList/ReminderList';
import Footer from './components/Footer/Footer';
import { categorizeAndPrioritize } from './utils/aiService';
import './App.css';

function App() {
  const [reminders, setReminders] = useState(() => {
    try {
      const saved = localStorage.getItem('reminders');
      return saved ? JSON.parse(saved) : [
        { 
          id: 1, 
          text: 'Doctors Appointment', 
          dayTime: 'Feb 5th at 2:30pm', 
          reminder: true, 
          category: 'Health', 
          priority: 'High',
          createdAt: new Date().toISOString()
        }
      ];
    } catch (error) {
      console.error("Failed to load reminders:", error);
      return [];
    }
  });

  const [showAddTask, setShowAddTask] = useState(false);
  const [aiStatus, setAiStatus] = useState({ 
    loading: false, 
    error: null,
    lastAction: null
  });

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('reminders', JSON.stringify(reminders));
    } catch (error) {
      console.error("Failed to save reminders:", error);
    }
  }, [reminders]);

  const addReminder = async ({ task, dayTime }) => {
    setAiStatus({ loading: true, error: null, lastAction: 'add' });
    
    try {
      const { category, priority } = await categorizeAndPrioritize(task);
      const newReminder = {
        id: Date.now(),
        text: task,
        dayTime,
        reminder: true,
        category,
        priority,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      setReminders(prev => [...prev, newReminder]);
      setShowAddTask(false);
    } catch (error) {
      console.error("Failed to categorize task:", error);
      
      // Fallback reminder without AI data
      const newReminder = {
        id: Date.now(),
        text: task,
        dayTime,
        reminder: true,
        category: 'Other',
        priority: 'Medium',
        createdAt: new Date().toISOString()
      };
      
      setReminders(prev => [...prev, newReminder]);
      setAiStatus({ 
        loading: false, 
        error: 'AI analysis failed - using default category',
        lastAction: 'add'
      });
    } finally {
      setAiStatus(prev => ({ ...prev, loading: false }));
    }
  };

  const deleteReminder = (id) => {
    setReminders(prev => prev.filter(reminder => reminder.id !== id));
  };

  const deleteAllReminders = () => {
    if (window.confirm('Are you sure you want to delete ALL reminders? This cannot be undone.')) {
      setReminders([]);
    }
  };

  const toggleReminder = (id) => {
    setReminders(prev =>
      prev.map(reminder =>
        reminder.id === id
          ? { 
              ...reminder, 
              reminder: !reminder.reminder,
              updatedAt: new Date().toISOString()
            }
          : reminder
      )
    );
  };

  return (
    <div className="container">
      <Header
        onAdd={() => setShowAddTask(!showAddTask)}
        showAdd={showAddTask}
      />
      
      {aiStatus.error && (
        <div className={`ai-status ${aiStatus.lastAction}`}>
          {aiStatus.error}
          <button onClick={() => setAiStatus(prev => ({ ...prev, error: null }))}>
            ×
          </button>
        </div>
      )}

      {showAddTask && (
        <TaskForm 
          onAdd={addReminder}
          onCancel={() => setShowAddTask(false)}
          isProcessing={aiStatus.loading}
        />
      )}

      <ReminderList
        reminders={reminders}
        onDelete={deleteReminder}
        onToggle={toggleReminder}
      />
      
      <Footer />
    </div>
  );
}

export default App;