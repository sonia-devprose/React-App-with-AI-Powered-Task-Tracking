// TaskForm.js
import React, { useState, useEffect } from 'react';
import { getSmartSuggestions } from '../../utils/aiService';
import './TaskForm.css';

const TaskForm = ({ onAdd, onCancel, isProcessing }) => {
  const [task, setTask] = useState('');
  const [dayTime, setDayTime] = useState('');
  const [error, setError] = useState('');
  const [suggestions, setSuggestions] = useState({ time: [], description: [] });
  const [isFetching, setIsFetching] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);

  useEffect(() => {
    return () => {
      if (typingTimeout) clearTimeout(typingTimeout);
    };
  }, [typingTimeout]);

  const handleTaskChange = async (e) => {
    const newTask = e.target.value;
    setTask(newTask);
    setError('');

    if (typingTimeout) clearTimeout(typingTimeout);
    
    if (newTask.trim().length > 3) {
      setIsFetching(true);
      setTypingTimeout(
        setTimeout(async () => {
          try {
            const newSuggestions = await getSmartSuggestions(newTask);
            setSuggestions(newSuggestions);
          } catch (err) {
            console.error("Suggestions error:", err);
            setError('Failed to get suggestions. You can still create the task.');
          } finally {
            setIsFetching(false);
          }
        }, 1500)
      );
    } else {
      setSuggestions({ time: [], description: [] });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!task.trim()) {
      setError('Task description is required');
      return;
    }

    if (task.length > 500) {
      setError('Task description is too long (max 500 characters)');
      return;
    }

    if (!dayTime.trim()) {
      setError('Please specify when this should be done');
      return;
    }

    onAdd({ task, dayTime });
  };

  const applySuggestion = (desc, time = '') => {
    setTask(desc);
    if (time) setDayTime(time);
    setSuggestions({ time: [], description: [] });
  };

  return (
    <div className="task-form">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="task-input">Task Description</label>
          <input
            id="task-input"
            type="text"
            placeholder="What needs to be done?"
            value={task}
            onChange={handleTaskChange}
            disabled={isProcessing}
            aria-describedby="task-help"
          />
          <small id="task-help" className="help-text">
            Start typing to get AI suggestions
          </small>

          {isFetching && (
            <div className="loading-indicator">
              <span>Getting suggestions...</span>
            </div>
          )}
          
          {suggestions.description.length > 0 && (
            <div className="suggestions-dropdown">
              <div className="suggestion-header">AI Suggestions</div>
              {suggestions.description.map((desc, i) => (
                <button
                  type="button"
                  key={`suggestion-${i}`}
                  className="suggestion-item"
                  onClick={() => applySuggestion(desc, suggestions.time[i])}
                >
                  <div className="suggestion-text">{desc}</div>
                  {suggestions.time[i] && (
                    <div className="suggestion-time">
                      {suggestions.time[i]}
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="daytime-input">Day & Time</label>
          <input
            id="daytime-input"
            type="text"
            placeholder="When? (e.g. Tomorrow 2pm)"
            value={dayTime}
            onChange={(e) => setDayTime(e.target.value)}
            disabled={isProcessing}
          />
        </div>

        {error && (
          <div className="error-message" role="alert">
            {error}
          </div>
        )}

        <div className="form-actions">
          <button
            type="button"
            className="secondary-btn"
            onClick={onCancel}
            disabled={isProcessing}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="primary-btn"
            disabled={isProcessing || !task.trim() || !dayTime.trim()}
          >
            {isProcessing ? 'Saving...' : 'Save Reminder'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TaskForm;