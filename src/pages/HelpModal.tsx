import React from 'react';
import { IonIcon } from '@ionic/react';
import { helpCircleOutline, closeOutline, chevronForwardOutline } from 'ionicons/icons';
import './HelpModal.css';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const helpItems = [
    { icon: '❓', title: 'FAQ', subtitle: 'Common questions answered' },
    { icon: '📖', title: 'User Guide', subtitle: 'Learn how to use SalinTayo' },
    { icon: '💬', title: 'Contact Support', subtitle: 'Talk to our team' },
    { icon: '🐛', title: 'Report a Bug', subtitle: 'Help us improve the app' },
    { icon: '⭐', title: 'Rate SalinTayo', subtitle: 'Share your feedback' },
  ];

  return (
    <>
      <div className="help-backdrop" onClick={onClose} />
      <div className="help-sheet" role="dialog" aria-modal="true">
        <div className="help-handle" />
        <div className="help-header">
          <button className="help-close-btn" onClick={onClose}>
            <IonIcon icon={closeOutline} />
          </button>
          <h2 className="help-title">Help Center</h2>
          <span></span>
        </div>
        <div className="help-body">
          <p className="help-subtitle">How can we help you?</p>
          <ul className="help-list">
            {helpItems.map((item, index) => (
              <li key={index} className="help-item">
                <div className="help-item-left">
                  <span className="help-item-icon">{item.icon}</span>
                  <div>
                    <div className="help-item-text">{item.title}</div>
                    <div className="help-item-sub">{item.subtitle}</div>
                  </div>
                </div>
                <IonIcon icon={chevronForwardOutline} className="help-item-chevron" />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
};

export default HelpModal;
