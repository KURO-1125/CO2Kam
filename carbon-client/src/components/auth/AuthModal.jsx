import React, { useState } from 'react';
import Login from './Login';
import SignUp from './SignUp';
import './Auth.css';

const AuthModal = ({ isOpen, onClose, initialMode = 'login' }) => {
  const [mode, setMode] = useState(initialMode); // 'login' or 'signup'

  const toggleMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          ×
        </button>
        {mode === 'login' ? (
          <Login onToggleMode={toggleMode} onClose={onClose} />
        ) : (
          <SignUp onToggleMode={toggleMode} onClose={onClose} />
        )}
      </div>
    </div>
  );
};

export default AuthModal;