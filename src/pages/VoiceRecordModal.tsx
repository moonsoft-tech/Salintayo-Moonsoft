import React, { useState, useRef, useEffect } from 'react';
import { IonIcon } from '@ionic/react';
import {
  micOutline,
  closeOutline,
  checkmarkOutline,
  playOutline,
  pauseOutline,
  trashOutline,
  volumeHighOutline,
} from 'ionicons/icons';
import './VoiceRecordModal.css';

interface VoiceRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendVoice: (audioBlob: Blob, caption: string) => void;
}

type VoiceState = 'idle' | 'recording' | 'preview';

const VoiceRecordModal: React.FC<VoiceRecordModalProps> = ({
  isOpen,
  onClose,
  onSendVoice,
}) => {
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [caption, setCaption] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        setVoiceState('preview');
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setVoiceState('recording');
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= 60) {
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const cancelRecording = () => {
    stopRecording();
    setAudioBlob(null);
    setRecordingTime(0);
    setCaption('');
    setVoiceState('idle');
    onClose();
  };

  const deleteRecording = () => {
    setAudioBlob(null);
    setRecordingTime(0);
    setCaption('');
    setVoiceState('idle');
  };

  const playPreview = () => {
    if (!audioBlob) return;

    if (!audioRef.current) {
      audioRef.current = new Audio(URL.createObjectURL(audioBlob));
      audioRef.current.onended = () => setIsPlaying(false);
    }

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const sendVoice = () => {
    if (audioBlob) {
      onSendVoice(audioBlob, caption);
      deleteRecording();
      onClose();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="voice-backdrop" onClick={cancelRecording} />
      <div className="voice-sheet" role="dialog" aria-modal="true">
        {voiceState === 'idle' && (
          <>
            <div className="voice-handle" />
            <div className="voice-header">
              <h2 className="voice-title">Voice Recording</h2>
              <button className="voice-close-btn" onClick={cancelRecording} aria-label="Close">
                <IonIcon icon={closeOutline} />
              </button>
            </div>
            <div className="voice-body voice-body--idle">
              <div className="voice-mic-container">
                <button 
                  className="voice-mic-btn" 
                  onClick={startRecording}
                  aria-label="Start recording"
                >
                  <IonIcon icon={micOutline} className="voice-mic-icon" />
                </button>
                <p className="voice-hint">Tap to start recording</p>
              </div>
            </div>
          </>
        )}

        {voiceState === 'recording' && (
          <>
            <div className="voice-handle" />
            <div className="voice-header">
              <h2 className="voice-title">Recording...</h2>
            </div>
            <div className="voice-body voice-body--recording">
              <div className="voice-recording-indicator">
                <span className="voice-recording-dot">●</span>
                <span className="voice-recording-text">RECORDING</span>
              </div>
              <div className="voice-timer">
                <span className="voice-timer-value">{formatTime(recordingTime)}</span>
              </div>
              <div className="voice-waveform">
                <div className="voice-waveform-bar"></div>
                <div className="voice-waveform-bar"></div>
                <div className="voice-waveform-bar"></div>
                <div className="voice-waveform-bar"></div>
                <div className="voice-waveform-bar"></div>
                <div className="voice-waveform-bar"></div>
                <div className="voice-waveform-bar"></div>
                <div className="voice-waveform-bar"></div>
              </div>
              <div className="voice-actions">
                <button className="voice-action-btn voice-action-btn--cancel" onClick={cancelRecording}>
                  <IonIcon icon={closeOutline} />
                  <span>Cancel</span>
                </button>
                <button className="voice-action-btn voice-action-btn--stop" onClick={stopRecording}>
                  <IonIcon icon={checkmarkOutline} />
                  <span>Done</span>
                </button>
              </div>
            </div>
          </>
        )}

        {voiceState === 'preview' && (
          <>
            <div className="voice-handle" />
            <div className="voice-header">
              <h2 className="voice-title">Voice Message Ready</h2>
              <button className="voice-close-btn" onClick={cancelRecording} aria-label="Close">
                <IonIcon icon={closeOutline} />
              </button>
            </div>
            <div className="voice-body voice-body--preview">
              <div className="voice-preview-card">
                <div className="voice-preview-icon">
                  <IonIcon icon={volumeHighOutline} />
                </div>
                <div className="voice-preview-info">
                  <span className="voice-preview-label">Voice Message</span>
                  <span className="voice-preview-duration">{formatTime(recordingTime)}</span>
                </div>
                <button className="voice-play-btn" onClick={playPreview}>
                  <IonIcon icon={isPlaying ? pauseOutline : playOutline} />
                </button>
              </div>
              <div className="voice-caption-field">
                <label className="voice-caption-label">Add caption (optional):</label>
                <input
                  type="text"
                  className="voice-caption-input"
                  placeholder="What is this phrase in..."
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                />
              </div>
              <div className="voice-actions">
                <button className="voice-action-btn voice-action-btn--delete" onClick={deleteRecording}>
                  <IonIcon icon={trashOutline} />
                  <span>Delete</span>
                </button>
                <button className="voice-action-btn voice-action-btn--send" onClick={sendVoice}>
                  <IonIcon icon={checkmarkOutline} />
                  <span>Send</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default VoiceRecordModal;
