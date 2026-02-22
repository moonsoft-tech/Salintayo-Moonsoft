import React, { useState, useRef, useEffect } from 'react';
import { IonIcon } from '@ionic/react';
import {
  closeOutline,
  flashOutline,
  cameraOutline,
  imageOutline,
  settingsOutline,
  chevronBackOutline,
} from 'ionicons/icons';
import './CameraModal.css';

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (imageData: string) => void;
  onOpenGallery: () => void;
}

const CameraModal: React.FC<CameraModalProps> = ({
  isOpen,
  onClose,
  onCapture,
  onOpenGallery,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [isFrontCamera, setIsFrontCamera] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isOpen, isFrontCamera]);

  const startCamera = async () => {
    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: isFrontCamera ? 'user' : 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      };
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const imageData = canvas.toDataURL('image/jpeg', 0.9);
        setCapturedImage(imageData);
        onCapture(imageData);
      }
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
  };

  const toggleFlash = () => {
    setFlashEnabled(!flashEnabled);
  };

  const toggleCamera = () => {
    setIsFrontCamera(!isFrontCamera);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="camera-backdrop" />
      <div className="camera-modal">
        {/* Top Bar */}
        <div className="camera-top-bar">
          <button className="camera-cancel-btn" onClick={onClose}>
            <IonIcon icon={closeOutline} />
            <span>Cancel</span>
          </button>
          <div className="camera-top-actions">
            <button
              className={`camera-action-btn ${flashEnabled ? 'active' : ''}`}
              onClick={toggleFlash}
              aria-label="Toggle flash"
            >
              <IonIcon icon={flashOutline} />
            </button>
            <button
              className="camera-action-btn"
              onClick={toggleCamera}
              aria-label="Flip camera"
            >
              <IonIcon icon={cameraOutline} />
            </button>
          </div>
        </div>

        {/* Camera Viewport */}
        <div className="camera-viewport">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="camera-video"
          />
          <canvas ref={canvasRef} style={{ display: 'none' }} />
          
          {/* Grid Overlay */}
          <div className="camera-grid">
            <div className="camera-grid-line" />
            <div className="camera-grid-line" />
            <div className="camera-grid-line camera-grid-line--vertical" />
            <div className="camera-grid-line camera-grid-line--vertical" />
          </div>
          
          {/* Instruction Text */}
          <div className="camera-instruction">
            <span className="camera-instruction-star">⭐</span>
            <span>Point at text to translate</span>
            <span className="camera-instruction-star">⭐</span>
          </div>
        </div>

        {/* Bottom Controls */}
        <div className="camera-bottom-bar">
          <button
            className="camera-gallery-btn"
            onClick={onOpenGallery}
            aria-label="Open gallery"
          >
            <IonIcon icon={imageOutline} />
          </button>
          
          <button
            className="camera-capture-btn"
            onClick={handleCapture}
            aria-label="Capture photo"
          >
            <div className="camera-capture-btn__outer">
              <div className="camera-capture-btn__inner">
                <IonIcon icon={cameraOutline} />
              </div>
            </div>
          </button>
          
          <button
            className="camera-settings-btn"
            aria-label="Camera settings"
          >
            <IonIcon icon={settingsOutline} />
          </button>
        </div>
      </div>
    </>
  );
};

export default CameraModal;
