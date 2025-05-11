import './Header.css';

const Header = ({ onAdd, onDeleteAll, showAdd }) => {
  return (
    <header className="header">
      <div className="header-title">
        <h1>FocusBoard</h1>
        <p className="tagline">Manage your tasks with ease 😎!</p>
      </div>

      <div className="header-buttons">
        <button 
          onClick={onAdd}
          className={`btn ${showAdd ? 'btn-close' : 'btn-add'}`}
        >
          {showAdd ? 'Close' : 'Add Task'}
        </button>
        <button 
          onClick={onDeleteAll}
          className="btn btn-delete-all"
        >
          Delete All
        </button>
      </div>
    </header>
  );
};

export default Header;
