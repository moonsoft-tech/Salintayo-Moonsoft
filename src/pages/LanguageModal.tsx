import React from 'react';
import { IonIcon } from '@ionic/react';
import { globeOutline, closeOutline, checkmarkOutline } from 'ionicons/icons';
import './LanguageModal.css';

interface LanguageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LanguageModal: React.FC<LanguageModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <>
      <div className="language-backdrop" onClick={onClose} />
      <div className="language-sheet" role="dialog" aria-modal="true">
        <div className="language-handle" />
        <div className="language-header">
          <button className="language-close-btn" onClick={onClose}>
            <IonIcon icon={closeOutline} />
          </button>
          <h2 className="language-title">Language & Region</h2>
          <button className="language-save-btn" onClick={onClose}>Save</button>
        </div>
        <div className="language-body">
          <div className="language-field">
            <label>Country</label>
            <div className="language-value">🇵🇭 Philippines <span>›</span></div>
          </div>
          <div className="language-field">
            <label>Region/City</label>
            <div className="language-value">Cebu City, Central Visayas <span>›</span></div>
          </div>
          <div className="language-field">
            <label>Native Language</label>
            <div className="language-value">Cebuano <span>›</span></div>
          </div>
          <div className="language-section">
            <label>Learning Goal</label>
            <div className="language-goals">
              <div className="language-goal">🎒 Travel & Tourism</div>
              <div className="language-goal language-goal--selected">
                ✅ Tagalog <span className="language-tag">Active</span>
              </div>
              <div className="language-goal">🎓 Education</div>
              <div className="language-goal">💼 Business</div>
              <div className="language-goal">❤️ Cultural Interest</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LanguageModal;
