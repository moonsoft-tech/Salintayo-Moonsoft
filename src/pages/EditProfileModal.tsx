import React from 'react';
import { IonIcon } from '@ionic/react';
import { personOutline, closeOutline } from 'ionicons/icons';
import './EditProfileModal.css';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <>
      <div className="editprofile-backdrop" onClick={onClose} />
      <div className="editprofile-sheet" role="dialog" aria-modal="true">
        <div className="editprofile-handle" />
        <div className="editprofile-header">
          <button className="editprofile-close-btn" onClick={onClose}>
            <IonIcon icon={closeOutline} />
          </button>
          <h2 className="editprofile-title">Edit Profile</h2>
          <button className="editprofile-save-btn" onClick={onClose}>Save</button>
        </div>
        <div className="editprofile-body">
          <div className="editprofile-avatar-section">
            <div className="editprofile-avatar">🧑</div>
            <button className="editprofile-change-photo">📷 Change Photo</button>
          </div>
          <div className="editprofile-form">
            <div className="editprofile-field">
              <label>Full Name</label>
              <input type="text" defaultValue="Juan Dela Cruz" />
            </div>
            <div className="editprofile-field">
              <label>Username</label>
              <input type="text" defaultValue="@Juan_Delu" />
            </div>
            <div className="editprofile-field">
              <label>Email</label>
              <input type="email" defaultValue="DelaCruz@email.com" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EditProfileModal;
