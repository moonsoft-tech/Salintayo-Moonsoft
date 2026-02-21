import React from 'react';
import { IonIcon } from '@ionic/react';
import { logOutOutline, closeOutline } from 'ionicons/icons';
import './LogoutModal.css';

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LogoutModal: React.FC<LogoutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <>
      <div className="logout-backdrop" onClick={onClose} />
      <div className="logout-sheet" role="dialog" aria-modal="true">
        <div className="logout-handle" />
        <div className="logout-body">
          <div className="logout-icon">👋</div>
          <h2 className="logout-title">Leaving so soon?</h2>
          <p className="logout-desc">
            Your learning progress and preferences will be saved. You can log back in anytime.
          </p>
          <div className="logout-actions">
            <button className="logout-confirm-btn" onClick={onClose}>Yes, Logout</button>
            <button className="logout-cancel-btn" onClick={onClose}>Cancel</button>
          </div>
        </div>
      </div>
    </>
  );
};

export default LogoutModal;
