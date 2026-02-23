import React from 'react';
import { IonIcon } from '@ionic/react';
import {
  cameraOutline,
  imageOutline,
  documentOutline,
  micOutline,
  locationOutline,
  closeOutline,
} from 'ionicons/icons';
import './AttachmentModal.css';

interface AttachmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAttachmentSelect: (type: 'camera' | 'gallery' | 'document' | 'voice' | 'location') => void;
}

interface AttachmentOption {
  id: 'camera' | 'gallery' | 'document' | 'voice' | 'location';
  icon: React.ComponentProps<typeof IonIcon>['icon'];
  label: string;
  description: string;
}

const ATTACHMENT_OPTIONS: AttachmentOption[] = [
  {
    id: 'camera',
    icon: cameraOutline,
    label: '📷 Camera',
    description: 'Take a photo to translate',
  },
  {
    id: 'gallery',
    icon: imageOutline,
    label: '🖼️ Photo & Video Library',
    description: 'Choose from your gallery',
  },
  {
    id: 'document',
    icon: documentOutline,
    label: '📎 Document',
    description: 'PDF, Word, or text files',
  },
  {
    id: 'voice',
    icon: micOutline,
    label: '🎤 Voice Recording',
    description: 'Record audio for translation',
  },
  {
    id: 'location',
    icon: locationOutline,
    label: '📍 Location',
    description: 'Share your location for context',
  },
];

const AttachmentModal: React.FC<AttachmentModalProps> = ({
  isOpen,
  onClose,
  onAttachmentSelect,
}) => {
  if (!isOpen) return null;

  const handleOptionClick = (type: AttachmentOption['id']) => {
    onAttachmentSelect(type);
    onClose();
  };

  return (
    <>
      <div className="attachment-backdrop" onClick={onClose} />
      <div className="attachment-sheet" role="dialog" aria-modal="true">
        <div className="attachment-handle" />
        <div className="attachment-header">
          <h2 className="attachment-title">Attach File or Media</h2>
          <button className="attachment-close-btn" onClick={onClose} aria-label="Close">
            <IonIcon icon={closeOutline} />
          </button>
        </div>
        <div className="attachment-options">
          {ATTACHMENT_OPTIONS.map((option) => (
            <button
              key={option.id}
              className="attachment-option"
              onClick={() => handleOptionClick(option.id)}
              aria-label={option.label}
            >
              <div className="attachment-option__icon-wrap">
                <IonIcon icon={option.icon} className="attachment-option__icon" />
              </div>
              <div className="attachment-option__text">
                <span className="attachment-option__label">{option.label}</span>
                <span className="attachment-option__desc">{option.description}</span>
              </div>
            </button>
          ))}
        </div>
        <div className="attachment-cancel-wrap">
          <button className="attachment-cancel-btn" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </>
  );
};

export default AttachmentModal;
