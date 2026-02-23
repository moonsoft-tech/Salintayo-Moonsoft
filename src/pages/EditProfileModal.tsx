import React, { useState } from 'react';
import { IonIcon } from '@ionic/react';
import {
  personCircleOutline,
  createOutline,
  closeOutline,
  cameraOutline,
  mailOutline,
  callOutline,
  textOutline,
} from 'ionicons/icons';
import './EditProfileModal.css';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    displayName: string;
    email: string;
    phone: string;
    bio: string;
  }) => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [displayName, setDisplayName] = useState('Juan Dela Cruz');
  const [email, setEmail] = useState('juan.delacruz@example.com');
  const [phone, setPhone] = useState('+63 912 345 6789');
  const [bio, setBio] = useState('I am learning Cebuano to connect with my family and culture.');

  if (!isOpen) return null;

  const handleSave = () => {
    onSave({
      displayName,
      email,
      phone,
      bio,
    });
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <>
      <div className="editprofile-backdrop" onClick={handleBackdropClick} />
      <div className="editprofile-sheet" role="dialog" aria-modal="true">
        <div className="editprofile-handle" />
        
        {/* Header */}
        <div className="editprofile-header">
          <button className="editprofile-close-btn" onClick={onClose}>
            <IonIcon icon={closeOutline} />
          </button>
          <h2 className="editprofile-title">Edit Profile</h2>
          <button className="editprofile-save-btn" onClick={handleSave}>
            Save
          </button>
        </div>

        {/* Body */}
        <div className="editprofile-body">
          {/* Profile Photo Section */}
          <div className="editprofile-photo-section">
            <div className="editprofile-avatar-wrap">
              <div className="editprofile-avatar-bg" aria-hidden />
              <IonIcon icon={personCircleOutline} className="editprofile-avatar-icon" aria-hidden />
            </div>
            <button type="button" className="editprofile-photo-btn">
              <IonIcon icon={cameraOutline} />
              <span>Change Photo</span>
            </button>
          </div>

          {/* Form Fields */}
          <div className="editprofile-form">
            {/* Display Name */}
            <div className="editprofile-field">
              <label htmlFor="displayName" className="editprofile-label">
                Display Name
              </label>
              <div className="editprofile-input-wrap">
                <IonIcon icon={personCircleOutline} className="editprofile-input-icon" />
                <input
                  type="text"
                  id="displayName"
                  className="editprofile-input"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Enter your name"
                />
              </div>
            </div>

            {/* Email */}
            <div className="editprofile-field">
              <label htmlFor="email" className="editprofile-label">
                Email
              </label>
              <div className="editprofile-input-wrap">
                <IonIcon icon={mailOutline} className="editprofile-input-icon" />
                <input
                  type="email"
                  id="email"
                  className="editprofile-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                />
              </div>
            </div>

            {/* Phone */}
            <div className="editprofile-field">
              <label htmlFor="phone" className="editprofile-label">
                Phone Number <span className="editprofile-optional">(Optional)</span>
              </label>
              <div className="editprofile-input-wrap">
                <IonIcon icon={callOutline} className="editprofile-input-icon" />
                <input
                  type="tel"
                  id="phone"
                  className="editprofile-input"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter your phone number"
                />
              </div>
            </div>

            {/* Bio */}
            <div className="editprofile-field">
              <label htmlFor="bio" className="editprofile-label">
                Bio <span className="editprofile-optional">(Optional)</span>
              </label>
              <div className="editprofile-textarea-wrap">
                <IonIcon icon={textOutline} className="editprofile-textarea-icon" />
                <textarea
                  id="bio"
                  className="editprofile-textarea"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us about yourself..."
                  rows={4}
                  maxLength={200}
                />
              </div>
              <span className="editprofile-char-count">{bio.length}/200</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="editprofile-actions">
            <button
              type="button"
              className="editprofile-cancel-btn"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="button"
              className="editprofile-confirm-btn"
              onClick={handleSave}
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default EditProfileModal;
