import React, { useState } from 'react';
import { IonIcon } from '@ionic/react';
import {
  closeOutline,
  checkmarkOutline,
  sendOutline,
  starOutline,
  volumeHighOutline,
} from 'ionicons/icons';
import './ImagePreviewModal.css';

interface ImagePreviewModalProps {
  isOpen: boolean;
  imageData: string | null;
  onClose: () => void;
  onRetake: () => void;
  onSend: (caption: string, option: 'ocr' | 'describe' | 'ask') => void;
}

type TranslationOption = 'ocr' | 'describe' | 'ask';

const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({
  isOpen,
  imageData,
  onClose,
  onRetake,
  onSend,
}) => {
  const [caption, setCaption] = useState('');
  const [selectedOption, setSelectedOption] = useState<TranslationOption>('ocr');

  if (!isOpen || !imageData) return null;

  const handleSend = () => {
    onSend(caption, selectedOption);
    setCaption('');
    setSelectedOption('ocr');
  };

  const handleClose = () => {
    setCaption('');
    setSelectedOption('ocr');
    onClose();
  };

  return (
    <>
      <div className="preview-backdrop" onClick={handleClose} />
      <div className="preview-modal">
        {/* Top Bar */}
        <div className="preview-top-bar">
          <button className="preview-retake-btn" onClick={onRetake}>
            <IonIcon icon={closeOutline} />
            <span>Retake</span>
          </button>
          <button className="preview-use-btn" onClick={handleSend}>
            <IonIcon icon={checkmarkOutline} />
            <span>Use Photo</span>
          </button>
        </div>

        {/* Image Preview */}
        <div className="preview-image-container">
          <img src={imageData} alt="Captured" className="preview-image" />
          
          {/* Star Accents */}
          <div className="preview-star preview-star--tl">⭐</div>
          <div className="preview-star preview-star--tr">⭐</div>
          <div className="preview-star preview-star--bl">⭐</div>
          <div className="preview-star preview-star--br">⭐</div>
        </div>

        {/* Caption Input */}
        <div className="preview-caption-container">
          <input
            type="text"
            className="preview-caption-input"
            placeholder="Add a caption or question..."
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
          />
          <span className="preview-caption-star">⭐</span>
        </div>

        {/* Translation Options */}
        <div className="preview-options">
          <p className="preview-options-title">Translation options:</p>
          
          <label className={`preview-option ${selectedOption === 'ocr' ? 'preview-option--selected' : ''}`}>
            <input
              type="radio"
              name="translationOption"
              checked={selectedOption === 'ocr'}
              onChange={() => setSelectedOption('ocr')}
            />
            <span className="preview-option-radio" />
            <span className="preview-option-text">Translate text in image (OCR)</span>
          </label>
          
          <label className={`preview-option ${selectedOption === 'describe' ? 'preview-option--selected' : ''}`}>
            <input
              type="radio"
              name="translationOption"
              checked={selectedOption === 'describe'}
              onChange={() => setSelectedOption('describe')}
            />
            <span className="preview-option-radio" />
            <span className="preview-option-text">Describe image</span>
          </label>
          
          <label className={`preview-option ${selectedOption === 'ask' ? 'preview-option--selected' : ''}`}>
            <input
              type="radio"
              name="translationOption"
              checked={selectedOption === 'ask'}
              onChange={() => setSelectedOption('ask')}
            />
            <span className="preview-option-radio" />
            <span className="preview-option-text">Ask about image content</span>
          </label>
        </div>

        {/* Send Button */}
        <div className="preview-send-container">
          <button className="preview-send-btn" onClick={handleSend}>
            <IonIcon icon={sendOutline} />
            <span>Send to AI Tutor</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default ImagePreviewModal;
